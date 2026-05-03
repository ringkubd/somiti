<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'content',
        'featured_image_url',
        'is_published',
        'seo_title',
        'seo_meta_description',
        'seo_keywords',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
