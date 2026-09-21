<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\ShazamController;
use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/health', 
    [HealthController::class, 'check']);

Route::post('/shazam/recognize', 
    [ShazamController::class, 'recognize'])->
     middleware('auth:sanctum');

Route::post('/register', 
    [AuthController::class, 'register']);

Route::post('/login', 
            [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');