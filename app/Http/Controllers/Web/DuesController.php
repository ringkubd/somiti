<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Services\DuesService;
use App\Services\ManagerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DuesController extends Controller
{
    public function index(Request $request, Somiti $somiti)
    {
        if (! Auth::user()->isMemberOfSomiti($somiti->id)
            && ! Auth::user()->isManagerOfSomiti($somiti->id)
            && ! Auth::user()->isOwnerOfSomiti($somiti->id)) {
            abort(403);
        }

        $isManager = ManagerService::canManage($somiti, Auth::user());

        $data = $isManager
            ? DuesService::somitiDues($somiti)
            : ['settings' => DuesService::somitiDues($somiti)['settings'], 'members' => [DuesService::memberDues($somiti, Auth::id())], 'is_own' => true];

        return Inertia::render('Somiti/Dues', [
            'somiti' => $somiti->only(['id', 'name', 'currency_symbol']),
            'dues' => $data,
            'isManager' => $isManager,
        ]);
    }
}
