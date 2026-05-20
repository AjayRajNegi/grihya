<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'type',
        'for',
        'price',
        'location',
        'bedrooms',
        'bathrooms',
        'area',
        'furnishing',
        'amenities',
        'images',
        'status',
        'place_id',
        'lat',
        'lng',
        'display_label',
        'formatted_address',
        'location_components',
        'location_tokens',
        'available_immediately',
        'available_from_date',
        'ready_to_move',
        'possession_date',
        'preferred_tenants',
        'rejection_reason',
        'sharing_type', 'food_included', 'notice_period',
        'floor_number', 'total_floors', 'facing', 'parking', 'age_of_property',
        'property_sub_type', 'parking_spaces', 'power_backup', 'washrooms', 'pantry',
        'plot_type', 'zoning', 'frontage', 'depth', 'access_road', 'boundary_wall', 'gated_community',
    ];

    protected $casts = [
        'price' => 'integer',
        'bathrooms' => 'integer',
        'bedrooms' => 'integer',
        'area' => 'integer',
        'lat' => 'float',
        'lng' => 'float',
        'amenities' => 'array',
        'images' => 'array',
        'location_components' => 'array',
        'available_immediately' => 'boolean',
        'ready_to_move' => 'boolean',
        'available_from_date' => 'date',
        'possession_date' => 'date',
        'food_included' => 'boolean',
        'floor_number' => 'integer',
        'total_floors' => 'integer',
        'age_of_property' => 'integer',
        'parking_spaces' => 'integer',
        'power_backup' => 'boolean',
        'washrooms' => 'integer',
        'pantry' => 'boolean',
        'frontage' => 'decimal:2',
        'depth' => 'decimal:2',
        'access_road' => 'boolean',
        'boundary_wall' => 'boolean',
        'gated_community' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
