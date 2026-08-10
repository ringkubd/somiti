<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('somiti_workflows', function (Blueprint $table) {
            $table->enum('quorum_type', ['count', 'all_members'])->default('count')->after('min_approvals_required');
        });
    }

    public function down(): void
    {
        Schema::table('somiti_workflows', function (Blueprint $table) {
            $table->dropColumn('quorum_type');
        });
    }
};
