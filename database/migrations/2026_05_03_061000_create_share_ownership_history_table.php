<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('share_ownership_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('share_transfer_id')->nullable()->constrained('share_transfers')->nullOnDelete();
            $table->foreignId('financial_year_id')->nullable()->constrained('financial_years')->nullOnDelete();
            $table->integer('shares_before');
            $table->integer('shares_after');
            $table->integer('delta');
            $table->string('entry_type', 30); // purchase, transfer_in, transfer_out, issuance, redemption
            $table->nullableMorphs('reference'); // polymorphic link to source (ShareTransfer, UserShare, etc.)
            $table->timestamp('created_at')->useCurrent();

            $table->index(['somiti_id', 'user_id', 'created_at']);
            $table->index(['user_id', 'entry_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('share_ownership_history');
    }
};
