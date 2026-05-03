<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dividend_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dividend_declaration_id')->constrained('dividend_declarations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('share_count');
            $table->decimal('dividend_per_share', 12, 2);
            $table->decimal('total_dividend', 12, 2);
            $table->string('status', 20)->default('pending');
            $table->foreignId('journal_entry_id')->nullable()->constrained('journal_entries')->nullOnDelete();
            $table->timestamps();

            $table->index(['dividend_declaration_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dividend_allocations');
    }
};
