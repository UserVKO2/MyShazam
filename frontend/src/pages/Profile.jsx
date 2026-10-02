import { useEffect, useRef, useState } from 'react'
import {
    ListMusic,
    Plus,
    User,
    X,
    Trash2,
    ChevronDown,
    Music,
    Play,
    Pause,
    Download,
} from 'lucide-react'

import api from '../services/api'

function Profile() {
    const [user, setUser] = useState(null)
    const [playlists, setPlaylists] = useState([])

    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [deleting, setDeleting] = useState(null)

    const [showCreateModal, setShowCreateModal] = useState(false)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const [error, setError] = useState('')

    const [expandedPlaylistId, setExpandedPlaylistId] = useState(null)
    const [playlistTracks, setPlaylistTracks] = useState([])
    const [tracksLoading, setTracksLoading] = useState(false)

    const [playingTrackId, setPlayingTrackId] = useState(null)
    const [audioLoading, setAudioLoading] = useState(null)
    const [downloadLoading, setDownloadLoading] = useState(null)

    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

    const audioRef = useRef(null)
    const audioUrlRef = useRef(null)

    useEffect(() => {
        loadProfile()

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ''
            }

            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current)
            }
        }
    }, [])

    async function loadProfile() {
        setLoading(true)
        setError('')

        try {
            const [userResponse, playlistsResponse] = await Promise.all([
                api.get('/user'),
                api.get('/playlists'),
            ])

            setUser(userResponse.data)
            setPlaylists(playlistsResponse.data)
        } catch (error) {
            console.error('Profile loading error:', error)

            setError(
                error.response?.data?.message ||
                'Не удалось загрузить профиль'
            )
        } finally {
            setLoading(false)
        }
    }

    async function handlePlaylistClick(playlistId) {
        if (expandedPlaylistId === playlistId) {
            setExpandedPlaylistId(null)
            setPlaylistTracks([])
            return
        }

        setExpandedPlaylistId(playlistId)
        setPlaylistTracks([])
        setTracksLoading(true)
        setError('')

        try {
            const response = await api.get(`/playlists/${playlistId}`)

            setPlaylistTracks(response.data.downloads || [])
        } catch (error) {
            console.error('Playlist loading error:', error)

            setError(
                error.response?.data?.message ||
                'Не удалось загрузить треки плейлиста'
            )

            setExpandedPlaylistId(null)
        } finally {
            setTracksLoading(false)
        }
    }

    async function handlePlayTrack(track) {
        if (!track?.id) {
            return
        }

        if (
            playingTrackId === track.id &&
            audioRef.current
        ) {
            if (audioRef.current.paused) {
                try {
                    await audioRef.current.play()
                } catch (error) {
                    console.error('Audio resume error:', error)
                }
            } else {
                audioRef.current.pause()
            }

            return
        }

        setAudioLoading(track.id)
        setError('')
        setCurrentTime(0)
        setDuration(0)

        try {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ''
            }

            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current)
                audioUrlRef.current = null
            }

            const response = await api.get(
                `/downloads/${track.id}/file`,
                {
                    responseType: 'blob',
                }
            )

            const blobUrl = URL.createObjectURL(response.data)

            audioUrlRef.current = blobUrl

            const audio = new Audio(blobUrl)

            audioRef.current = audio

            audio.addEventListener('loadedmetadata', () => {
                setDuration(audio.duration || 0)
            })

            audio.addEventListener('timeupdate', () => {
                setCurrentTime(audio.currentTime || 0)
            })

            audio.addEventListener('ended', () => {
                setPlayingTrackId(null)
                setCurrentTime(0)
            })

            audio.addEventListener('pause', () => {
                setPlayingTrackId((currentId) => {
                    if (currentId === track.id) {
                        return null
                    }

                    return currentId
                })
            })

            audio.addEventListener('error', () => {
                setPlayingTrackId(null)
                setCurrentTime(0)
                setError('Не удалось воспроизвести этот трек')
            })

            await audio.play()

            setPlayingTrackId(track.id)
        } catch (error) {
            console.error('Track playback error:', error)

            setPlayingTrackId(null)

            setError(
                error.response?.data?.message ||
                'Не удалось загрузить аудиофайл'
            )
        } finally {
            setAudioLoading(null)
        }
    }

    function handleProgressClick(event) {
        const audio = audioRef.current

        if (!audio || !duration) {
            return
        }

        const rect = event.currentTarget.getBoundingClientRect()

        const clickPosition = event.clientX - rect.left

        const percentage = Math.min(
            Math.max(clickPosition / rect.width, 0),
            1
        )

        audio.currentTime = percentage * duration
        setCurrentTime(audio.currentTime)
    }

    async function handleDownloadTrack(track) {
        if (!track?.id) {
            return
        }

        setDownloadLoading(track.id)
        setError('')

        try {
            const response = await api.get(
                `/downloads/${track.id}/file`,
                {
                    responseType: 'blob',
                }
            )

            const blobUrl = URL.createObjectURL(response.data)

            const link = document.createElement('a')

            link.href = blobUrl
            link.download = `${track.title || `tynda-${track.id}`}.mp3`

            document.body.appendChild(link)
            link.click()
            link.remove()

            URL.revokeObjectURL(blobUrl)
        } catch (error) {
            console.error('Track download error:', error)

            setError(
                error.response?.data?.message ||
                'Не удалось скачать трек'
            )
        } finally {
            setDownloadLoading(null)
        }
    }

    function isTrackPlaying(trackId) {
        return (
            playingTrackId === trackId &&
            audioRef.current &&
            !audioRef.current.paused
        )
    }

    function formatTime(time) {
        if (!Number.isFinite(time) || time < 0) {
            return '0:00'
        }

        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)

        return `${minutes}:${String(seconds).padStart(2, '0')}`
    }

    function getProgressPercentage(trackId) {
        if (
            playingTrackId !== trackId ||
            !duration
        ) {
            return 0
        }

        return Math.min(
            Math.max((currentTime / duration) * 100, 0),
            100
        )
    }

    async function handleCreatePlaylist(event) {
        event.preventDefault()

        if (!name.trim()) {
            setError('Введите название плейлиста')
            return
        }

        setCreating(true)
        setError('')

        try {
            const response = await api.post('/playlists', {
                name: name.trim(),
                description: description.trim() || null,
            })

            setPlaylists((currentPlaylists) => [
                response.data,
                ...currentPlaylists,
            ])

            setName('')
            setDescription('')
            setShowCreateModal(false)
        } catch (error) {
            console.error('Playlist creation error:', error)

            setError(
                error.response?.data?.message ||
                'Не удалось создать плейлист'
            )
        } finally {
            setCreating(false)
        }
    }

    async function handleDeletePlaylist(playlistId) {
        const confirmed = window.confirm(
            'Удалить этот плейлист?'
        )

        if (!confirmed) {
            return
        }

        setDeleting(playlistId)
        setError('')

        try {
            await api.delete(`/playlists/${playlistId}`)

            setPlaylists((currentPlaylists) =>
                currentPlaylists.filter(
                    (playlist) => playlist.id !== playlistId
                )
            )

            if (expandedPlaylistId === playlistId) {
                setExpandedPlaylistId(null)
                setPlaylistTracks([])
            }
        } catch (error) {
            console.error('Playlist deletion error:', error)

            setError(
                error.response?.data?.message ||
                'Не удалось удалить плейлист'
            )
        } finally {
            setDeleting(null)
        }
    }

    function openCreateModal() {
        setError('')
        setName('')
        setDescription('')
        setShowCreateModal(true)
    }

    function closeCreateModal() {
        if (creating) {
            return
        }

        setShowCreateModal(false)
        setName('')
        setDescription('')
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[var(--color-bg)] text-white">
                <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/60">
                        Загрузка...
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[var(--color-bg)] text-white">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">

                {/* Error */}
                {error && (
                    <div className="mb-6 border border-red-400/70 bg-transparent px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* User */}
                <section className="mb-8 border border-white/70 p-5 sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-white/70">
                            <User size={28} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-semibold">
                                {user?.name || 'Пользователь'}
                            </h2>

                            <p className="mt-1 truncate text-sm text-white/60">
                                {user?.email || ''}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Playlists */}
                <section>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold uppercase tracking-[0.08em]">
                                Мои плейлисты
                            </h2>

                            <p className="mt-1 text-sm text-white/50">
                                {playlists.length}{' '}
                                {playlists.length === 1
                                    ? 'плейлист'
                                    : 'плейлистов'}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="flex h-11 items-center gap-2 border border-white/70 bg-transparent px-4 text-sm font-medium uppercase tracking-[0.08em] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                            <Plus size={18} />

                            <span className="hidden sm:inline">
                                Создать
                            </span>
                        </button>
                    </div>

                    {playlists.length === 0 ? (
                        <div className="border border-white/70 p-10 text-center">
                            <ListMusic
                                size={42}
                                className="mx-auto mb-4 text-white/50"
                            />

                            <h3 className="text-lg font-semibold">
                                Плейлистов пока нет
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
                                Создай первый плейлист, чтобы сохранять
                                любимую музыку в одном месте.
                            </p>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="mt-6 border border-white/70 bg-transparent px-5 py-3 text-sm font-medium uppercase tracking-[0.08em] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                            >
                                Создать первый плейлист
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {playlists.map((playlist) => {
                                const isExpanded =
                                    expandedPlaylistId === playlist.id

                                return (
                                    <article
                                        key={playlist.id}
                                        className={`relative border bg-transparent transition ${
                                            isExpanded
                                                ? 'border-[var(--color-accent)] sm:col-span-2'
                                                : 'border-white/70 hover:border-[var(--color-accent)]'
                                        }`}
                                    >
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() =>
                                                handlePlaylistClick(
                                                    playlist.id
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === 'Enter' ||
                                                    event.key === ' '
                                                ) {
                                                    event.preventDefault()

                                                    handlePlaylistClick(
                                                        playlist.id
                                                    )
                                                }
                                            }}
                                            className="cursor-pointer p-5"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 items-start gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/50">
                                                        <ListMusic size={21} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h3 className="truncate font-semibold">
                                                            {playlist.name}
                                                        </h3>

                                                        {playlist.description && (
                                                            <p className="mt-1 line-clamp-2 text-sm text-white/50">
                                                                {playlist.description}
                                                            </p>
                                                        )}

                                                        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-white/40">
                                                            {playlist.downloads_count ?? 0}{' '}
                                                            {playlist.downloads_count === 1
                                                                ? 'трек'
                                                                : 'треков'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2">
                                                    <ChevronDown
                                                        size={19}
                                                        className={`text-white/50 transition-transform ${
                                                            isExpanded
                                                                ? 'rotate-180 text-[var(--color-accent)]'
                                                                : ''
                                                        }`}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation()

                                                            handleDeletePlaylist(
                                                                playlist.id
                                                            )
                                                        }}
                                                        disabled={
                                                            deleting ===
                                                            playlist.id
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center border border-white/50 bg-transparent text-white/60 transition hover:border-red-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label="Удалить плейлист"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t border-white/20">
                                                {tracksLoading ? (
                                                    <div className="p-6 text-center">
                                                        <p className="text-sm uppercase tracking-[0.12em] text-white/50">
                                                            Загрузка треков...
                                                        </p>
                                                    </div>
                                                ) : playlistTracks.length === 0 ? (
                                                    <div className="p-8 text-center">
                                                        <Music
                                                            size={32}
                                                            className="mx-auto mb-3 text-white/30"
                                                        />

                                                        <p className="text-sm text-white/50">
                                                            В этом плейлисте пока нет треков
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-white/10">
                                                        {playlistTracks.map(
                                                            (
                                                                track,
                                                                index
                                                            ) => {
                                                                const isPlaying =
                                                                    isTrackPlaying(
                                                                        track.id
                                                                    )

                                                                const isLoading =
                                                                    audioLoading ===
                                                                    track.id

                                                                const isDownloading =
                                                                    downloadLoading ===
                                                                    track.id

                                                                const progress =
                                                                    getProgressPercentage(
                                                                        track.id
                                                                    )

                                                                return (
                                                                    <div
                                                                        key={
                                                                            track.id
                                                                        }
                                                                        className="px-4 py-3 transition hover:bg-white/[0.03] sm:px-5"
                                                                    >
                                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                                            <span className="w-6 shrink-0 text-sm text-white/30">
                                                                                {String(
                                                                                    index +
                                                                                        1
                                                                                ).padStart(
                                                                                    2,
                                                                                    '0'
                                                                                )}
                                                                            </span>

                                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/20">
                                                                                <Music
                                                                                    size={
                                                                                        17
                                                                                    }
                                                                                    className="text-white/60"
                                                                                />
                                                                            </div>

                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="truncate text-sm font-medium">
                                                                                    {track.title ||
                                                                                        'Без названия'}
                                                                                </p>

                                                                                <p className="mt-1 text-xs uppercase tracking-[0.1em] text-white/30">
                                                                                    {track.source ||
                                                                                        'unknown'}
                                                                                </p>
                                                                            </div>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handlePlayTrack(
                                                                                        track
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    isLoading
                                                                                }
                                                                                className="flex h-10 w-10 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[var(--color-accent)] transition hover:scale-110 disabled:cursor-wait disabled:opacity-50"
                                                                                aria-label={
                                                                                    isLoading
                                                                                        ? 'Загрузка'
                                                                                        : isPlaying
                                                                                            ? 'Пауза'
                                                                                            : 'Воспроизвести'
                                                                                }
                                                                            >
                                                                                {isLoading ? (
                                                                                    <span className="text-xs">
                                                                                        ...
                                                                                    </span>
                                                                                ) : isPlaying ? (
                                                                                    <Pause
                                                                                        size={21}
                                                                                        fill="currentColor"
                                                                                        strokeWidth={2.5}
                                                                                    />
                                                                                ) : (
                                                                                    <Play
                                                                                        size={22}
                                                                                        fill="currentColor"
                                                                                        strokeWidth={2.5}
                                                                                    />
                                                                                )}
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleDownloadTrack(
                                                                                        track
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    isDownloading
                                                                                }
                                                                                className="flex h-10 w-10 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[var(--color-accent)] transition hover:scale-110 disabled:cursor-wait disabled:opacity-50"
                                                                                aria-label="Скачать"
                                                                            >
                                                                                {isDownloading ? (
                                                                                    <span className="text-xs">
                                                                                        ...
                                                                                    </span>
                                                                                ) : (
                                                                                    <Download
                                                                                        size={21}
                                                                                        strokeWidth={2.2}
                                                                                    />
                                                                                )}
                                                                            </button>
                                                                        </div>

                                                                        {isPlaying && (
                                                                            <div className="mt-3 ml-[94px] flex items-center gap-3 sm:ml-[96px]">
                                                                                <div
                                                                                    onClick={
                                                                                        handleProgressClick
                                                                                    }
                                                                                    className="h-[3px] min-w-0 flex-1 cursor-pointer bg-white/15"
                                                                                >
                                                                                    <div
                                                                                        className="h-full bg-[var(--color-accent)] transition-[width] duration-100"
                                                                                        style={{
                                                                                            width: `${progress}%`,
                                                                                        }}
                                                                                    />
                                                                                </div>

                                                                                <div className="shrink-0 text-xs font-medium tabular-nums text-[var(--color-accent)]">
                                                                                    {formatTime(
                                                                                        currentTime
                                                                                    )}{' '}
                                                                                    /{' '}
                                                                                    {formatTime(
                                                                                        duration
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-md border border-white/70 bg-[var(--color-bg)] p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold uppercase tracking-[0.1em]">
                                Новый плейлист
                            </h2>

                            <button
                                type="button"
                                onClick={closeCreateModal}
                                disabled={creating}
                                className="flex h-9 w-9 items-center justify-center border border-white/60 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40"
                                aria-label="Закрыть"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreatePlaylist}
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="playlist-name"
                                    className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/60"
                                >
                                    Название
                                </label>

                                <input
                                    id="playlist-name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    autoFocus
                                    className="h-12 w-full border border-white/70 bg-transparent px-4 text-white outline-none transition placeholder:text-white/30 focus:border-[var(--color-accent)]"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="playlist-description"
                                    className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/60"
                                >
                                    Описание
                                </label>

                                <textarea
                                    id="playlist-description"
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    rows={4}
                                    className="w-full resize-none border border-white/70 bg-transparent px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[var(--color-accent)]"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    disabled={creating}
                                    className="h-12 flex-1 border border-white/70 bg-transparent text-sm font-medium uppercase tracking-[0.08em] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40"
                                >
                                    Отмена
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="h-12 flex-1 border border-white bg-white text-sm font-medium uppercase tracking-[0.08em] text-black transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {creating ? 'Создание...' : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Profile