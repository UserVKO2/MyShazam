from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from sources.youtube.downloader import YouTubeAdapter
from sources.tiktok.downloader import TikTokAdapter


app = FastAPI()


# Единая директория, где FastAPI хранит скачанные MP3.
AUDIO_DIR = Path("/tmp/shazam-audio")


class AudioRequest(BaseModel):
    """Данные для запроса скачивания аудио."""

    url: str


@app.get("/")
def root():
    """Проверка работоспособности AI-сервиса."""

    return {
        "status": "ok",
        "service": "shazam-ai",
    }


@app.post("/sources/youtube/audio")
def download_youtube_audio(request: AudioRequest):
    """Скачать аудио с YouTube через YouTubeAdapter."""

    try:
        # Создаём YouTube-адаптер.
        adapter = YouTubeAdapter()

        # Скачиваем аудио.
        file_path = adapter.download_audio(request.url)

        # Превращаем путь в объект Path.
        path = Path(file_path)

        return {
            "status": "ok",
            "source": "youtube",
            "file_name": path.name,
            "file_path": str(path),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@app.post("/sources/tiktok/audio")
def download_tiktok_audio(request: AudioRequest):
    """Скачать аудио с TikTok через TikTokAdapter."""

    try:
        # Создаём TikTok-адаптер.
        adapter = TikTokAdapter()

        # Скачиваем аудио.
        file_path = adapter.download_audio(request.url)

        # Превращаем путь в объект Path.
        path = Path(file_path)

        return {
            "status": "ok",
            "source": "tiktok",
            "file_name": path.name,
            "file_path": str(path),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@app.get("/files/{file_name}")
def get_audio_file(file_name: str):
    """
    Отдать MP3-файл из Ubuntu.

    Laravel обращается сюда, когда пользователь
    хочет получить ранее скачанную песню.
    """

    # Создаём путь только внутри AUDIO_DIR.
    file_path = AUDIO_DIR / file_name

    # Проверяем, что файл действительно находится
    # внутри разрешённой директории.
    try:
        file_path = file_path.resolve()
        audio_dir = AUDIO_DIR.resolve()

        file_path.relative_to(audio_dir)

    except ValueError:
        raise HTTPException(
            status_code=403,
            detail="Доступ к этому файлу запрещён",
        )

    # Проверяем существование файла.
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Файл не найден",
        )

    # Проверяем, что это именно файл.
    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Файл не найден",
        )

    # Отправляем MP3 обратно Laravel.
    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=file_path.name,
    )