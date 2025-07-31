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
        Schema::create('customer_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sme_id')->constrained('smes')->onDelete('cascade');
            $table->foreignId('source_id')->nullable()->constrained('review_sources')->onDelete('set null');
            $table->string('external_review_id', 255)->nullable(); // ID from the external platform
            $table->string('customer_name', 255)->nullable();
            $table->string('customer_email', 255)->nullable();
            $table->string('customer_phone', 20)->nullable();
            $table->enum('review_type', ['review', 'complaint', 'suggestion'])->default('review');
            $table->string('title', 500)->nullable();
            $table->text('content');
            $table->decimal('rating', 3, 2)->nullable(); // e.g., 4.5 out of 5
            $table->decimal('max_rating', 3, 2)->default(5.0);
            $table->timestamp('review_date');
            $table->enum('status', ['new', 'in_progress', 'resolved', 'closed'])->default('new');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            // Add indexes
            $table->index('sme_id');
            $table->index('review_type');
            $table->index('status');
            $table->index('review_date');
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_reviews');
    }
};
