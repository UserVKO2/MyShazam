<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecognizeRequest;
use Illuminate\Http\JsonResponse;

class ShazamController extends Controller
{
    public function recognize(RecognizeRequest $request): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'message' => 'Recognition request received',
            'data' => $request->validated(),
        ]);
    }
}