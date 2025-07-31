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
        Schema::table('users', function (Blueprint $table) {
            // OAuth provider fields
            $table->string('google_id')->nullable()->after('email_verified_at');
            $table->enum('auth_provider', ['local', 'google', 'facebook', 'apple'])->default('local')->after('google_id');
            $table->string('avatar')->nullable()->after('auth_provider');

            // Add index for OAuth lookups
            $table->index('google_id');
            $table->index('auth_provider');

            // Ensure google_id is unique when present
            $table->unique('google_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['google_id']);
            $table->dropIndex(['auth_provider']);
            $table->dropUnique(['google_id']);

            // Drop columns
            $table->dropColumn(['google_id', 'auth_provider', 'avatar']);
        });
    }
};
