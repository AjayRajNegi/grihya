<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // PG-specific
            $table->string('sharing_type')->nullable()->after('preferred_tenants');
            $table->boolean('food_included')->nullable()->after('sharing_type');
            $table->string('notice_period')->nullable()->after('food_included');

            // Flat/House-specific
            $table->integer('floor_number')->nullable()->after('notice_period');
            $table->integer('total_floors')->nullable()->after('floor_number');
            $table->string('facing')->nullable()->after('total_floors');
            $table->enum('parking', ['none', 'covered', 'open', 'both'])->nullable()->after('facing');
            $table->integer('age_of_property')->nullable()->after('parking');

            // Commercial-specific
            $table->string('property_sub_type')->nullable()->after('age_of_property');
            $table->integer('parking_spaces')->nullable()->after('property_sub_type');
            $table->boolean('power_backup')->nullable()->after('parking_spaces');
            $table->integer('washrooms')->nullable()->after('power_backup');
            $table->boolean('pantry')->nullable()->after('washrooms');

            // Land-specific
            $table->enum('plot_type', ['residential', 'commercial', 'agricultural', 'farmhouse'])->nullable()->after('pantry');
            $table->string('zoning')->nullable()->after('plot_type');
            $table->decimal('frontage', 10, 2)->nullable()->after('zoning');
            $table->decimal('depth', 10, 2)->nullable()->after('frontage');
            $table->boolean('access_road')->nullable()->after('depth');
            $table->boolean('boundary_wall')->nullable()->after('access_road');
            $table->boolean('gated_community')->nullable()->after('boundary_wall');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'sharing_type', 'food_included', 'notice_period',
                'floor_number', 'total_floors', 'facing', 'parking', 'age_of_property',
                'property_sub_type', 'parking_spaces', 'power_backup', 'washrooms', 'pantry',
                'plot_type', 'zoning', 'frontage', 'depth', 'access_road', 'boundary_wall', 'gated_community',
            ]);
        });
    }
};
