<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Somiti monthly deposit config
        Schema::table('somitis', function (Blueprint $table) {
            $table->decimal('monthly_deposit_amount', 12, 2)->nullable()->after('max_share_per_member');
            $table->unsignedTinyInteger('due_day')->nullable()->default(10)->after('monthly_deposit_amount');
        });

        // Deposits carry the month they belong to (first day of month)
        Schema::table('deposits', function (Blueprint $table) {
            $table->date('due_month')->nullable()->after('month');
            $table->index(['somiti_id', 'due_month']);
        });

        // Manager signature on approval/vote
        Schema::table('approvals', function (Blueprint $table) {
            $table->string('signature', 255)->nullable()->after('comment');
        });

        // Track reminders so members are not spammed
        Schema::create('due_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('month_key', 7); // YYYY-MM
            $table->string('type', 20); // due | overdue
            $table->timestamps();
            $table->unique(['somiti_id', 'user_id', 'month_key', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('due_reminders');
        Schema::table('approvals', function (Blueprint $table) {
            $table->dropColumn('signature');
        });
        Schema::table('deposits', function (Blueprint $table) {
            $table->dropColumn('due_month');
        });
        Schema::table('somitis', function (Blueprint $table) {
            $table->dropColumn(['monthly_deposit_amount', 'due_day']);
        });
    }
};
