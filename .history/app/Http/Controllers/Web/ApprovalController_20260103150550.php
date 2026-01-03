<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class ApprovalController extends Controller
{
    public function index()
    {
        return view('approvals.index');
    }
    public function show($id)
    {
        return view('approvals.show');
    }
}
