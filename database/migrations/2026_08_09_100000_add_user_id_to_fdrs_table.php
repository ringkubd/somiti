<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('fdrs', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('somiti_id')->constrained('users')->nullOnDelete();
            $table->foreignId('investment_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fdrs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->foreignId('investment_id')->nullable(false)->change();
        });
    }
};
