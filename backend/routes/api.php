<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\HealthController;
use App\Http\Controllers\ShazamController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\PlaylistController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/health', [
    HealthController::class,
    'check',
]);

Route::post('/register', [
    AuthController::class,
    'register',
]);

Route::post('/login', [
    AuthController::class,
    'login',
]);

Route::post('/logout', [
    AuthController::class,
    'logout',
])->middleware('auth:sanctum');

Route::post('/shazam/recognize', [
    ShazamController::class,
    'recognize',
])->middleware('auth:sanctum');

Route::post('/download', [
    DownloadController::class,
    'store',
])->middleware('auth:sanctum');

Route::get('/downloads', [
    DownloadController::class,
    'index',
])->middleware('auth:sanctum');

Route::get('/downloads/{download}/file', [
    DownloadController::class,
    'file',
])->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Playlists
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/playlists', [
        PlaylistController::class,
        'index',
    ]);

    Route::post('/playlists', [
        PlaylistController::class,
        'store',
    ]);

    Route::get('/playlists/{playlist}', [
        PlaylistController::class,
        'show',
    ]);

    Route::delete('/playlists/{playlist}', [
        PlaylistController::class,
        'destroy',
    ]);

    Route::post('/playlists/{playlist}/tracks', [
        PlaylistController::class,
        'addTrack',
    ]);

    Route::delete('/playlists/{playlist}/tracks/{download}', [
        PlaylistController::class,
        'removeTrack',
    ]);
});