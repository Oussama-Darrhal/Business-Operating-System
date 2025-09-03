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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sme_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color', 20)->default('blue');
            $table->boolean('is_custom')->default(true);
            $table->timestamps();

            $table->foreign('sme_id')->references('id')->on('smes')->onDelete('cascade');
            $table->unique(['sme_id', 'name']); // Ensure unique role names per SME
            $table->index(['sme_id', 'is_custom']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
