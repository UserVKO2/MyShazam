<?php

namespace App\Http\Controllers;

use App\Models\Download;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DownloadController extends Controller
{
    /**
     * Получить музыкальную библиотеку текущего пользователя.
     */
    public function index(Request $request): JsonResponse
    {
        $downloads = $request->user()
            ->downloads()
            ->latest()
            ->get();

        return response()->json($downloads);
    }

    /**
     * Скачать аудио по ссылке.
     *
     * Laravel принимает URL от React,
     * отправляет его в FastAPI,
     * а FastAPI скачивает MP3 и хранит его в Ubuntu.
     */
    public function store(Request $request): JsonResponse
    {
        // Проверяем входящую ссылку.
        $validated = $request->validate([
            'url' => ['required', 'url', 'max:2048'],
        ]);

        $url = $validated['url'];

        // Определяем источник.
        $source = $this->detectSource($url);

        if (!$source) {
            return response()->json([
                'message' => 'Поддерживаются только YouTube и TikTok',
            ], 422);
        }

        // Выбираем endpoint FastAPI.
        $endpoint = match ($source) {
            'youtube' => '/sources/youtube/audio',
            'tiktok' => '/sources/tiktok/audio',
        };

        // Отправляем ссылку в FastAPI.
        $response = Http::timeout(300)
            ->post('http://127.0.0.1:8001' . $endpoint, [
                'url' => $url,
            ]);

        // FastAPI вернул ошибку.
        if ($response->failed()) {
            return response()->json([
                'message' => 'Не удалось скачать аудио',
                'error' => $response->json('detail'),
            ], 500);
        }

        // FastAPI возвращает информацию о файле,
        // который уже находится в Ubuntu.
        $data = $response->json();

        $fileName = $data['file_name'] ?? null;

        if (!$fileName) {
            return response()->json([
                'message' => 'FastAPI не вернул имя файла',
            ], 500);
        }

        // Создаём запись только о метаданных.
        // Сам MP3 остаётся в Ubuntu.
        $download = Download::create([
            'user_id' => $request->user()->id,
            'url' => $url,
            'source' => $source,
            'title' => $data['title'] ?? $fileName,
            'file_path' => $fileName,
        ]);

        return response()->json([
            'id' => $download->id,
            'title' => $download->title,
            'source' => $download->source,
            'download_url' => url(
                '/api/downloads/' . $download->id . '/file'
            ),
            'created_at' => $download->created_at,
        ], 201);
    }

    /**
     * Получить MP3 из Ubuntu через FastAPI.
     */
    public function file(Request $request, Download $download)
    {
        // Проверяем владельца песни.
        if ($download->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Доступ запрещён',
            ], 403);
        }

        // Просим FastAPI отдать конкретный MP3.
        $response = Http::timeout(300)
            ->get(
                'http://127.0.0.1:8001/files/' .
                rawurlencode($download->file_path)
            );

        // FastAPI не смог найти файл.
        if ($response->failed()) {
            return response()->json([
                'message' => 'Файл не найден в Ubuntu',
            ], 404);
        }

        // Передаём MP3 дальше пользователю.
        return response(
            $response->body(),
            200,
            [
                'Content-Type' => 'audio/mpeg',
                'Content-Disposition' =>
                    'attachment; filename="' .
                    basename($download->file_path) .
                    '"',
            ]
        );
    }

    /**
     * Определяем музыкальный источник.
     */
    private function detectSource(string $url): ?string
    {
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');

        if (
            str_contains($host, 'youtube.com') ||
            str_contains($host, 'youtu.be')
        ) {
            return 'youtube';
        }

        if (
            str_contains($host, 'tiktok.com') ||
            str_contains($host, 'vt.tiktok.com')
        ) {
            return 'tiktok';
        }

        return null;
    }
}