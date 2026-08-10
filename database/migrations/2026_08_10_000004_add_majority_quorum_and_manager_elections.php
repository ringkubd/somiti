<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add "majority" (most votes win) quorum mode
        Schema::table('somiti_workflows', function (Blueprint $table) {
            $table->enum('quorum_type', ['count', 'all_members', 'majority'])->default('count')->change();
        });

        // Manager election: members vote, majority decides the new manager
        Schema::create('somiti_manager_elections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            $table->foreignId('candidate_user_id')->constrained('users')->cascadeOnDelete();
            $table->date('from_date');
            $table->date('to_date')->nullable();
            $table->text('note')->nullable();
            $table->string('status', 20)->default('pending'); // pending, approved, rejected
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['somiti_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('somiti_manager_elections');
        Schema::table('somiti_workflows', function (Blueprint $table) {
            $table->enum('quorum_type', ['count', 'all_members'])->default('count')->change();
        });
    }
};
