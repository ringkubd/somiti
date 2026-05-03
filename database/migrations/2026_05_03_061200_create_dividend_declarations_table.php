<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dividend_declarations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            $table->foreignId('financial_year_id')->constrained('financial_years')->cascadeOnDelete();
            $table->decimal('total_profit', 14, 2);
            $table->string('profit_period', 50);
            $table->decimal('dividend_rate', 5, 2);
            $table->decimal('total_dividend', 14, 2);
            $table->string('status', 20)->default('pending');
            $table->foreignId('declared_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('declared_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['somiti_id', 'financial_year_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dividend_declarations');
    }
};
