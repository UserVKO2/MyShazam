<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Создаём таблицу истории скачанных песен.
     */
    public function up(): void
    {
        Schema::create('downloads', function (Blueprint $table) {
            $table->id();

            // Пользователь, которому принадлежит скачивание.
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Исходная ссылка YouTube / TikTok.
            $table->text('url');

            // Источник: youtube, tiktok и т.д.
            $table->string('source');

            // Название песни / видео.
            $table->string('title')->nullable();

            // Путь к сохранённому MP3.
            $table->string('file_path');

            // Временная метка создания записи.
            $table->timestamps();
        });
    }

    /**
     * Удаляем таблицу при откате migration.
     */
    public function down(): void
    {
        Schema::dropIfExists('downloads');
    }
};