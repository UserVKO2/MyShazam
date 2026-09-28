from pathlib import Path

import yt_dlp

from sources.base import SourceAdapter


class TikTokAdapter(SourceAdapter):
    """Adapter для скачивания аудио с TikTok."""

    def download_audio(self, url: str) -> str:
        """Скачать аудио с TikTok и сохранить его в формате MP3."""

        # Директория для временных аудиофайлов.
        output_dir = Path("/tmp/shazam-audio")
        output_dir.mkdir(parents=True, exist_ok=True)

        # Шаблон имени файла.
        # %(id)s — ID видео TikTok.
        # %(ext)s — текущее расширение скачанного файла.
        output_template = str(output_dir / "%(id)s.%(ext)s")

        # Настройки yt-dlp.
        options = {
            # Выбираем лучшее доступное аудио.
            "format": "bestaudio",

            # Куда сохранить скачанный файл.
            "outtmpl": output_template,

            # Не показываем лишний вывод в нашем API.
            "quiet": True,

            # Не скачиваем плейлист.
            "noplaylist": True,

            # После скачивания конвертируем аудио в MP3.
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
        }

        # Создаём экземпляр yt-dlp с указанными настройками.
        with yt_dlp.YoutubeDL(options) as ydl:
            # Используем download(), потому что именно этот способ
            # успешно работает с TikTok в нашем Python API-тесте.
            ydl.download([url])

        # Получаем ID видео из URL через отдельный запрос метаданных.
        with yt_dlp.YoutubeDL({"quiet": True}) as ydl:
            info = ydl.extract_info(url, download=False)

        # Получаем ID видео TikTok.
        video_id = info["id"]

        # После FFmpeg итоговый файл имеет расширение .mp3.
        mp3_path = output_dir / f"{video_id}.mp3"

        # Проверяем, что файл действительно создан.
        if not mp3_path.exists():
            raise FileNotFoundError(
                f"MP3 файл не найден после скачивания: {mp3_path}"
            )

        # Возвращаем путь к готовому MP3-файлу.
        return str(mp3_path)