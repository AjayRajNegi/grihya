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
        Schema::create('home_loan_applications', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('phone', 20)->index();
            $table->string('email')->index();
            $table->string('city')->nullable();
            $table->unsignedBigInteger('loan_amount');
            $table->unsignedBigInteger('property_value');
            $table->unsignedTinyInteger('tenure_years');
            $table->decimal('rate', 5, 2);
            $table->string('employment', 16);
            $table->unsignedBigInteger('monthly_income')->nullable();
            $table->unsignedBigInteger('existing_emi')->nullable();
            $table->string('preferred_bank', 64)->nullable();
            $table->boolean('consent')->default(false);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('est_emi');
            $table->decimal('ltv_pct', 5, 2);
            $table->unsignedBigInteger('processing_fee_est');
            $table->string('status', 32)->default('new');
            $table->string('ip', 64)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_loan_applications');
    }
};
