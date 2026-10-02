<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Playlist extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
    ];

    /**
     * Плейлист принадлежит пользователю.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Треки, добавленные в плейлист.
     */
    public function downloads(): BelongsToMany
    {
        return $this->belongsToMany(
            Download::class,
            'playlist_download'
        )->withTimestamps();
    }
}