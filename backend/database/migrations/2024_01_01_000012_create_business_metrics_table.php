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
        Schema::create('business_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sme_id')->constrained('smes')->onDelete('cascade');
            $table->string('metric_name', 100);
            $table->decimal('metric_value', 15, 4);
            $table->string('metric_unit', 50)->nullable();
            $table->enum('period_type', ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
            $table->date('period_start');
            $table->date('period_end');
            $table->timestamp('calculated_at')->useCurrent();
            $table->timestamps();

            // Add indexes
            $table->index('sme_id');
            $table->index('metric_name');
            $table->index(['period_type', 'period_start']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_metrics');
    }
};
