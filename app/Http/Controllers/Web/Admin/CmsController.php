<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CmsController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Cms/Index', [
            'contents' => PageContent::all(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'contents' => 'required|array',
            'contents.*.section_key' => 'required|string',
            'contents.*.content' => 'nullable|string',
        ]);

        foreach ($validated['contents'] as $item) {
            PageContent::updateOrCreate(
                ['section_key' => $item['section_key']],
                ['content' => $item['content']]
            );
        }

        return redirect()->back()->with('success', 'Website content updated.');
    }
}
