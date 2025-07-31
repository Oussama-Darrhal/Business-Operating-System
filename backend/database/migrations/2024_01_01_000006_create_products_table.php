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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sme_id')->constrained('smes')->onDelete('cascade');
            $table->string('sku', 100);
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->foreignId('global_category_id')->nullable()->constrained('global_product_categories')->onDelete('set null');
            $table->string('local_category', 100)->nullable(); // SME-specific category
            $table->string('brand', 100)->nullable();
            $table->string('unit_of_measure', 50)->default('pcs');
            $table->decimal('cost_price', 15, 4)->default(0);
            $table->decimal('selling_price', 15, 4)->default(0);
            $table->decimal('weight', 10, 3)->nullable();
            $table->string('dimensions', 100)->nullable(); // e.g., "10x5x3 cm"
            $table->string('barcode', 100)->nullable();
            $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active');
            $table->timestamps();

            // Add unique constraint and indexes
            $table->unique(['sme_id', 'sku']);
            $table->index('sme_id');
            $table->index('status');
            $table->index('global_category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
