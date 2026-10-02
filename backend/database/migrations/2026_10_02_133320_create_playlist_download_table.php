<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('playlist_download', function (Blueprint $table) {
            $table->id();

            $table->foreignId('playlist_id')
                ->constrained('playlists')
                ->cascadeOnDelete();

            $table->foreignId('download_id')
                ->constrained('downloads')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique([
                'playlist_id',
                'download_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('playlist_download');
    }
};