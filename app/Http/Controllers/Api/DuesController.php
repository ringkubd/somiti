<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Services\DuesService;
use App\Services\ManagerService;
use Illuminate\Support\Facades\Auth;

class DuesController extends Controller
{
    /**
     * Manager/owner overview of every member's monthly dues.
     */
    public function somitiDues(Somiti $somiti)
    {
        if (! ManagerService::canManage($somiti, Auth::user())) {
            abort(403);
        }

        return response()->json(DuesService::somitiDues($somiti));
    }

    /**
     * The authenticated member's own dues schedule.
     */
    public function myDues(Somiti $somiti)
    {
        if (! Auth::user()->isMemberOfSomiti($somiti->id)
            && ! Auth::user()->isManagerOfSomiti($somiti->id)
            && ! Auth::user()->isOwnerOfSomiti($somiti->id)) {
            abort(403);
        }

        return response()->json(DuesService::memberDues($somiti, Auth::id()));
    }
}
