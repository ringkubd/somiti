<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoSetting extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'page_name',
        'title',
        'meta_description',
        'meta_keywords',
        'og_image_url',
    ];
}
