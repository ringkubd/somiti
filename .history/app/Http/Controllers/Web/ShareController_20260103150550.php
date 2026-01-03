<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class ShareController extends Controller
{
    public function index()
    {
        return view('shares.index');
    }
    public function show($id)
    {
        return view('shares.show');
    }
}
