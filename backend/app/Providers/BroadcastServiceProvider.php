<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Optional for private channels; harmless to include
        Broadcast::routes();

        // If you create routes/channels.php for Private/Presence channels:
        $channels = base_path('routes/channels.php');
        if (file_exists($channels)) {
            require $channels;
        }
    }
}