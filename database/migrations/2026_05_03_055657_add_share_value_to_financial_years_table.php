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
        Schema::table('financial_years', function (Blueprint $table) {
            $table->decimal('share_value', 12, 2)->default(1000.00)->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financial_years', function (Blueprint $table) {
            $table->dropColumn('share_value');
        });
    }
};
