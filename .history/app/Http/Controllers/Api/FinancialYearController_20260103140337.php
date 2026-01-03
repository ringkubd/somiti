<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FinancialYearController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        // show FYs for somitis the user belongs to or manages
        $fys = FinancialYear::whereHas('somiti.members', function ($q) use ($user) { $q->where('user_id', $user->id); })
            ->orWhereHas('somiti.managers', function ($q) use ($user) { $q->where('user_id', $user->id); })
            ->with('somiti')->paginate(20);

        return response()->json($fys);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'title' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if (! Auth::user()->can('create', [FinancialYear::class, $request->input('somiti_id')])) abort(403);

        $fy = FinancialYear::create(array_merge($request->only(['somiti_id','title','start_date','end_date']), ['status' => 'pending']));

        return response()->json($fy, 201);
    }

    public function show(FinancialYear $financialYear)
    {
        if (! Auth::user()->can('view', $financialYear)) abort(403);

        return response()->json($financialYear->load('somiti'));
    }

    public function activate(Request $request, FinancialYear $financialYear)
    {
        if (! Auth::user()->can('setActive', $financialYear)) abort(403);

        // deactivate other years for this somiti
        FinancialYear::where('somiti_id', $financialYear->somiti_id)->update(['is_active' => false]);

        $financialYear->is_active = true;
        $financialYear->save();

        return response()->json($financialYear);
    }
}
