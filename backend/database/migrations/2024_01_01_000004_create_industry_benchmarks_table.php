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
        Schema::create('industry_benchmarks', function (Blueprint $table) {
            $table->id();
            $table->string('industry_type', 100);
            $table->string('metric_name', 100);
            $table->decimal('metric_value', 15, 4)->nullable();
            $table->string('metric_unit', 50)->nullable();
            $table->enum('period_type', ['monthly', 'quarterly', 'yearly']);
            $table->string('period_value', 20); // e.g., '2024-Q1', '2024-01'
            $table->timestamps();

            // Add indexes
            $table->index('industry_type');
            $table->index('metric_name');
            $table->index(['period_type', 'period_value']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('industry_benchmarks');
    }
};
