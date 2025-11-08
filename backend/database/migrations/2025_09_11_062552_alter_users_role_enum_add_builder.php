<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE `users`
            MODIFY `role` ENUM('tenant','owner','broker','builder')
            NOT NULL DEFAULT 'tenant'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE `users` SET `role`='owner' WHERE `role`='builder'");

        DB::statement("ALTER TABLE `users`
            MODIFY `role` ENUM('tenant','owner','broker')
            NOT NULL DEFAULT 'tenant'");
    }
};
