<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Set default to 'active' (does not change existing rows)
        DB::statement("ALTER TABLE `properties` MODIFY `status` ENUM('pending','active') NOT NULL DEFAULT 'active'");
    }

    public function down(): void
    {
        // Revert default to 'pending'
        DB::statement("ALTER TABLE `properties` MODIFY `status` ENUM('pending','active') NOT NULL DEFAULT 'pending'");
    }
};