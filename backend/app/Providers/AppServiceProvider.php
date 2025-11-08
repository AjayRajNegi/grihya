<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 1) Link points to your SPA route /reset-password 

        ResetPassword::createUrlUsing(function ($user, string $token) {

            $frontend = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));

            $url = rtrim($frontend, '/') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

            Log::error('reset.createUrlUsing', ['email' => $user->email, 'url' => $url]);

            return $url;
        });

        ResetPassword::toMailUsing(function ($user, string $arg) {

            $frontend = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));

            $appName = config('app.name', 'Grihya');

            $isUrl = str_starts_with($arg, 'http://') || str_starts_with($arg, 'https://');

            $finalUrl = $isUrl ? $arg : rtrim($frontend, '/') . '/reset-password?token=' . $arg . '&email=' . urlencode($user->email);


            $expires = (int) config('auth.passwords.users.expire', 10);

            Log::info('reset.toMailUsing', ['email' => $user->email, 'arg' => $arg, 'final_url' => $finalUrl]);


            return (new MailMessage)->subject('Reset your ' . $appName . ' password')->view('emails.password-reset', ['url' => $finalUrl, 'name' => $user->name ?? null, 'appName' => $appName, 'logoUrl' => config('mail.logo_url', 'https://grihya/logo.png'), 'instagramUrl' => config('app.instagram_url', null), 'facebookUrl' => config('app.facebook_url', null), 'expires' => $expires,]);
        });
    }
}
