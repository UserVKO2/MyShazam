from pathlib import Path

import yt_dlp

from sources.base import SourceAdapter


class YouTubeAdapter(SourceAdapter):
    """Adapter для скачивания аудио с YouTube."""

    def download_audio(self, url: str) -> str:
        """Скачать аудио с YouTube и сохранить его в формате MP3."""

        output_dir = Path("/tmp/shazam-audio")
        output_dir.mkdir(parents=True, exist_ok=True)

        output_template = str(output_dir / "%(id)s.%(ext)s")

        options = {
            # Выбираем лучшее доступное аудио.
            "format": "bestaudio",

            # Шаблон имени временного файла.
            "outtmpl": output_template,

            # Не показываем лишний вывод.
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

        with yt_dlp.YoutubeDL(options) as ydl:
            info = ydl.extract_info(url, download=True)

        # Получаем путь к исходному файлу.
        source_path = Path(ydl.prepare_filename(info))

        # После FFmpeg расширение меняется на .mp3.
        mp3_path = source_path.with_suffix(".mp3")

        return str(mp3_path)