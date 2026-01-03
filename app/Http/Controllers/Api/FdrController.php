<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fdr;
use App\Models\Approval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FdrController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $fdrs = Fdr::where(function ($q) use ($user) {
            $q->whereHas('somiti.members', function ($q2) use ($user) { $q2->where('user_id', $user->id); })
              ->orWhereHas('somiti.managers', function ($q2) use ($user) { $q2->where('user_id', $user->id); });
        })->with('somiti', 'investment')->paginate(20);

        return response()->json($fdrs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'investment_id' => 'nullable|exists:investments,id',
            'bank_name' => 'required|string',
            'interest_rate' => 'required|numeric',
            'tenure_months' => 'required|integer|min:1',
            'maturity_amount' => 'nullable|numeric',
        ]);

        if (! Auth::user()->can('create', [Fdr::class, $request->input('somiti_id')])) abort(403);

        $fdr = Fdr::create(array_merge($request->only(['somiti_id','investment_id','bank_name','interest_rate','tenure_months','maturity_amount']), ['user_id' => Auth::id()]));

        return response()->json($fdr, 201);
    }

    public function show(Fdr $fdr)
    {
        if (! Auth::user()->can('view', $fdr)) abort(403);

        return response()->json($fdr->load('somiti', 'investment'));
    }

    public function update(Request $request, Fdr $fdr)
    {
        if (! Auth::user()->can('update', $fdr)) abort(403);

        $fdr->update($request->only(['bank_name','interest_rate','tenure_months','maturity_amount']));

        return response()->json($fdr);
    }

    public function destroy(Fdr $fdr)
    {
        if (! Auth::user()->can('delete', $fdr)) abort(403);

        $fdr->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function approve(Request $request, Fdr $fdr)
    {
        if (! Auth::user()->can('approve', $fdr)) abort(403);

        if (isset($fdr->status) && $fdr->status === 'approved') {
            return response()->json(['message' => 'Already approved'], 422);
        }

        $fdr->status = 'approved';
        $fdr->approved_by = Auth::id();
        $fdr->approved_at = now();
        $fdr->save();

        Approval::create([
            'approvable_id' => $fdr->id,
            'approvable_type' => Fdr::class,
            'user_id' => Auth::id(),
            'status' => 'approved',
        ]);

        return response()->json($fdr);
    }
}
