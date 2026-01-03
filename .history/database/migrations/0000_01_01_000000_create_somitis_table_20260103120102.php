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
