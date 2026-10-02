import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    House,
    User,
    Settings,
    LogOut,
    ListMusic,
    Plus,
} from "lucide-react";
import api from "../services/api";

export default function Home() {
    const navigate = useNavigate();

    const [url, setUrl] = useState("");
    const [user, setUser] = useState(null);
    const [playlists, setPlaylists] = useState([]);

    const [backendStatus, setBackendStatus] = useState("checking");
    const [loading, setLoading] = useState(false);
    const [playlistLoading, setPlaylistLoading] = useState(false);
    const [error, setError] = useState("");

    const [result, setResult] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [playlistModalOpen, setPlaylistModalOpen] = useState(false);

    useEffect(() => {
        checkBackend();
        loadUser();
        loadPlaylists();
    }, []);

    const checkBackend = async () => {
        try {
            await api.get("/health");
            setBackendStatus("online");
        } catch {
            setBackendStatus("offline");
        }
    };

    const loadUser = async () => {
        try {
            const response = await api.get("/user");
            setUser(response.data);
        } catch {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    const loadPlaylists = async () => {
        try {
            const response = await api.get("/playlists");
            setPlaylists(response.data);
        } catch (err) {
            console.error("Playlists loading error:", err);
        }
    };

    const handleSearch = async () => {
        const cleanUrl = url.trim();

        if (!cleanUrl) {
            setError("Введите ссылку");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await api.post("/download", {
                url: cleanUrl,
            });

            setResult(response.data);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Не удалось обработать ссылку",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGetFile = async (downloadId) => {
        try {
            setError("");

            const response = await api.get(
                `/downloads/${downloadId}/file`,
                {
                    responseType: "blob",
                },
            );

            const blobUrl = window.URL.createObjectURL(
                response.data,
            );

            const link = document.createElement("a");

            link.href = blobUrl;
            link.download = `tynda-${downloadId}.mp3`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);

            setUrl("");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Не удалось скачать файл",
            );
        }
    };

    const openPlaylistModal = async () => {
        setError("");
        setPlaylistLoading(true);

        try {
            const response = await api.get("/playlists");
            setPlaylists(response.data);
            setPlaylistModalOpen(true);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Не удалось загрузить плейлисты",
            );
        } finally {
            setPlaylistLoading(false);
        }
    };

    const closePlaylistModal = () => {
        if (!playlistLoading) {
            setPlaylistModalOpen(false);
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        if (!result?.id) {
            return;
        }

        setPlaylistLoading(true);
        setError("");

        try {
            await api.post(
                `/playlists/${playlistId}/tracks`,
                {
                    download_id: result.id,
                },
            );

            setPlaylistModalOpen(false);
            setUrl("");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Не удалось добавить трек в плейлист",
            );
        } finally {
            setPlaylistLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch {
            // Ignore logout API errors.
        }

        localStorage.removeItem("token");
        setMenuOpen(false);
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
            {/* Header */}
            <header className="border-b border-[var(--color-border)]">
                <div className="mx-auto flex min-h-[64px] max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-6">
                    <Link
                        to="/"
                        className="text-xl font-bold tracking-wide text-white no-underline"
                    >
                        Tynda.kz
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Открыть меню"
                        className="flex items-center justify-center border-0 bg-transparent p-2 text-white outline-none transition-colors hover:text-[var(--color-accent)]"
                    >
                        <Menu
                            size={27}
                            strokeWidth={1.5}
                        />
                    </button>
                </div>
            </header>

            {/* Overlay */}
            <div
                onClick={() => setMenuOpen(false)}
                className={`fixed inset-0 z-40 bg-black/70 transition-opacity duration-300 ${
                    menuOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
            />

            {/* Side Menu */}
            <aside
                className={`fixed right-0 top-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)]/60 transition-transform duration-300 ease-out ${
                    menuOpen
                        ? "translate-x-0"
                        : "translate-x-full"
                }`}
            >
                <div className="relative flex min-h-[64px] items-center justify-center border-b border-[var(--color-border)]">
                    <span className="text-base font-semibold uppercase tracking-[0.2em] text-white">
                        Menu
                    </span>

                    <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Закрыть меню"
                        className="absolute right-4 top-1/2 -translate-y-1/2 border-0 bg-transparent p-2 text-white outline-none transition-colors hover:text-[var(--color-accent)]"
                    >
                        <X
                            size={25}
                            strokeWidth={1.5}
                        />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col">
                    <div className="flex flex-1 flex-col items-center justify-center gap-9">
                        <Link
                            to="/"
                            onClick={() => setMenuOpen(false)}
                            className="group flex items-center gap-3 text-base font-medium uppercase tracking-wider text-white no-underline transition-colors hover:text-[var(--color-accent)]"
                        >
                            <House
                                size={20}
                                strokeWidth={1.5}
                            />

                            <span>Главная</span>
                        </Link>

                        <Link
                            to="/profile"
                            onClick={() => setMenuOpen(false)}
                            className="group flex items-center gap-3 text-base font-medium uppercase tracking-wider text-white no-underline transition-colors hover:text-[var(--color-accent)]"
                        >
                            <User
                                size={20}
                                strokeWidth={1.5}
                            />

                            <span>Профиль</span>
                        </Link>

                        <Link
                            to="/settings"
                            onClick={() => setMenuOpen(false)}
                            className="group flex items-center gap-3 text-base font-medium uppercase tracking-wider text-white no-underline transition-colors hover:text-[var(--color-accent)]"
                        >
                            <Settings
                                size={20}
                                strokeWidth={1.5}
                            />

                            <span>Настройки</span>
                        </Link>
                    </div>

                    <div className="flex justify-center border-t border-[var(--color-border)] py-7">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="group flex items-center gap-3 border-0 bg-transparent p-2 text-base font-medium uppercase tracking-wider text-white outline-none transition-colors hover:text-[var(--color-accent)]"
                        >
                            <LogOut
                                size={20}
                                strokeWidth={1.5}
                            />

                            <span>Выйти</span>
                        </button>
                    </div>
                </nav>
            </aside>

            <main className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 sm:py-12">
                <section className="mx-auto w-full max-w-[850px]">
                    <div className="mb-8 text-center">
                        <h1 className="m-0 text-3xl font-bold text-white sm:text-4xl">
                            Tynda.kz
                        </h1>

                        <p className="mt-3 text-sm text-[var(--color-text-muted)] sm:text-base">
                            Download and manage your music
                        </p>
                    </div>

                    {user && (
                        <div className="mb-6 border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                            <div className="text-sm text-[var(--color-text-muted)]">
                                Logged in as
                            </div>

                            <div className="mt-1 text-base font-semibold text-white">
                                {user.name || user.email}
                            </div>

                            {user.email && (
                                <div className="mt-1 text-sm text-[var(--color-text-muted)]">
                                    {user.email}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6">
                        <div className="flex w-full flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                value={url}
                                onChange={(event) =>
                                    setUrl(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Вставьте ссылку для поиска"
                                className="box-border h-[50px] min-h-[50px] w-full min-w-0 appearance-none rounded-none border border-white bg-transparent px-4 text-sm leading-normal text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
                            />

                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={loading}
                                className="box-border h-[50px] min-h-[50px] w-full shrink-0 rounded-none border border-white bg-transparent px-5 text-sm font-semibold leading-none text-white transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[140px]"
                            >
                                {loading ? "Поиск..." : "Поиск"}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-4 border border-[#ff6b6b] bg-transparent p-3 text-sm text-[#ff6b6b]">
                                {error}
                            </div>
                        )}

                        {result && (
                            <div className="mt-4 p-4">
                                <div className="mb-4">
                                    <div className="text-sm font-semibold text-white">
                                        {result.title ||
                                            result.name ||
                                            "Песня найдена"}
                                    </div>

                                    {result.artist && (
                                        <div className="mt-1 text-sm text-[var(--color-text-muted)]">
                                            {result.artist}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    {result.id && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleGetFile(result.id)
                                            }
                                            className="rounded-none border border-white bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[var(--color-accent)]"
                                        >
                                            Скачать
                                        </button>
                                    )}

                                    {result.id && (
                                        <button
                                            type="button"
                                            onClick={openPlaylistModal}
                                            disabled={playlistLoading}
                                            className="rounded-none border border-white bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {playlistLoading
                                                ? "Загрузка..."
                                                : "Добавить в мой плейлист"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                            <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                                Backend
                            </div>

                            <div className="mt-2 text-sm font-semibold text-white">
                                {backendStatus === "online"
                                    ? "Online"
                                    : backendStatus === "offline"
                                      ? "Offline"
                                      : "Checking..."}
                            </div>
                        </div>

                        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                            <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                                Search
                            </div>

                            <div className="mt-2 text-sm font-semibold text-white">
                                Automatic
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Tynda.kz — your personal music workspace
                        </p>
                    </div>
                </section>
            </main>

            {/* Playlist modal */}
            {playlistModalOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"
                    onClick={closePlaylistModal}
                >
                    <div
                        className="w-full max-w-md border border-white/70 bg-[var(--color-bg)] p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold uppercase tracking-[0.1em]">
                                Добавить в плейлист
                            </h2>

                            <button
                                type="button"
                                onClick={closePlaylistModal}
                                className="flex h-9 w-9 items-center justify-center border border-white/60 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {playlists.length === 0 ? (
                            <div className="text-center">
                                <ListMusic
                                    size={40}
                                    className="mx-auto mb-4 text-white/50"
                                />

                                <p className="text-sm text-white/60">
                                    У тебя пока нет плейлистов.
                                </p>

                                <Link
                                    to="/profile"
                                    onClick={() =>
                                        setPlaylistModalOpen(false)
                                    }
                                    className="mt-5 inline-flex items-center gap-2 border border-white/70 px-4 py-3 text-sm uppercase tracking-[0.08em] text-white no-underline transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                                >
                                    <Plus size={17} />
                                    Создать плейлист
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {playlists.map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        type="button"
                                        onClick={() =>
                                            handleAddToPlaylist(
                                                playlist.id,
                                            )
                                        }
                                        disabled={playlistLoading}
                                        className="flex w-full items-center gap-4 border border-white/70 bg-transparent p-4 text-left transition hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/50">
                                            <ListMusic size={20} />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="truncate font-semibold text-white">
                                                {playlist.name}
                                            </div>

                                            <div className="mt-1 text-xs text-white/40">
                                                {playlist.downloads_count ?? 0}{" "}
                                                треков
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={closePlaylistModal}
                            className="mt-5 h-11 w-full border border-white/60 bg-transparent text-sm uppercase tracking-[0.08em] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}