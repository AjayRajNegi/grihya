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

        // NEW
        'available_immediately',
        'available_from_date',
        'ready_to_move',
        'possession_date',
        'preferred_tenants',

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
        // NEW
        'available_immediately' => 'boolean',
        'ready_to_move' => 'boolean',
        'available_from_date' => 'date',
        'possession_date' => 'date',
    ];

     protected $guarded = [];
     
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
