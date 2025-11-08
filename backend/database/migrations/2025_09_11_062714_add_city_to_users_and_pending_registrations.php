<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'city')) {
                $table->string('city', 100)->nullable()->after('phone');
            }
        });

        if (Schema::hasTable('pending_registrations')) {
            Schema::table('pending_registrations', function (Blueprint $table) {
                if (!Schema::hasColumn('pending_registrations', 'city')) {
                    $table->string('city', 100)->nullable()->after('phone');
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'city')) {
                $table->dropColumn('city');
            }
        });

        if (Schema::hasTable('pending_registrations')) {
            Schema::table('pending_registrations', function (Blueprint $table) {
                if (Schema::hasColumn('pending_registrations', 'city')) {
                    $table->dropColumn('city');
                }
            });
        }
    }
};
