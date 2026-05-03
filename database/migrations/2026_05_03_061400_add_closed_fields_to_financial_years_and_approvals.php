<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('financial_years', function (Blueprint $table) {
            $table->boolean('is_closed')->default(false)->after('is_active');
            $table->timestamp('closed_at')->nullable()->after('is_closed');
        });

        Schema::table('approvals', function (Blueprint $table) {
            $table->string('previous_status', 20)->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('financial_years', function (Blueprint $table) {
            $table->dropColumn(['is_closed', 'closed_at']);
        });

        Schema::table('approvals', function (Blueprint $table) {
            $table->dropColumn('previous_status');
        });
    }
};
