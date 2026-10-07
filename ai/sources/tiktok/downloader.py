from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

import yt_dlp

from sources.base import SourceAdapter


class TikTokAdapter(SourceAdapter):
    """Адаптер для скачивания аудио с TikTok."""

    ERROR_MESSAGE = (
        "Не удалось получить аудио по этой ссылке. "
        "Попробуйте другую ссылку TikTok."
    )

    OUTPUT_DIR = Path("/tmp/shazam-audio")

    def download_audio(self, url: str) -> str:
        """Скачать аудио с TikTok и сохранить его в формате MP3."""

        self.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        normalized_url = self._normalize_url(url)

        output_template = str(
            self.OUTPUT_DIR / "%(id)s.%(ext)s"
        )

        options = {
            # Для обычных видео и Photo Post.
            "format": "bestaudio/best",

            "outtmpl": output_template,

            "quiet": True,

            "noplaylist": True,

            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
        }

        try:
            with yt_dlp.YoutubeDL(options) as ydl:
                info = ydl.extract_info(
                    normalized_url,
                    download=True,
                )

        except Exception as error:
            raise RuntimeError(self.ERROR_MESSAGE) from error

        if not info:
            raise RuntimeError(self.ERROR_MESSAGE)

        video_id = info.get("id")

        if not video_id:
            raise RuntimeError(self.ERROR_MESSAGE)

        mp3_path = self.OUTPUT_DIR / f"{video_id}.mp3"

        if not mp3_path.exists():
            raise RuntimeError(self.ERROR_MESSAGE)

        return str(mp3_path)

    def _normalize_url(self, url: str) -> str:
        """
        Подготовить TikTok URL к скачиванию.

        TikTok Photo Post имеет вид:

            /@user/photo/123456789

        yt-dlp сейчас не умеет напрямую извлекать такие URL.
        Рабочий обходной путь — использовать тот же ID через:

            /@user/video/123456789
        """

        resolved_url = self._resolve_redirect(url)

        parsed = urlparse(resolved_url)

        if "/photo/" not in parsed.path:
            return resolved_url

        normalized_path = parsed.path.replace(
            "/photo/",
            "/video/",
            1,
        )

        return parsed._replace(
            path=normalized_path,
            query="",
            fragment="",
        ).geturl()

    def _resolve_redirect(self, url: str) -> str:
        """
        Разрешить короткие TikTok ссылки вроде vt.tiktok.com.
        """

        parsed = urlparse(url)

        if parsed.netloc not in {
            "vt.tiktok.com",
            "vm.tiktok.com",
        }:
            return url

        request = Request(
            url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Linux; Android 15) "
                    "AppleWebKit/537.36 "
                    "(KHTML, like Gecko) "
                    "Chrome/140.0 Mobile Safari/537.36"
                )
            },
        )

        try:
            with urlopen(request, timeout=15) as response:
                return response.geturl()

        except Exception as error:
            raise RuntimeError(self.ERROR_MESSAGE) from error
