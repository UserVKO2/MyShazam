import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    X,
    ListMusic,
    Plus,
    Play,
    Pause,
} from "lucide-react";

import api from "../services/api";

export default function Home() {
    const navigate = useNavigate();

    const [url, setUrl] = useState("");
    const [user, setUser] = useState(null);
    const [playlists, setPlaylists] = useState([]);

    const [backendStatus, setBackendStatus] = useState("checking");
    const [loading, setLoading] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [playlistLoading, setPlaylistLoading] = useState(false);
    const [error, setError] = useState("");

    const [result, setResult] = useState(null);
    const [audioUrl, setAudioUrl] = useState("");
    const [playlistModalOpen, setPlaylistModalOpen] =
        useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(null);

    useEffect(() => {
        checkBackend();
        loadUser();
        loadPlaylists();
    }, []);

    useEffect(() => {
        if (!result?.id) {
            return;
        }

        let cancelled = false;
        let objectUrl = "";

        const loadAudio = async () => {
            setAudioLoading(true);
            setError("");
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);

            try {
                const response = await api.get(
                    `/downloads/${result.id}/file`,
                    {
                        responseType: "blob",
                    },
                );

                if (cancelled) {
                    return;
                }

                objectUrl = window.URL.createObjectURL(
                    response.data,
                );

                setAudioUrl(objectUrl);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                setAudioUrl("");

                setError(
                    err?.response?.data?.message ||
                        "Не удалось загрузить аудио для прослушивания",
                );
            } finally {
                if (!cancelled) {
                    setAudioLoading(false);
                }
            }
        };

        loadAudio();

        return () => {
            cancelled = true;

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeAttribute("src");
                audioRef.current.load();
            }

            if (objectUrl) {
                window.URL.revokeObjectURL(objectUrl);
            }

            setAudioUrl("");
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        };
    }, [result?.id]);

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        if (!audioUrl) {
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
            return;
        }

        audio.src = audioUrl;
        audio.load();
    }, [audioUrl]);

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
        setAudioLoading(false);
        setError("");
        setResult(null);
        setAudioUrl("");
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

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

    const handleClear = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeAttribute("src");
            audioRef.current.load();
        }

        setUrl("");
        setResult(null);
        setAudioUrl("");
        setError("");
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    };

    const handlePlayPause = async () => {
        const audio = audioRef.current;

        if (!audio || !audioUrl) {
            return;
        }

        try {
            if (audio.paused) {
                await audio.play();
            } else {
                audio.pause();
            }
        } catch (err) {
            console.error("Audio playback error:", err);

            setError("Не удалось воспроизвести аудио");
        }
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) {
            return;
        }

        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) {
            return;
        }

        setDuration(audioRef.current.duration || 0);
    };

    const handleAudioPlay = () => {
        setIsPlaying(true);
    };

    const handleAudioPause = () => {
        setIsPlaying(false);
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const handleProgressClick = (event) => {
        const audio = audioRef.current;

        if (!audio || !duration) {
            return;
        }

        const rect =
            event.currentTarget.getBoundingClientRect();

        const clickPosition =
            event.clientX - rect.left;

        const percentage = Math.min(
            Math.max(clickPosition / rect.width, 0),
            1,
        );

        audio.currentTime = percentage * duration;
        setCurrentTime(audio.currentTime);
    };

    const handleGetFile = async (downloadId) => {
        try {
            setError("");

            let blobUrl = audioUrl;

            if (!blobUrl) {
                const response = await api.get(
                    `/downloads/${downloadId}/file`,
                    {
                        responseType: "blob",
                    },
                );

                blobUrl = window.URL.createObjectURL(
                    response.data,
                );
            }

            const link = document.createElement("a");

            link.href = blobUrl;
            link.download = `tynda-${downloadId}.mp3`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            if (!audioUrl) {
                window.URL.revokeObjectURL(blobUrl);
            }
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
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Не удалось добавить трек в плейлист",
            );
        } finally {
            setPlaylistLoading(false);
        }
    };

    const formatTime = (time) => {
        if (!Number.isFinite(time) || time < 0) {
            return "0:00";
        }

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    };

    const progressPercentage =
        duration > 0
            ? Math.min(
                  Math.max(
                      (currentTime / duration) * 100,
                      0,
                  ),
                  100,
              )
            : 0;

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
            <audio
                ref={audioRef}
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={handleAudioPlay}
                onPause={handleAudioPause}
                onEnded={handleAudioEnded}
            />

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
                            <div className="relative w-full min-w-0">
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
                                    className="box-border h-[50px] min-h-[50px] w-full min-w-0 appearance-none rounded-none border border-white bg-transparent px-4 pr-12 text-sm leading-normal text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
                                />

                                {url && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        aria-label="Очистить"
                                        className="absolute right-0 top-0 flex h-[50px] w-[50px] items-center justify-center border-0 bg-transparent text-white/50 transition-colors hover:text-[var(--color-accent)]"
                                    >
                                        <X
                                            size={20}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                )}
                            </div>

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
                            <div className="mt-4">
                                <div className="border border-white/20 p-4">
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

                                        {result.source && (
                                            <div className="mt-1 text-xs uppercase tracking-wider text-white/40">
                                                {result.source}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {(audioLoading || audioUrl) && (
                                    <div className="mt-4 border border-white/20 bg-black px-4 py-3">
                                        {audioLoading && (
                                            <div className="flex min-h-[45px] items-center text-sm text-white/60">
                                                Загружаем аудио...
                                            </div>
                                        )}

                                        {!audioLoading && audioUrl && (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handlePlayPause}
                                                    aria-label={
                                                        isPlaying
                                                            ? "Пауза"
                                                            : "Воспроизвести"
                                                    }
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[var(--color-accent)] outline-none transition-transform hover:scale-110"
                                                >
                                                    {isPlaying ? (
                                                        <Pause
                                                            size={22}
                                                            strokeWidth={2.5}
                                                            fill="currentColor"
                                                        />
                                                    ) : (
                                                        <Play
                                                            size={22}
                                                            strokeWidth={2.5}
                                                            fill="currentColor"
                                                        />
                                                    )}
                                                </button>

                                                <div className="min-w-0 flex-1">
                                                    <div
                                                        onClick={
                                                            handleProgressClick
                                                        }
                                                        className="h-[3px] w-full cursor-pointer bg-white/15"
                                                    >
                                                        <div
                                                            className="h-full bg-[var(--color-accent)] transition-[width] duration-100"
                                                            style={{
                                                                width: `${progressPercentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-xs font-medium tabular-nums text-[var(--color-accent)]">
                                                    {formatTime(currentTime)}{" "}
                                                    /{" "}
                                                    {formatTime(duration)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    {result.id && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleGetFile(result.id)
                                            }
                                            disabled={audioLoading}
                                            className="rounded-none border border-white bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
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