<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event_type', 50); // e.g. deposit.created, deposit.approved, share.transferred
            $table->string('entity_type', 150);
            $table->unsignedBigInteger('entity_id');
            $table->json('payload')->nullable(); // full snapshot
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
            // NO updated_at — immutable

            $table->index(['somiti_id', 'event_type', 'created_at']);
            $table->index(['entity_type', 'entity_id']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_events');
    }
};
