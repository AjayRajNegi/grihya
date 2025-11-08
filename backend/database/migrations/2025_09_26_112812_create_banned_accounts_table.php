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
        Schema::create('banned_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->unsignedBigInteger('banned_by')->nullable()->index(); // admin id
            $table->timestamp('banned_at')->nullable();
            $table->string('reason')->nullable();
            $table->string('name')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('email_canonical')->nullable()->index();
            $table->string('phone')->nullable()->index();
            $table->string('city', 100)->nullable();
            $table->enum('role', ['tenant', 'owner', 'broker', 'builder'])->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->timestamp('original_created_at')->nullable();
            $table->timestamps();
            $table->unique(['email']);
            $table->unique(['phone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banned_accounts');
    }
};
