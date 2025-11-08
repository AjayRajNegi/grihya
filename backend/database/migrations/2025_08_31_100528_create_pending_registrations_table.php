<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('pending_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('role', 20);
            $table->string('name', 255);
            $table->string('email', 255)->index();
            $table->string('email_canonical', 255)->index();
            $table->string('phone', 30)->index();
            $table->string('password_hash', 255);
            $table->string('token_hash', 64)->unique(); // sha256(token)
            $table->timestamp('expires_at')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_registrations');
    }
};
