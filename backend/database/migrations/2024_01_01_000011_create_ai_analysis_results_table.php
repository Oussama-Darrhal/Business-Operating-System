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
        Schema::create('ai_analysis_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained('customer_reviews')->onDelete('cascade');
            $table->decimal('sentiment_score', 5, 4)->nullable(); // Range: -1.0 to 1.0
            $table->enum('sentiment_label', ['positive', 'negative', 'neutral']);
            $table->decimal('confidence_score', 5, 4)->nullable(); // Range: 0.0 to 1.0
            $table->json('keywords')->nullable(); // Extracted keywords as JSON array
            $table->json('topics')->nullable(); // Identified topics as JSON array
            $table->json('emotions')->nullable(); // Detected emotions (joy, anger, sadness, etc.)
            $table->string('language_code', 10)->nullable(); // e.g., 'en', 'es', 'fr'
            $table->string('analysis_model', 100)->nullable(); // e.g., 'google-cloud-language-v1'
            $table->timestamp('processed_at')->useCurrent();
            $table->timestamps();

            // Add indexes
            $table->index('review_id');
            $table->index('sentiment_label');
            $table->index('sentiment_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_analysis_results');
    }
};
