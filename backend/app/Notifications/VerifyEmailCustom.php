<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailCustom extends BaseVerifyEmail
{
    public function toMail($notifiable)
    {
        $url = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify your email address')
            ->view('emails.verify-email', [
                'name'    => $notifiable->name,
                'url'     => $url,
                'appName' => config('app.name', 'Grihya'),
                'logoUrl' => config('app.logo_url', 'https://grihya/logo.png'),
                'facebookUrl'  => config('app.facebook_url'),
                'instagramUrl' => config('app.instagram_url'),
            ]);
    }
}
