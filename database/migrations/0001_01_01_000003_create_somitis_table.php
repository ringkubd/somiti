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
        Schema::create('somitis', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('unique_code', 50)->unique(); // Public somiti id
            $table->date('start_date');
            $table->date('financial_year_start');
            $table->enum('status', ['active', 'closed'])->default('active');

            // created_by is nullable initially or constrained to users if users table exists.
            // Since users table is created before this (0001_01_01_000000), it's safe.
            $table->foreignId('created_by_user_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('somitis');
    }
};
