<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PendingVerifyMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $name;
    public string $verifyUrl;

    public function __construct(string $name, string $verifyUrl)
    {
        $this->name = $name;
        $this->verifyUrl = $verifyUrl;
    }

    public function build()
    {
        
        return $this->subject('Verify your email address')
            ->view('emails.verify-pending')
            ->with([
                'name'    => $this->name,
                'url'     => $this->verifyUrl,
                'appName' => config('app.name', 'Grihya'),
                'logoUrl' => config('app.logo_url', 'https://grihya/logo.png'),
                'facebookUrl'  => config('app.facebook_url'),
                'instagramUrl' => config('app.instagram_url'),
            ]);
    }
}