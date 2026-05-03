<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('somiti_id')->constrained('somitis')->cascadeOnDelete();
            $table->nullableMorphs('reference'); // deposit, loan, investment, share_transfer, etc.
            $table->date('entry_date');
            $table->string('description', 500)->nullable();
            $table->boolean('is_posted')->default(true); // always posted; future: draft support
            $table->timestamps();

            $table->index(['somiti_id', 'entry_date']);
            $table->index(['somiti_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
