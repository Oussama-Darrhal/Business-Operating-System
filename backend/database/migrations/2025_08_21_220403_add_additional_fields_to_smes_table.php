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
        Schema::table('smes', function (Blueprint $table) {
            // Add missing fields from the frontend form
            $table->text('description')->nullable()->after('business_type');
            $table->year('founded_year')->nullable()->after('description');
            $table->string('company_size', 50)->nullable()->after('founded_year');
            $table->string('website', 255)->nullable()->after('email');
            $table->string('state', 100)->nullable()->after('city');
            $table->string('zip_code', 20)->nullable()->after('state');
            $table->string('currency', 10)->default('USD')->after('timezone');
            $table->string('business_hours', 255)->nullable()->after('currency');
            $table->string('tax_id', 50)->nullable()->after('business_hours');
            $table->string('logo_url', 500)->nullable()->after('tax_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smes', function (Blueprint $table) {
            // Drop the added columns in reverse order
            $table->dropColumn([
                'logo_url',
                'tax_id',
                'business_hours',
                'currency',
                'zip_code',
                'state',
                'website',
                'company_size',
                'founded_year',
                'description'
            ]);
        });
    }
};
