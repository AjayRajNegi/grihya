<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],

    'allowed_origins' => [
        'https://grihya.in',
        'https://www.grihya.in',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'exposed_headers' => [],
    'max_age' => 0,

    'stateful' => [
        'https://grihya.in',
        'https://www.grihya.in',
        'localhost:5173',
        '127.0.0.1:5173',
    ],

    'supports_credentials' => true,
];
