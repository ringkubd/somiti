<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class InvestmentController extends Controller
{
    public function index()
    {
        return view('investments.index');
    }
    public function show($id)
    {
        return view('investments.show');
    }
}
