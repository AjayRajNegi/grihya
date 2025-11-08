<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmailChangeMail extends Mailable
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
        $logoUrl = config('app.logo_url', 'https://griya/logo-email.png');
        $facebookUrl = config('app.facebook_url', 'https://facebook.com/grihya');
        $instagramUrl = config('app.instagram_url', 'https://instagram.com/grihya');

        // Optional embed PNG if available locally
        $logoCid = null;
        $pathFromUrl = parse_url($logoUrl, PHP_URL_PATH) ?: null;
        $publicPath  = $pathFromUrl ? public_path(ltrim($pathFromUrl, '/')) : null;

        $this->withSymfonyMessage(function (\Symfony\Component\Mime\Email $message) use (&$logoCid, $publicPath) {
            if ($publicPath && is_file($publicPath)) {
                $logoCid = $message->embedFromPath($publicPath, 'Grihya-logo', 'image/png');
            }
        });

        return $this->subject('Confirm your new email')
            ->view('emails.email-change')
            ->with([
                'name'         => $this->name,
                'url'          => $this->verifyUrl,
                'appName'      => config('app.name', 'Grihya'),
                'logoUrl'      => $logoCid ?: $logoUrl,
                'facebookUrl'  => $facebookUrl,
                'instagramUrl' => $instagramUrl,
            ]);
    }
}