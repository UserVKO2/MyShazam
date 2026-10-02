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
        <main style={styles.page}>
            {/* Навигация */}
            <nav style={styles.nav}>
                <Link to="/" style={styles.navLink}>
                    Главная
                </Link>

                <Link to="/register" style={styles.navLink}>
                    Регистрация
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    style={styles.logoutButton}
                >
                    Выйти
                </button>
            </nav>

            <section style={styles.container}>

                {/* Заголовок */}
                <header style={styles.header}>
                    <h1 style={styles.title}>
                        Shazam
                    </h1>

                    <p style={styles.subtitle}>
                        Скачивайте музыку с YouTube и TikTok
                    </p>
                </header>

                {/* Скачать */}
                <section style={styles.downloadBox}>
                    <h2 style={styles.sectionTitle}>
                        Скачать музыку
                    </h2>

                    {/* Переключатель источника */}
                    <div style={styles.sourceSelector}>
                        <button
                            type="button"
                            onClick={() => {
                                setSource('youtube')
                                setError(null)
                            }}
                            style={{
                                ...styles.sourceButton,
                                ...(source === 'youtube'
                                    ? styles.sourceButtonActive
                                    : {}),
                            }}
                        >
                            YouTube
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setSource('tiktok')
                                setError(null)
                            }}
                            style={{
                                ...styles.sourceButton,
                                ...(source === 'tiktok'
                                    ? styles.sourceButtonActive
                                    : {}),
                            }}
                        >
                            TikTok
                        </button>
                    </div>

                    {/* Input + кнопка */}
                    <div style={styles.inputRow}>
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
                            style={styles.input}
                        />

                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={loading}
                            style={{
                                ...styles.downloadButton,
                                ...(loading
                                    ? styles.downloadButtonDisabled
                                    : {}),
                            }}
                        >
                            {loading ? '...' : 'Скачать'}
                        </button>
                    </div>
                </section>

                {/* Ошибка */}
                {error && (
                    <p style={styles.error}>
                        {error}
                    </p>
                )}

                {/* Результат */}
                {download && (
                    <section style={styles.resultBox}>
                        <div style={styles.resultInfo}>
                            <span style={styles.resultLabel}>
                                Готово
                            </span>

                            <h2 style={styles.resultTitle}>
                                {download.title}
                            </h2>

                            <p style={styles.resultSource}>
                                Источник: {download.source}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleFileDownload}
                            disabled={fileLoading}
                            style={styles.fileButton}
                        >
                            {fileLoading
                                ? 'Получение...'
                                : 'Скачать MP3'}
                        </button>
                    </section>
                )}

                {/* Пользователь */}
                {user && (
                    <section style={styles.userBox}>
                        <h2 style={styles.sectionTitle}>
                            Пользователь
                        </h2>

                        <div style={styles.userInfo}>
                            <p>ID: {user.id}</p>
                            <p>Имя: {user.name}</p>
                            <p>Email: {user.email}</p>
                        </div>
                    </section>
                )}

                {/* Статус */}
                {health && (
                    <p style={styles.status}>
                        Backend: {health.status} · {health.service}
                    </p>
                )}
            </section>
        </main>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        background: '#0b0d10',
        color: '#ffffff',
        padding: '20px',
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },

    nav: {
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto 50px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },

    navLink: {
        color: '#9ca3af',
        textDecoration: 'none',
        fontSize: '14px',
    },

    logoutButton: {
        marginLeft: 'auto',
        height: '34px',
        padding: '0 14px',
        border: '1px solid #30353e',
        borderRadius: '8px',
        background: '#171a20',
        color: '#ffffff',
        fontSize: '13px',
        cursor: 'pointer',
    },

    container: {
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto',
    },

    header: {
        marginBottom: '30px',
    },

    title: {
        margin: 0,
        fontSize: '42px',
        lineHeight: 1.1,
        letterSpacing: '-1px',
    },

    subtitle: {
        margin: '10px 0 0',
        color: '#8b929d',
        fontSize: '15px',
    },

    downloadBox: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '24px',
        background: '#15181d',
        border: '1px solid #292e36',
        borderRadius: '16px',
    },

    sectionTitle: {
        margin: '0 0 18px',
        fontSize: '18px',
        fontWeight: '600',
    },

    sourceSelector: {
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
    },

    sourceButton: {
        height: '40px',
        padding: '0 18px',
        border: '1px solid #30353e',
        borderRadius: '9px',
        background: '#101216',
        color: '#8b929d',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    },

    sourceButtonActive: {
        background: '#ffffff',
        color: '#111111',
        border: '1px solid #ffffff',
        fontWeight: '600',
    },

    inputRow: {
        display: 'flex',
        width: '100%',
        gap: '10px',
        alignItems: 'center',
    },

    input: {
        flex: 1,
        minWidth: 0,
        height: '50px',
        boxSizing: 'border-box',
        padding: '0 16px',
        borderRadius: '10px',
        border: '1px solid #343a44',
        background: '#0c0e12',
        color: '#ffffff',
        outline: 'none',
        fontSize: '14px',
    },

    downloadButton: {
        flexShrink: 0,
        height: '50px',
        padding: '0 22px',
        border: 'none',
        borderRadius: '10px',
        background: '#ffffff',
        color: '#111111',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },

    downloadButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },

    error: {
        margin: '14px 4px',
        color: '#ff6b6b',
        fontSize: '14px',
    },

    resultBox: {
        width: '100%',
        boxSizing: 'border-box',
        marginTop: '18px',
        padding: '20px',
        background: '#15181d',
        border: '1px solid #292e36',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
    },

    resultInfo: {
        minWidth: 0,
    },

    resultLabel: {
        display: 'block',
        marginBottom: '6px',
        color: '#8b929d',
        fontSize: '12px',
    },

    resultTitle: {
        margin: 0,
        fontSize: '17px',
        fontWeight: '600',
        wordBreak: 'break-word',
    },

    resultSource: {
        margin: '7px 0 0',
        color: '#8b929d',
        fontSize: '13px',
    },

    fileButton: {
        flexShrink: 0,
        height: '42px',
        padding: '0 16px',
        border: '1px solid #343a44',
        borderRadius: '9px',
        background: '#20242b',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
    },

    userBox: {
        width: '100%',
        boxSizing: 'border-box',
        marginTop: '18px',
        padding: '20px',
        background: '#15181d',
        border: '1px solid #292e36',
        borderRadius: '16px',
    },

    userInfo: {
        color: '#9ca3af',
        fontSize: '14px',
        lineHeight: 1.6,
    },

    status: {
        marginTop: '24px',
        color: '#626975',
        fontSize: '12px',
        textAlign: 'center',
    },
}

export default Home