<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Str;

class NotDisposableEmail implements Rule
{
    protected array $blocked;

    public function __construct()
    {
        // Use a maintained list in production; this is a starter set.
        $this->blocked = [
            'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
            'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getnada.com',
        ];
    }

    public function passes($attribute, $value): bool
    {
        $domain = strtolower(Str::after($value, '@'));
        return !in_array($domain, $this->blocked, true);
    }

    public function message(): string
    {
        return 'Disposable email addresses are not allowed.';
    }
}