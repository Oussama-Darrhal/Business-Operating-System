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
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('module_id', 50); // e.g., 'dashboard', 'users', 'products'
            $table->string('module_name');
            $table->text('module_description')->nullable();
            $table->string('category', 50); // e.g., 'Core', 'Inventory', 'System & Admin'
            $table->timestamps();

            $table->unique('module_id');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
