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
        Schema::create('approvals', function (Blueprint $table) {
            $table->id();
            $table->morphs('approvable'); // approvable_id (e.g. Loan ID) + approvable_type (e.g. App\Models\Loan)

            // The user who is approving/rejecting
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('comment')->nullable(); // Reason for rejection or notes
            $table->timestamp('decided_at')->nullable();

            $table->timestamps();

            // Prevent duplicate approvals by same user for same item
            $table->unique(['approvable_id', 'approvable_type', 'user_id']);
            $table->index(['approvable_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approvals');
    }
};
