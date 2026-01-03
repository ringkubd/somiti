<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DepositController extends Controller
{
    public function index() { return view('deposits.index'); }
    public function show($id) { return view('deposits.show'); }
}
