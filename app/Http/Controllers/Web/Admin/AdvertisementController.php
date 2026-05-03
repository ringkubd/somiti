<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdvertisementController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Advertisements/Index', [
            'advertisements' => Advertisement::latest()->paginate(10),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Advertisements/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'image_url' => 'nullable|url',
            'link_url' => 'nullable|url',
            'position' => 'required|in:dashboard_top,sidebar_bottom,transaction_success',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        Advertisement::create($validated);

        return redirect()->route('admin.advertisements.index')->with('success', 'Advertisement created successfully.');
    }

    public function edit(Advertisement $advertisement)
    {
        return Inertia::render('Admin/Advertisements/Edit', [
            'advertisement' => $advertisement,
        ]);
    }

    public function update(Request $request, Advertisement $advertisement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'image_url' => 'nullable|url',
            'link_url' => 'nullable|url',
            'position' => 'required|in:dashboard_top,sidebar_bottom,transaction_success',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $advertisement->update($validated);

        return redirect()->route('admin.advertisements.index')->with('success', 'Advertisement updated successfully.');
    }

    public function destroy(Advertisement $advertisement)
    {
        $advertisement->delete();

        return redirect()->route('admin.advertisements.index')->with('success', 'Advertisement deleted successfully.');
    }
}
