<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PropertyRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $ownerName;
    public string $propertyTitle;
    public string $propertyUrl;
    public string $rejectionReason;

    public function __construct(string $ownerName, string $propertyTitle, int $propertyId, string $rejectionReason)
    {
        $this->ownerName = $ownerName;
        $this->propertyTitle = $propertyTitle;
        $this->rejectionReason = $rejectionReason;
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $this->propertyUrl = rtrim($frontendUrl, '/') . '/property/' . $propertyId;
    }

    public function build()
    {
        return $this->subject('Your property listing needs changes')
            ->view('emails.property-rejected')
            ->with([
                'name'            => $this->ownerName,
                'propertyTitle'   => $this->propertyTitle,
                'propertyUrl'     => $this->propertyUrl,
                'rejectionReason' => $this->rejectionReason,
                'appName'         => config('app.name', 'Grihya'),
                'logoUrl'         => config('app.mail_logo_url', config('app.logo_url')),
                'facebookUrl'     => config('app.facebook_url'),
                'instagramUrl'    => config('app.instagram_url'),
            ]);
    }
}
