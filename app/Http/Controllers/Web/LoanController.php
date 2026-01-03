<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class LoanController extends Controller
{
    public function index()
    {
        return view('loans.index');
    }
    public function show($id)
    {
        return view('loans.show');
    }
}
