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
        Schema::table('pages', function (Blueprint $table) {
            $table->string('seo_title')->nullable();
            $table->text('seo_meta_description')->nullable();
            $table->string('seo_keywords')->nullable();
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->string('seo_title')->nullable();
            $table->text('seo_meta_description')->nullable();
            $table->string('seo_keywords')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['seo_title', 'seo_meta_description', 'seo_keywords']);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['seo_title', 'seo_meta_description', 'seo_keywords']);
        });
    }
};
