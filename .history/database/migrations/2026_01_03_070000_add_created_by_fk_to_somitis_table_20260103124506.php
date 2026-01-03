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
        Schema::table('somitis', function (Blueprint $table) {
            // Only add the constraint if the users table exists
            if (Schema::hasTable('users')) {
                $table->foreign('created_by_user_id')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('somitis', function (Blueprint $table) {
            $table->dropForeign(['created_by_user_id']);
        });
    }
};
