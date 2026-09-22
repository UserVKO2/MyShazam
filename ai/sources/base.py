from abc import ABC, abstractmethod


class SourceAdapter(ABC):
    """Базовый интерфейс для всех источников аудио."""

    @abstractmethod
    def download_audio(self, url: str) -> str:
        """Скачать аудио по URL и вернуть путь к файлу."""
        pass