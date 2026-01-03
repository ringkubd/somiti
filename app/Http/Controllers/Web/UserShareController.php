<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class UserShareController extends Controller
{
    public function index()
    {
        return view('user_shares.index');
    }
    public function show($id)
    {
        return view('user_shares.show');
    }
}
