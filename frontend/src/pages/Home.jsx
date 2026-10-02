import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Home() {
    const navigate = useNavigate();

    const [url, setUrl] = useState("");
    const [source, setSource] = useState("youtube");
    const [user, setUser] = useState(null);
    const [backendStatus, setBackendStatus] = useState("checking");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        checkBackend();
        loadUser();
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

    const handleDownload = async () => {
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
                source,
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
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Не удалось скачать файл",
            );
        }
    };

    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch {
            // Ignore logout API errors.
        }

        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
            <header className="border-b border-[var(--color-border)]">
                <div className="mx-auto flex min-h-[64px] max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-6">
                    <Link
                        to="/"
                        className="text-xl font-bold tracking-wide text-white no-underline"
                    >
                        Tynda.kz
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/"
                            className="rounded-none border border-white bg-transparent px-4 py-2 text-sm text-white no-underline transition-colors hover:border-[var(--color-accent)]"
                        >
                            Home
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-none border border-white bg-transparent px-4 py-2 text-sm text-white transition-colors hover:border-[var(--color-accent)]"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

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
                        <div className="mb-4 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setSource("youtube")}
                                className={`rounded-none border px-4 py-2 text-sm font-medium transition-colors ${
                                    source === "youtube"
                                        ? "border-[var(--color-accent)] bg-transparent text-white"
                                        : "border-white bg-transparent text-white hover:border-[var(--color-accent)]"
                                }`}
                            >
                                YouTube
                            </button>

                            <button
                                type="button"
                                onClick={() => setSource("tiktok")}
                                className={`rounded-none border px-4 py-2 text-sm font-medium transition-colors ${
                                    source === "tiktok"
                                        ? "border-[var(--color-accent)] bg-transparent text-white"
                                        : "border-white bg-transparent text-white hover:border-[var(--color-accent)]"
                                }`}
                            >
                                TikTok
                            </button>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                value={url}
                                onChange={(event) =>
                                    setUrl(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleDownload();
                                    }
                                }}
                                placeholder={
                                    source === "youtube"
                                        ? "Paste YouTube URL..."
                                        : "Paste TikTok URL..."
                                }
                                className="box-border h-[50px] min-h-[50px] w-full min-w-0 appearance-none rounded-none border border-white bg-transparent px-4 text-sm leading-normal text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
                            />

                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={loading}
                                className="box-border h-[50px] min-h-[50px] w-full shrink-0 rounded-none border border-white bg-transparent px-5 text-sm font-semibold leading-none text-white transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[140px]"
                            >
                                {loading ? "Loading..." : "Download"}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-4 border border-[#ff6b6b] bg-transparent p-3 text-sm text-[#ff6b6b]">
                                {error}
                            </div>
                        )}

                        {result && (
                            <div className="mt-4 border border-[var(--color-border)] p-4">
                                <div className="mb-3 text-sm font-semibold text-white">
                                    Result
                                </div>

                                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-[var(--color-text-muted)]">
                                    {JSON.stringify(result, null, 2)}
                                </pre>

                                {result.id && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleGetFile(result.id)
                                        }
                                        className="mt-4 rounded-none border border-white bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[var(--color-accent)]"
                                    >
                                        Download MP3
                                    </button>
                                )}
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
                                Source
                            </div>

                            <div className="mt-2 text-sm font-semibold capitalize text-white">
                                {source}
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
        </div>
    );
}