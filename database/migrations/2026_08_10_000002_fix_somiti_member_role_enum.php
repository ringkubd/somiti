<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fix rows where the owner was stored with an invalid/empty role
        // because the previous enum did not include 'owner'.
        DB::table('somiti_members')
            ->join('somitis', 'somitis.id', '=', 'somiti_members.somiti_id')
            ->whereColumn('somitis.created_by_user_id', '=', 'somiti_members.user_id')
            ->whereIn('somiti_members.role', ['', 'owner'])
            ->update(['somiti_members.role' => 'owner']);

        Schema::table('somiti_members', function (Blueprint $table) {
            $table->enum('role', ['owner', 'manager', 'member', 'auditor'])->default('member')->change();
        });
    }

    public function down(): void
    {
        Schema::table('somiti_members', function (Blueprint $table) {
            $table->enum('role', ['manager', 'member', 'auditor'])->default('member')->change();
        });
    }
};
