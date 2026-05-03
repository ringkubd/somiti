<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            $table->string('code', 20);
            $table->string('name', 100);
            $table->string('type', 20); // asset, liability, equity, income, expense
            $table->string('normal_balance', 10); // debit, credit
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['somiti_id', 'code']);
            $table->index(['somiti_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chart_of_accounts');
    }
};
