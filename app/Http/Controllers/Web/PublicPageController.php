<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Post;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PublicPageController extends Controller
{
    public function showPage($slug)
    {
        $page = Page::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return Inertia::render('Public/Page', [
            'page' => $page,
        ]);
    }

    public function blog()
    {
        return Inertia::render('Public/Blog/Index', [
            'posts' => Post::with('category', 'user')
                ->where('is_published', true)
                ->latest()
                ->paginate(12),
        ]);
    }

    public function showPost($slug)
    {
        $post = Post::with('category', 'user')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return Inertia::render('Public/Blog/Show', [
            'post' => $post,
        ]);
    }
}
