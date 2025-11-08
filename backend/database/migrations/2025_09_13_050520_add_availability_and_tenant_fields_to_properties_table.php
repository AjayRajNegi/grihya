<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            if (!Schema::hasColumn('properties', 'available_immediately')) {
                $table->boolean('available_immediately')->nullable()->after('furnishing');
            }
            if (!Schema::hasColumn('properties', 'available_from_date')) {
                $table->date('available_from_date')->nullable()->after('available_immediately');
            }
            if (!Schema::hasColumn('properties', 'ready_to_move')) {
                $table->boolean('ready_to_move')->nullable()->after('available_from_date');
            }
            if (!Schema::hasColumn('properties', 'possession_date')) {
                $table->date('possession_date')->nullable()->after('ready_to_move');
            }
            if (!Schema::hasColumn('properties', 'preferred_tenants')) {
                $table->enum('preferred_tenants', ['family', 'bachelor', 'both'])->nullable()->after('possession_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            if (Schema::hasColumn('properties', 'preferred_tenants')) {
                $table->dropColumn('preferred_tenants');
            }
            if (Schema::hasColumn('properties', 'possession_date')) {
                $table->dropColumn('possession_date');
            }
            if (Schema::hasColumn('properties', 'ready_to_move')) {
                $table->dropColumn('ready_to_move');
            }
            if (Schema::hasColumn('properties', 'available_from_date')) {
                $table->dropColumn('available_from_date');
            }
            if (Schema::hasColumn('properties', 'available_immediately')) {
                $table->dropColumn('available_immediately');
            }
        });
    }
};
