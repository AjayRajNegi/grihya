<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $t) {
            $t->string('place_id')->nullable()->index();
            $t->decimal('lat', 10, 7)->nullable()->index();
            $t->decimal('lng', 10, 7)->nullable()->index();

            $t->string('display_label')->nullable();       // short label e.g. "GMS Road, Dehradun"
            $t->string('formatted_address')->nullable();   // full Google address

            $t->json('location_components')->nullable();   // {route,sublocality,locality,admin1,admin2,postalCode}
            $t->text('location_tokens')->nullable();       // normalized tokens/aliases for LIKE/FULLTEXT search
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $t) {
            $t->dropColumn(['place_id', 'lat', 'lng', 'display_label', 'formatted_address', 'location_components', 'location_tokens']);
        });
    }
};
