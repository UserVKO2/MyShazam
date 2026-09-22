from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from sources.youtube.downloader import YouTubeAdapter


app = FastAPI()


class YouTubeRequest(BaseModel):
    """Данные для запроса скачивания YouTube-аудио."""

    url: str


@app.get("/")
def root():
    """Проверка работоспособности AI-сервиса."""

    return {
        "status": "ok",
        "service": "shazam-ai",
    }


@app.post("/sources/youtube/audio")
def download_youtube_audio(request: YouTubeRequest):
    """Скачать аудио с YouTube через YouTubeAdapter."""

    try:
        # Создаём YouTube-адаптер.
        adapter = YouTubeAdapter()

        # Скачиваем аудио и получаем путь к MP3-файлу.
        file_path = adapter.download_audio(request.url)

        return {
            "status": "ok",
            "source": "youtube",
            "file_path": file_path,
        }

    except Exception as error:
        # Если скачивание завершилось ошибкой,
        # возвращаем HTTP 500 с текстом ошибки.
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )