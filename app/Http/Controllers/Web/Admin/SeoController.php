<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\SeoSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SeoController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Seo/Index', [
            'settings' => SeoSetting::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Seo/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'page_name' => 'required|string|unique:seo_settings',
            'title' => 'required|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'og_image_url' => 'nullable|url',
        ]);

        SeoSetting::create($validated);

        return redirect()->route('admin.seo.index')->with('success', 'SEO settings created.');
    }

    public function edit(SeoSetting $seo)
    {
        return Inertia::render('Admin/Seo/Edit', [
            'setting' => $seo,
        ]);
    }

    public function update(Request $request, SeoSetting $seo)
    {
        $validated = $request->validate([
            'page_name' => 'required|string|unique:seo_settings,page_name,'.$seo->id,
            'title' => 'required|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'og_image_url' => 'nullable|url',
        ]);

        $seo->update($validated);

        return redirect()->route('admin.seo.index')->with('success', 'SEO settings updated.');
    }

    public function destroy(SeoSetting $seo)
    {
        $seo->delete();

        return redirect()->route('admin.seo.index')->with('success', 'SEO settings deleted.');
    }
}
