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
        $somitis = Somiti::where(function ($q) {
            $q->where('created_by_user_id', Auth::id())
                ->orWhereHas('members', function ($q2) {
                    $q2->where('user_id', Auth::id());
                })
                ->orWhereHas('managers', function ($q2) {
                    $q2->where('user_id', Auth::id());
                });
        })->paginate(20);

        return view('somitis.index', compact('somitis'));
    }

    public function show(Somiti $somiti)
    {
        if (! Auth::user()->can('view', $somiti)) abort(403);

        return view('somitis.show', ['somiti' => $somiti->load('members', 'managers')]);
    }

    public function create()
    {
        return view('somitis.create');
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string']);

        $somiti = Somiti::create(['name' => $request->input('name'), 'created_by_user_id' => Auth::id()]);

        return redirect()->route('somitis.show', $somiti);
    }

    public function edit(Somiti $somiti)
    {
        if (! Auth::user()->can('update', $somiti)) abort(403);

        return view('somitis.edit', ['somiti' => $somiti]);
    }

    public function update(Request $request, Somiti $somiti)
    {
        if (! Auth::user()->can('update', $somiti)) abort(403);

        $somiti->update($request->only(['name', 'address', 'description']));

        return redirect()->route('somitis.show', $somiti);
    }

    public function destroy(Somiti $somiti)
    {
        if (! Auth::user()->can('delete', $somiti)) abort(403);

        $somiti->delete();

        return redirect()->route('somitis.index');
    }
}
