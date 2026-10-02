import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

function Home() {
    const navigate = useNavigate()

    const [health, setHealth] = useState(null)
    const [user, setUser] = useState(null)

    const [url, setUrl] = useState('')
    const [source, setSource] = useState('youtube')
    const [download, setDownload] = useState(null)

    const [loading, setLoading] = useState(false)
    const [fileLoading, setFileLoading] = useState(false)

    const [error, setError] = useState(null)

    useEffect(() => {
        api.get('/health')
            .then((response) => {
                setHealth(response.data)
            })
            .catch((error) => {
                console.error(error)
                setError('Не удалось подключиться к Laravel')
            })

        api.get('/user')
            .then((response) => {
                setUser(response.data)
            })
            .catch((error) => {
                console.error(error)
                setError('Не удалось получить данные пользователя')
            })
    }, [])

    async function handleDownload() {
        if (!url.trim()) {
            setError('Вставьте ссылку')
            return
        }

        setLoading(true)
        setError(null)
        setDownload(null)

        try {
            const response = await api.post('/download', {
                url: url.trim(),
            })

            setDownload(response.data)
            setUrl('')
        } catch (error) {
            console.error('Download error:', error)

            setError(
                error.response?.data?.message ||
                'Не удалось скачать аудио'
            )
        } finally {
            setLoading(false)
        }
    }

    async function handleFileDownload() {
        if (!download?.id) {
            return
        }

        setFileLoading(true)
        setError(null)

        try {
            const response = await api.get(
                `/downloads/${download.id}/file`,
                {
                    responseType: 'blob',
                }
            )

            const blob = new Blob(
                [response.data],
                { type: 'audio/mpeg' }
            )

            const fileUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')

            link.href = fileUrl
            link.download = download.title || 'shazam.mp3'

            document.body.appendChild(link)
            link.click()

            link.remove()
            window.URL.revokeObjectURL(fileUrl)
        } catch (error) {
            console.error('File download error:', error)

            setError(
                error.response?.data?.message ||
                'Не удалось получить MP3-файл'
            )
        } finally {
            setFileLoading(false)
        }
    }

    async function handleLogout() {
        try {
            await api.post('/logout')
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            navigate('/login')
        }
    }

    return (
        <main className="min-h-screen w-full bg-[var(--color-bg)] px-4 py-5 text-[var(--color-text)] sm:px-5">
            <nav className="mx-auto mb-10 flex w-full max-w-[820px] items-center gap-4 sm:mb-12 sm:gap-5">
                <Link
                    to="/"
                    className="text-sm text-[var(--color-text-muted)] no-underline transition-colors hover:text-[var(--color-text)]"
                >
                    Главная
                </Link>

                <Link
                    to="/register"
                    className="text-sm text-[var(--color-text-muted)] no-underline transition-colors hover:text-[var(--color-text)]"
                >
                    Регистрация
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="ml-auto h-[34px] rounded-lg border border-white bg-transparent px-3.5 text-[13px] text-white transition-colors hover:border-[var(--color-accent)]"
                >
                    Выйти
                </button>
            </nav>

            <section className="mx-auto w-full max-w-[820px]">
                <header className="mb-7 sm:mb-[30px]">
                    <h1 className="m-0 text-[36px] leading-[1.1] tracking-[-1px] sm:text-[42px]">
                        Shazam
                    </h1>

                    <p className="mt-2.5 text-sm text-[var(--color-text-muted)] sm:text-[15px]">
                        Скачивайте музыку с YouTube и TikTok
                    </p>
                </header>

                <section className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6">
                    <h2 className="mb-[18px] text-lg font-semibold">
                        Скачать музыку
                    </h2>

                    <div className="mb-4 flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setSource('youtube')
                                setError(null)
                            }}
                            className={`h-10 rounded-[9px] border px-[18px] text-[13px] font-medium transition-colors ${
                                source === 'youtube'
                                    ? 'border-white bg-white text-black'
                                    : 'border-white bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                            }`}
                        >
                            YouTube
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setSource('tiktok')
                                setError(null)
                            }}
                            className={`h-10 rounded-[9px] border px-[18px] text-[13px] font-medium transition-colors ${
                                source === 'tiktok'
                                    ? 'border-white bg-white text-black'
                                    : 'border-white bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                            }`}
                        >
                            TikTok
                        </button>
                    </div>

                    <div className="flex w-full flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
                        <input
                            type="url"
                            value={url}
                            onChange={(event) => {
                                setUrl(event.target.value)
                                setError(null)
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleDownload()
                                }
                            }}
                            placeholder={
                                source === 'youtube'
                                    ? 'Вставьте ссылку на YouTube'
                                    : 'Вставьте ссылку на TikTok'
                            }
                            disabled={loading}
                            className="h-[50px] min-w-0 flex-1 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] disabled:opacity-50"
                        />

                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={loading}
                            className="h-[50px] w-full shrink-0 rounded-[10px] border border-white bg-transparent px-[22px] text-sm font-semibold text-white transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            {loading ? '...' : 'Скачать'}
                        </button>
                    </div>
                </section>

                {error && (
                    <p className="mx-1 my-3.5 text-sm text-[var(--color-error)]">
                        {error}
                    </p>
                )}

                {download && (
                    <section className="mt-[18px] flex w-full flex-col items-stretch justify-between gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:p-5">
                        <div className="min-w-0">
                            <span className="mb-1.5 block text-xs text-[var(--color-text-muted)]">
                                Готово
                            </span>

                            <h2 className="m-0 break-words text-[17px] font-semibold">
                                {download.title}
                            </h2>

                            <p className="mt-[7px] text-[13px] text-[var(--color-text-muted)]">
                                Источник: {download.source}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleFileDownload}
                            disabled={fileLoading}
                            className="h-[42px] w-full shrink-0 rounded-[9px] border border-white bg-transparent px-4 text-[13px] font-medium text-white transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            {fileLoading
                                ? 'Получение...'
                                : 'Скачать MP3'}
                        </button>
                    </section>
                )}

                {user && (
                    <section className="mt-[18px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
                        <h2 className="mb-[18px] text-lg font-semibold">
                            Пользователь
                        </h2>

                        <div className="text-sm leading-[1.6] text-[var(--color-text-muted)]">
                            <p>ID: {user.id}</p>
                            <p>Имя: {user.name}</p>
                            <p>Email: {user.email}</p>
                        </div>
                    </section>
                )}

                {health && (
                    <p className="mt-6 text-center text-xs text-[#626975]">
                        Backend: {health.status} · {health.service}
                    </p>
                )}
            </section>
        </main>
    )
}

export default Home