<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\HealthController;
use App\Http\Controllers\ShazamController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DownloadController;

/*
|--------------------------------------------------------------------------
| Пользователь
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

Route::get('/health', [
    HealthController::class,
    'check',
]);


/*
|--------------------------------------------------------------------------
| Аутентификация
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Shazam
|--------------------------------------------------------------------------
*/

Route::post('/shazam/recognize', [
    ShazamController::class,
    'recognize',
])->middleware('auth:sanctum');


/*
|--------------------------------------------------------------------------
| Музыкальная библиотека
|--------------------------------------------------------------------------
*/

/*
 * Скачать песню.
 */
Route::post('/download', [
    DownloadController::class,
    'store',
])->middleware('auth:sanctum');


/*
 * Получить музыкальную библиотеку пользователя.
 */
Route::get('/downloads', [
    DownloadController::class,
    'index',
])->middleware('auth:sanctum');


/*
 * Получить MP3-файл.
 */
Route::get('/downloads/{download}/file', [
    DownloadController::class,
    'file',
])->middleware('auth:sanctum');