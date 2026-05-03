<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('share_transfers', function (Blueprint $table) {
            $table->foreignId('financial_year_id')->nullable()->after('somiti_id')
                ->constrained('financial_years')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('share_transfers', function (Blueprint $table) {
            $table->dropForeign(['financial_year_id']);
            $table->dropColumn('financial_year_id');
        });
    }
};
