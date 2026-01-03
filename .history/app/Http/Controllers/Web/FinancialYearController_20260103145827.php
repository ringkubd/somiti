<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class FinancialYearController extends Controller
{
    public function index() { return view('financial_years.index'); }
    public function show($id) { return view('financial_years.show'); }
}
