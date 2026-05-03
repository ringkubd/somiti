<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialYear;
use App\Models\NotificationPreference;
use App\Models\Somiti;
use App\Models\SomitiWorkflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SomitiController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        // return somitis where user is member, manager, or owner
        $somitis = Somiti::where(function ($q) use ($user) {
            $q->where('created_by_user_id', $user->id)
                ->orWhereHas('members', function ($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                })
                ->orWhereHas('managers', function ($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                });
        })->paginate(20);

        return response()->json($somitis);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string']);

        $somiti = Somiti::create(['name' => $request->input('name'), 'created_by_user_id' => Auth::id()]);

        // Add creator as owner
        $somiti->addMember(Auth::user(), 'owner');

        return response()->json($somiti, 201);
    }

    public function show(Somiti $somiti)
    {
        if (! Auth::user()->can('view', $somiti)) {
            abort(403);
        }

        return response()->json($somiti->load('members', 'managers'));
    }

    public function update(Request $request, Somiti $somiti)
    {
        if (! Auth::user()->can('update', $somiti)) {
            abort(403);
        }

        $somiti->update($request->only(['name', 'address', 'description']));

        return response()->json($somiti);
    }

    public function members(Somiti $somiti)
    {
        return response()->json($somiti->users()->select('users.id', 'users.name', 'users.email')->get());
    }

    public function settings(Somiti $somiti)
    {
        return response()->json($somiti->only([
            'id', 'name', 'currency', 'currency_symbol', 'logo_url',
            'receipt_header', 'receipt_footer', 'phone', 'address',
            'default_interest_rate', 'total_shares', 'min_share_per_member',
            'max_share_per_member', 'loan_penalty_rate', 'loan_grace_days',
        ]));
    }

    public function workflows(Somiti $somiti)
    {
        $types = ['deposit', 'loan', 'investment', 'fdr', 'share', 'share_transfer'];
        $workflows = [];
        foreach ($types as $type) {
            $workflows[$type] = SomitiWorkflow::getForType($somiti->id, $type);
        }

        return response()->json($workflows);
    }

    public function updateWorkflows(Request $request, Somiti $somiti)
    {
        $validated = $request->validate([
            'workflows' => 'required|array',
            'workflows.*.transaction_type' => 'required|string',
            'workflows.*.requires_approval' => 'boolean',
            'workflows.*.manager_can_approve_alone' => 'boolean',
            'workflows.*.min_approvals_required' => 'integer|min:1',
        ]);

        foreach ($validated['workflows'] as $wf) {
            SomitiWorkflow::updateOrCreate(
                ['somiti_id' => $somiti->id, 'transaction_type' => $wf['transaction_type']],
                [
                    'requires_approval' => $wf['requires_approval'] ?? true,
                    'manager_can_approve_alone' => $wf['manager_can_approve_alone'] ?? true,
                    'min_approvals_required' => $wf['min_approvals_required'] ?? 1,
                ]
            );
        }

        return response()->json(['message' => 'Workflows updated.']);
    }

    public function financialYears(Somiti $somiti)
    {
        return response()->json(
            FinancialYear::where('somiti_id', $somiti->id)->orderBy('start_date', 'desc')->get()
        );
    }

    public function notificationPreferences(Somiti $somiti)
    {
        $types = NotificationPreference::getDefaults();
        $prefs = [];
        foreach ($types as $type) {
            $prefs[$type] = NotificationPreference::firstOrCreate(
                ['somiti_id' => $somiti->id, 'type' => $type],
                ['push_enabled' => true, 'email_enabled' => true]
            );
        }

        return response()->json($prefs);
    }

    public function updateNotificationPreferences(Request $request, Somiti $somiti)
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.*.type' => 'required|string',
            'preferences.*.push_enabled' => 'boolean',
            'preferences.*.email_enabled' => 'boolean',
        ]);

        foreach ($validated['preferences'] as $pref) {
            NotificationPreference::updateOrCreate(
                ['somiti_id' => $somiti->id, 'type' => $pref['type']],
                [
                    'push_enabled' => $pref['push_enabled'] ?? true,
                    'email_enabled' => $pref['email_enabled'] ?? true,
                ]
            );
        }

        return response()->json(['message' => 'Preferences updated.']);
    }
}
