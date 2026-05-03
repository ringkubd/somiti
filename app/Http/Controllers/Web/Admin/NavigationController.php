<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Navigation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NavigationController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Navigation/Index', [
            'navigations' => Navigation::orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:50',
            'url' => 'required|string',
            'order' => 'integer',
            'position' => 'required|in:header,footer',
        ]);

        Navigation::create($validated);

        return redirect()->back()->with('success', 'Link added.');
    }

    public function update(Request $request, Navigation $navigation)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:50',
            'url' => 'required|string',
            'order' => 'integer',
            'position' => 'required|in:header,footer',
            'is_active' => 'boolean',
        ]);

        $navigation->update($validated);

        return redirect()->back()->with('success', 'Link updated.');
    }

    public function destroy(Navigation $navigation)
    {
        $navigation->delete();

        return redirect()->back()->with('success', 'Link removed.');
    }
}
