from pathlib import Path

import yt_dlp

from sources.base import SourceAdapter


class YouTubeAdapter(SourceAdapter):
    """Adapter для скачивания аудио с YouTube."""

    def download_audio(self, url: str) -> dict:
        """Скачать аудио с YouTube и вернуть файл и metadata."""

        output_dir = Path("/tmp/shazam-audio")
        output_dir.mkdir(parents=True, exist_ok=True)

        output_template = str(output_dir / "%(id)s.%(ext)s")

        options = {
            # Выбираем лучшее доступное аудио.
            "format": "bestaudio",

            # Имя временного файла: YouTube ID + расширение.
            "outtmpl": output_template,

            # Не показываем лишний вывод.
            "quiet": True,

            # Не скачиваем плейлист.
            "noplaylist": True,

            # Конвертируем аудио в MP3.
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
        }

        with yt_dlp.YoutubeDL(options) as ydl:
            info = ydl.extract_info(url, download=True)

            source_path = Path(ydl.prepare_filename(info))

        # После FFmpeg расширение меняется на .mp3.
        mp3_path = source_path.with_suffix(".mp3")

        return {
            "file_path": str(mp3_path),
            "file_name": mp3_path.name,
            "title": info.get("title"),
            "artist": info.get("artist"),
            "uploader": info.get("uploader"),
            "channel": info.get("channel"),
            "duration": info.get("duration"),
            "thumbnail": info.get("thumbnail"),
            "webpage_url": info.get("webpage_url"),
            "youtube_id": info.get("id"),
        }