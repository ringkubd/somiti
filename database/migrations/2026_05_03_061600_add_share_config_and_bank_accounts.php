<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('somitis', function (Blueprint $table) {
            $table->unsignedInteger('total_shares')->nullable()->after('default_interest_rate');
            $table->unsignedInteger('min_share_per_member')->nullable()->default(1)->after('total_shares');
            $table->unsignedInteger('max_share_per_member')->nullable()->after('min_share_per_member');
            $table->decimal('loan_penalty_rate', 5, 2)->nullable()->default(0)->after('max_share_per_member');
            $table->unsignedInteger('loan_grace_days')->nullable()->default(0)->after('loan_penalty_rate');
        });

        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            $table->string('bank_name', 150);
            $table->string('branch_name', 150)->nullable();
            $table->string('account_number', 100);
            $table->string('account_name', 200)->nullable();
            $table->string('account_type', 50)->default('savings');
            $table->decimal('opening_balance', 14, 2)->default(0);
            $table->decimal('current_balance', 14, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('somiti_workflows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            $table->string('transaction_type', 50); // deposit, loan, investment, fdr, share, share_transfer
            $table->boolean('requires_approval')->default(true);
            $table->boolean('manager_can_approve_alone')->default(true);
            $table->unsignedInteger('min_approvals_required')->default(1);
            $table->timestamps();
            $table->unique(['somiti_id', 'transaction_type']);
        });
    }

    public function down(): void
    {
        Schema::table('somitis', function (Blueprint $table) {
            $table->dropColumn(['total_shares', 'min_share_per_member', 'max_share_per_member', 'loan_penalty_rate', 'loan_grace_days']);
        });

        Schema::dropIfExists('somiti_workflows');
        Schema::dropIfExists('bank_accounts');
    }
};
