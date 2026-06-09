<?php

namespace App\Enums;

class AreaUnit
{
    public const VALUES = [
        'sqft'    => 'Square Feet (sq.ft)',
        'sqm'     => 'Square Meters (sq.m)',
        'acre'    => 'Acre',
        'bigha'   => 'Bigha',
        'hectare' => 'Hectare',
        'marla'   => 'Marla',
        'kanal'   => 'Kanal',
        'gaj'     => 'Gaj',
    ];

    public const KEYS = ['sqft', 'sqm', 'acre', 'bigha', 'hectare', 'marla', 'kanal', 'gaj'];
}