<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'section_key',
        'content',
        'type',
    ];

    public static function get($key, $default = null)
    {
        return self::where('section_key', $key)->first()?->content ?? $default;
    }
}
