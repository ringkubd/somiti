<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Blog/Posts/Index', [
            'posts' => Post::with('category', 'user')->latest()->paginate(20),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Blog/Posts/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'content' => 'required|string',
            'featured_image_url' => 'nullable|url',
            'is_published' => 'boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_meta_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        Post::create([
            ...$validated,
            'slug' => Str::slug($validated['title']),
            'user_id' => auth()->id(),
            'published_at' => $validated['is_published'] ? now() : null,
        ]);

        return redirect()->route('admin.blog-posts.index')->with('success', 'Post created.');
    }

    public function edit(Post $blog_post)
    {
        return Inertia::render('Admin/Blog/Posts/Edit', [
            'post' => $blog_post,
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, Post $blog_post)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'content' => 'required|string',
            'featured_image_url' => 'nullable|url',
            'is_published' => 'boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_meta_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $blog_post->update([
            ...$validated,
            'slug' => Str::slug($validated['title']),
            'published_at' => ($validated['is_published'] && ! $blog_post->is_published) ? now() : $blog_post->published_at,
        ]);

        return redirect()->route('admin.blog-posts.index')->with('success', 'Post updated.');
    }

    public function destroy(Post $blog_post)
    {
        $blog_post->delete();

        return redirect()->route('admin.blog-posts.index')->with('success', 'Post deleted.');
    }
}
