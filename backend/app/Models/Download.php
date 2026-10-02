<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Download extends Model
{
    /**
     * Поля, которые разрешено массово заполнять.
     */
    protected $fillable = [
        'user_id',
        'url',
        'source',
        'title',
        'file_path',
    ];

    /**
     * Скачанная песня принадлежит пользователю.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}