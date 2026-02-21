# Registration & Email Flow (Resend) – Troubleshooting

## Signup flow (what happens when a user registers)

1. **Frontend** → `POST /api/auth/register` with `name`, `email`, `phone`, `password`, `role`, etc.
2. **Backend** `AuthController::register()`:
   - Validates input (email format, phone format, etc.).
   - Checks banned accounts, then checks if email/phone already exists in `users`.
   - Deletes any existing `PendingRegistration` for this email.
   - Creates a **PendingRegistration** (token, expiry 30 min).
   - Builds **verify URL**: `{FRONTEND_URL}/verify-email?token={plainToken}`.
   - **Sends email**: `Mail::to($email)->send(new PendingVerifyMail($pending->name, $verifyUrl));`
   - If sending **throws**, it logs and returns **500** with "Could not send verification email."
   - If sending **succeeds**, returns **201** with `pending_verification`, `email`, `resend_url`, etc.

So: if the API returns **201**, Laravel believes the mail was sent successfully (no exception). If you still don’t receive the email, the problem is either Resend (e.g. domain/from address) or deliverability (spam, etc.).

---

## Resend configuration checklist

### 1. `.env` (you already have)

```env
MAIL_MAILER=resend
RESEND_API_KEY=re_xxxxx
MAIL_FROM_ADDRESS=hello@grihya.in
MAIL_FROM_NAME="${APP_NAME}"
```

- `RESEND_API_KEY` is read by `config('resend.api_key')` (from `config/resend.php`) and fallback `config('services.resend.key')`.
- No duplicate `MAIL_MAILER` or other mail vars; keep a single, clear block.

### 2. Domain verification in Resend (most common cause)

Resend **requires the “from” domain to be verified**. If `hello@grihya.in` is used:

- In [Resend Dashboard → Domains](https://resend.com/domains), add and **verify** `grihya.in`.
- Add the DNS records Resend shows (SPF, DKIM, etc.).
- Until the domain shows as verified, Resend may accept the API request but **not deliver**, or return an error.

Use **only** a “from” address whose domain is verified (e.g. `hello@grihya.in` after verifying `grihya.in`).

### 3. Config cache

After changing `.env` or mail config:

```bash
cd backend
php artisan config:clear
php artisan cache:clear
```

### 4. Test mail route (recommended)

Add/update the test route in `backend/routes/web.php` so you can see the exact error Resend returns.

**Add at top with other use statements:**

```php
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
```

**Replace the existing `/test-mail` route with:**

```php
Route::get('/test-mail', function () {
    $to = request('to', 'ajayrajnegi111@gmail.com');
    try {
        Mail::raw('This is a test email from Grihya (Resend).', function ($message) use ($to) {
            $message->to($to)->subject('Test Email from Grihya');
        });
        Log::info('Test email sent successfully', ['to' => $to, 'mailer' => config('mail.default')]);
        return response()->json([
            'success' => true,
            'message' => 'Test email sent! Check inbox and spam.',
            'to' => $to,
            'mailer' => config('mail.default'),
            'from' => config('mail.from'),
        ]);
    } catch (\Throwable $e) {
        Log::error('Test mail failed', ['to' => $to, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
        return response()->json([
            'success' => false,
            'message' => 'Mail failed: ' . $e->getMessage(),
            'to' => $to,
            'mailer' => config('mail.default'),
        ], 500);
    }
});
```

Then:

1. Open `http://your-backend-url/test-mail` (or `http://your-backend-url/test-mail?to=your@email.com`).
2. If it fails, the JSON response and `storage/logs/laravel.log` will show the **exact** Resend error (e.g. domain not verified, invalid from address).

---

## Other possible causes

| Issue | What to do |
|--------|------------|
| **Domain not verified in Resend** | Verify `grihya.in` in Resend and use only verified “from” address. |
| **Wrong or missing RESEND_API_KEY** | Ensure `.env` has `RESEND_API_KEY=re_...` and run `php artisan config:clear`. |
| **MAIL_FROM_ADDRESS not allowed** | Use an address on a domain you’ve verified in Resend (e.g. `hello@grihya.in`). |
| **Email in spam** | Check spam/junk; improve SPF/DKIM/DMARC (Resend’s domain setup helps). |
| **Exception during send** | If registration returns **500**, check `storage/logs/laravel.log` for the exception (same as test route). |
| **View/config error** | If the error mentions missing view or config, fix `resources/views/emails/verify-pending.blade.php` or `config('app.logo_url')` / `MAIL_LOGO_URL` / `LOGO_URL`. |

---

## Quick verification

1. **Confirm mailer:**  
   `php artisan tinker` → `config('mail.default')` should be `resend`.
2. **Confirm API key:**  
   `config('resend.api_key')` or `config('services.resend.key')` should be your `re_...` key (not empty).
3. **Send test:**  
   Visit `/test-mail` and check JSON + logs.
4. **Resend dashboard:**  
   Check [Resend → Logs](https://resend.com/emails) for delivery status and errors.

Fixing domain verification and using the test route usually resolves “env is correct but no emails” when using Resend.
