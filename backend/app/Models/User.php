<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Download;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Поля, которые можно массово заполнять.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Поля, которые скрываются при сериализации пользователя.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Преобразование типов данных.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Все песни, принадлежащие пользователю.
     */
    public function downloads(): HasMany
    {
        return $this->hasMany(Download::class);
    }
}