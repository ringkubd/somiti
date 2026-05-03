<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SomitiController extends Controller
{
    public function index()
    {
        if (! Auth::user()->isSuperAdmin()) {
            return redirect()->route('dashboard');
        }

        $somitis = Somiti::paginate(20);
        return \Inertia\Inertia::render('Somitis/Index', compact('somitis'));
    }

    public function show(Somiti $somiti)
    {
        if (! Auth::user()->can('view', $somiti)) {
            abort(403);
        }

        return \Inertia\Inertia::render('Somitis/Show', [
            'somiti' => $somiti->load(['members.user', 'managers.user']),
        ]);
    }

    public function create()
    {
        // Check if this is the user's first Somiti
        $isFirstTime = ! Auth::user()->somitis()->exists();

        return \Inertia\Inertia::render('Somitis/Create', ['isFirstTime' => $isFirstTime]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:150']);

        $somiti = Somiti::create([
            'name' => $request->input('name'),
            'created_by_user_id' => Auth::id(),
        ]);

        // Create initial financial year
        $activeYear = $somiti->financialYears()->create([
            'title' => 'FY '.now()->format('Y'),
            'start_date' => now()->startOfYear(),
            'end_date' => now()->endOfYear(),
            'is_active' => true,
        ]);

        // Seed chart of accounts (via booted() already, but ensure it's done)
        $somiti->fresh();

        // Add creator as owner member
        $somiti->addMember(Auth::user(), 'owner');

        return redirect()->route('somitis.show', $somiti);
    }

    public function edit(Somiti $somiti)
    {
        if (! Auth::user()->can('update', $somiti)) {
            abort(403);
        }

        return \Inertia\Inertia::render('Somitis/Edit', ['somiti' => $somiti]);
    }

    public function update(Request $request, Somiti $somiti)
    {
        if (! Auth::user()->can('update', $somiti)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'unique_code' => 'required|string|max:50|unique:somitis,unique_code,'.$somiti->id,
            'start_date' => 'required|date',
            'financial_year_start' => 'required|date',
            'status' => 'required|in:active,closed',
        ]);

        $somiti->update($validated);

        return redirect()->route('somitis.show', $somiti);
    }

    public function destroy(Somiti $somiti)
    {
        if (! Auth::user()->can('delete', $somiti)) {
            abort(403);
        }

        $somiti->delete();

        return redirect()->route('somitis.index');
    }
}
