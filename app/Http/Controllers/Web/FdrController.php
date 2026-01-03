<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class FdrController extends Controller
{
    public function index()
    {
        return view('fdrs.index');
    }
    public function show($id)
    {
        return view('fdrs.show');
    }
}
