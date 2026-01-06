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
        Schema::create('shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            // Link to financial year to track share price variations over time
            $table->foreignId('financial_year_id')->constrained('financial_years')->cascadeOnDelete();

            $table->decimal('share_price', 10, 2); // Price per share for this year
            $table->unsignedInteger('total_shares'); // Total authorized shares or shares issued?

            $table->timestamps();

            // Ensure one share configuration per year per somiti
            $table->unique(['somiti_id', 'financial_year_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shares');
    }
};
