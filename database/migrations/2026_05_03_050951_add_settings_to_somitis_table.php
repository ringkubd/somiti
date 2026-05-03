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
        Schema::table('somitis', function (Blueprint $table) {
            $table->string('currency')->default('USD')->after('name');
            $table->string('currency_symbol')->default('$')->after('currency');
            $table->string('logo_url')->nullable()->after('currency_symbol');
            $table->string('receipt_header')->nullable()->after('logo_url');
            $table->string('receipt_footer')->nullable()->after('receipt_header');
            $table->string('phone')->nullable()->after('receipt_footer');
            $table->string('address')->nullable()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('somitis', function (Blueprint $table) {
            $table->dropColumn(['currency', 'currency_symbol', 'logo_url', 'receipt_header', 'receipt_footer', 'phone', 'address']);
        });
    }
};
