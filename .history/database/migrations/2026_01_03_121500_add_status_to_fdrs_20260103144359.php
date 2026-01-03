<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fdrs', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('maturity_amount');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('status');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->index(['somiti_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('fdrs', function (Blueprint $table) {
            $table->dropIndex(['somiti_id', 'status']);
            $table->dropColumn(['status', 'approved_by', 'approved_at']);
        });
    }
};
