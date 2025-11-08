<?php

return [
    'default' => env('BROADCAST_DRIVER', 'log'),

    'connections' => [
        'pusher' => [
            'driver' => 'pusher',
            'key'    => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => array_filter([
                'cluster' => env('PUSHER_APP_CLUSTER', 'ap2'),
                // Only set these if you explicitly need a custom host (self-hosted websockets)
                env('PUSHER_HOST')   ? 'host'   : null => env('PUSHER_HOST') ?: null,
                env('PUSHER_PORT')   ? 'port'   : null => env('PUSHER_PORT') ? (int) env('PUSHER_PORT') : null,
                env('PUSHER_SCHEME') ? 'scheme' : null => env('PUSHER_SCHEME') ?: null,
                // Default to TLS
                'useTLS' => env('PUSHER_SCHEME') ? env('PUSHER_SCHEME') === 'https' : true,
            ], static fn($v) => !is_null($v)),
        ],

        'log'  => ['driver' => 'log'],
        'null' => ['driver' => 'null'],
    ],
];
