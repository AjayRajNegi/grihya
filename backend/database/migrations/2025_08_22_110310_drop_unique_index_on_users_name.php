<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private function indexExists(string $table, string $index): bool
    {
        $db = DB::getDatabaseName();
        $rows = DB::select(
            'SELECT COUNT(1) AS c FROM information_schema.statistics WHERE table_schema = ? AND table_name = ? AND index_name = ?',
            [$db, $table, $index]
        );
        return isset($rows[0]) && (int) $rows[0]->c > 0;
    }
    public function up(): void
    {
        if ($this->indexExists('users', 'users_name_unique')) {
            try {
                DB::statement('ALTER TABLE `users` DROP INDEX `users_name_unique`');
            } catch (\Throwable $e) {
                // Fallback syntax (varies by MySQL/MariaDB)
                DB::statement('DROP INDEX `users_name_unique` ON `users`');
            }
        }
    }

    public function down(): void
    {
        // Recreate the unique index if you ever rollback
        Schema::table('users', function (Blueprint $table) {
            $table->unique('name', 'users_name_unique');
        });
    }
};
