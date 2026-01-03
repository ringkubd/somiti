<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class LedgerController extends Controller
{
    public function index() { return view('ledgers.index'); }
    public function show($id) { return view('ledgers.show'); }
}
