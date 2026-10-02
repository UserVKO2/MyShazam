<?php

namespace App\Http\Controllers;

use App\Models\Download;
use App\Models\Playlist;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    /**
     * Получить все плейлисты текущего пользователя.
     */
    public function index(Request $request)
    {
        return $request->user()
            ->playlists()
            ->withCount('downloads')
            ->latest()
            ->get();
    }

    /**
     * Создать новый плейлист.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $playlist = $request->user()->playlists()->create($validated);

        return response()->json($playlist, 201);
    }

    /**
     * Получить один плейлист со всеми треками.
     */
    public function show(Request $request, int $playlist)
    {
        $playlist = $request->user()
            ->playlists()
            ->with('downloads')
            ->findOrFail($playlist);

        return response()->json($playlist);
    }

    /**
     * Удалить плейлист.
     */
    public function destroy(Request $request, int $playlist)
    {
        $playlist = $request->user()
            ->playlists()
            ->findOrFail($playlist);

        $playlist->delete();

        return response()->json([
            'message' => 'Плейлист удалён',
        ]);
    }

    /**
     * Добавить скачанный трек в плейлист.
     */
    public function addTrack(
        Request $request,
        int $playlist
    ) {
        $validated = $request->validate([
            'download_id' => ['required', 'integer'],
        ]);

        $playlist = $request->user()
            ->playlists()
            ->findOrFail($playlist);

        $download = $request->user()
            ->downloads()
            ->findOrFail($validated['download_id']);

        $playlist->downloads()->syncWithoutDetaching([
            $download->id,
        ]);

        return response()->json([
            'message' => 'Трек добавлен в плейлист',
        ]);
    }

    /**
     * Удалить трек из плейлиста.
     */
    public function removeTrack(
        Request $request,
        int $playlist,
        int $download
    ) {
        $playlist = $request->user()
            ->playlists()
            ->findOrFail($playlist);

        $track = $request->user()
            ->downloads()
            ->findOrFail($download);

        $playlist->downloads()->detach($track->id);

        return response()->json([
            'message' => 'Трек удалён из плейлиста',
        ]);
    }
}