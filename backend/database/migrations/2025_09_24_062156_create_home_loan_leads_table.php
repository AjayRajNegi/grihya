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
        Schema::create('home_loan_leads', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('phone', 20)->index();
            $table->string('email')->index();
            $table->string('city')->nullable();
            $table->string('partner_slug', 64); // e.g. hdfc, bank-of-maharashtra
            $table->unsignedBigInteger('loan_amount'); // rupees
            $table->unsignedTinyInteger('tenure_years');
            $table->unsignedBigInteger('monthly_income')->nullable(); // rupees
            $table->unsignedBigInteger('existing_emi')->nullable();   // rupees
            $table->boolean('consent')->default(false);
            $table->text('notes')->nullable();
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
        Schema::dropIfExists('home_loan_leads');
    }
};
