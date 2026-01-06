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
        Schema::create('ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // The user whose account is affected (or actor if generic)

            $table->string('transaction_ref')->unique(); // Unique Reference ID (e.g. TXN-20240101-001)
            $table->string('type'); // deposit, loan_disbursement, loan_repayment, profit, expense

            $table->decimal('amount', 12, 2);
            $table->enum('dr_cr', ['dr', 'cr']); // Debit or Credit

            $table->string('status')->default('completed'); // approved/completed. Pending items usually don't hit ledger in strict systems, but prompt mentions status.

            $table->nullableMorphs('reference'); // Polymorphic link to source (Deposit, Loan, etc.)

            $table->string('description')->nullable();

            $table->softDeletes(); // No hard deletes
            $table->timestamps();

            $table->index(['somiti_id', 'user_id']);
            $table->index('type');
            $table->index('transaction_ref');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ledgers');
    }
};
