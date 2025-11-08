<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PendingVerifyMail;
use App\Mail\EmailChangeMail;
use App\Models\PendingEmailChange;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Rules\NotDisposableEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{

    protected function normalizeEmail(string $email): string
    {
        [$local, $domain] = explode('@', strtolower(trim($email)), 2);
        if (in_array($domain, ['gmail.com', 'googlemail.com'], true)) {
            $local = preg_replace('/\+.*$/', '', $local);
            $local = str_replace('.', '', $local);
            $domain = 'gmail.com';
        }
        return $local . '@' . $domain;
    }

    protected function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone);
        if (preg_match('/^(?:91)?([6-9]\d{9})$/', $digits, $m)) {
            return '+91' . $m[1];
        }
        return preg_replace('/\s+/', '', trim($phone));
    }

    protected function normalizeCity(string $v): string
    {
        $v = trim(preg_replace('/\s+/', ' ', $v));
        return mb_convert_case($v, MB_CASE_TITLE, 'UTF-8');
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'role'     => ['required', Rule::in(['tenant', 'owner', 'broker', 'builder'])],
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email:rfc,dns', 'max:255', new NotDisposableEmail],
            'phone'    => ['required', 'string', 'regex:/^\+91[6-9]\d{9}$/', 'max:30'],
            'password' => ['required', 'string', 'min:6'],
            'city'     => ['sometimes', 'string', 'max:100'],
        ]);

        $email = strtolower(trim($data['email']));
        $emailCanonical = $this->normalizeEmail($email);
        $phone = $this->normalizePhone($data['phone']);

        // NEW: quick check against banned_accounts
        if (Schema::hasTable('banned_accounts')) {
            $emailBanned = DB::table('banned_accounts')
                ->where(function ($q) use ($email, $emailCanonical) {
                    $q->where('email', $email);
                    if (Schema::hasColumn('banned_accounts', 'email_canonical')) {
                        $q->orWhere('email_canonical', $emailCanonical);
                    }
                })
                ->exists();

            $phoneBanned = DB::table('banned_accounts')
                ->where(function ($q) use ($phone) {
                    $q->where('phone', $phone);
                    // Optional: if you store normalized E.164 in another column
                    if (Schema::hasColumn('banned_accounts', 'phone_e164')) {
                        $q->orWhere('phone_e164', $phone);
                    }
                })
                ->exists();

            if ($emailBanned && $phoneBanned) {
                return response()->json(['message' => 'Your email and phone has been banned.'], 422);
            } elseif ($emailBanned) {
                return response()->json(['message' => 'Your email has been blocked.'], 422);
            } elseif ($phoneBanned) {
                return response()->json(['message' => 'Your phone number has been blocked.'], 422);
            }
        }

        // Block only if final users table has this email/phone
        $emailTakenInUsers = User::where('email', $email)
            ->orWhere(function ($q) use ($emailCanonical) {
                if (Schema::hasColumn('users', 'email_canonical')) {
                    $q->orWhere('email_canonical', $emailCanonical);
                }
            })
            ->exists();

        if ($emailTakenInUsers) {
            return response()->json(['message' => 'The email has already been taken.'], 422);
        }

        if (User::where('phone', $phone)->exists()) {
            return response()->json(['message' => 'This mobile number is already registered.'], 422);
        }

        // Overwrite any previous pending for the same email (so user can reuse email if they lost the link)
        PendingRegistration::where('email_canonical', $emailCanonical)->delete();
        $city = isset($data['city']) ? $this->normalizeCity($data['city']) : null;
        $tokenPlain = Str::random(64);
        $tokenHash  = hash('sha256', $tokenPlain);

        $pending = PendingRegistration::create([
            'role'            => $data['role'],
            'name'            => trim($data['name']),
            'email'           => $email,
            'email_canonical' => $emailCanonical,
            'phone'           => $phone,
            'city'            => $city,
            'password_hash'   => Hash::make($data['password']),
            'token_hash'      => $tokenHash,
            'expires_at'      => Carbon::now()->addMinutes(30),
        ]);

        $verifyUrl = rtrim(config('app.frontend_url', 'http://127.0.0.1:5173'), '/')
            . '/verify-email?token=' . urlencode($tokenPlain);

        try {
            Mail::to($email)->send(new PendingVerifyMail($pending->name, $verifyUrl));
        } catch (\Throwable $e) {
            Log::error('Pending verify mail failed', ['email' => $email, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Could not send verification email. Try again later.'], 500);
        }

        $resendUrl = URL::temporarySignedRoute(
            'pending.resend',
            now()->addMinutes(10),
            ['id' => $pending->id]
        );

        return response()->json([
            'pending_verification'     => true,
            'email'                    => $email,
            'resend_url'               => $resendUrl,
            'message'                  => 'We have sent a verification email. Please verify to continue.',
            'resend_cooldown_seconds'  => 60,
        ], 201);
    }

    /** 
     * POST /api/auth/pending/confirm
     * Body: { token }
     * Finalize user, mark email verified, return token so frontend logs in immediately.
     */
    public function pendingConfirm(Request $request)
    {
        $request->validate(['token' => ['required', 'string', 'min:32']]);

        $tokenHash = hash('sha256', $request->input('token'));
        $pending = PendingRegistration::active()->where('token_hash', $tokenHash)->first();

        if (!$pending) {
            return response()->json(['message' => 'Invalid or expired verification link.'], 400);
        }

        // Final collision checks (rare)
        if (User::where('email', $pending->email)->exists()) {
            $pending->delete();
            return response()->json(['message' => 'Account already exists for this email. Please login.'], 409);
        }
        if (User::where('phone', $pending->phone)->exists()) {
            return response()->json(['message' => 'This mobile number is already registered.'], 409);
        }

        // Insert user directly to avoid model cast surprises on live app
        $now = Carbon::now();
        $insert = [
            'role'              => $pending->role,
            'name'              => $pending->name,
            'email'             => $pending->email,
            'phone'             => $pending->phone,
            'password'          => $pending->password_hash, // already hashed
            'email_verified_at' => $now,
            'phone_verified_at' => null,
            'created_at'        => $now,
            'updated_at'        => $now,
        ];
        if (Schema::hasColumn('users', 'email_canonical')) {
            $insert['email_canonical'] = $pending->email_canonical;
        }

        if (Schema::hasColumn('users', 'city')) {
            $insert['city'] = $pending->city;
        }

        $userId = DB::table('users')->insertGetId($insert);
        $user = User::findOrFail($userId);

        // Clean up pending
        $pending->delete();

        // Issue token so user is logged in immediately
        $token = $user->createToken('EasyLease')->plainTextToken;

        return response()->json([
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
                'email_verified' => true,
            ],
            'token' => $token,
            'message' => 'Email verified. Account created and logged in.',
        ], 200);
    }

    /**
     * GET /api/auth/pending/resend/{id} (signed)
     * Resend verification email with a fresh token.
     */
    public function pendingResend(Request $request, int $id)
    {
        $pending = PendingRegistration::find($id);
        if (!$pending) {
            return response()->json(['message' => 'Link expired. Please sign up again.'], 404);
        }
        if (Carbon::now()->greaterThan($pending->expires_at)) {
            $pending->delete();
            return response()->json(['message' => 'Link expired. Please sign up again.'], 410);
        }

        $tokenPlain = Str::random(64);
        $pending->token_hash = hash('sha256', $tokenPlain);
        $pending->expires_at = Carbon::now()->addMinutes(30);
        $pending->save();

        $verifyUrl = rtrim(config('app.frontend_url', 'http://127.0.0.1:5173'), '/')
            . '/verify-email?token=' . urlencode($tokenPlain);

        try {
            Mail::to($pending->email)->send(new PendingVerifyMail($pending->name, $verifyUrl));
        } catch (\Throwable $e) {
            Log::error('Pending verify resend failed', ['email' => $pending->email, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Could not resend. Try later.'], 500);
        }

        return response()->json(['message' => 'Verification email sent.'], 200);
    }

    /**
     * POST /api/auth/login
     * If a pending exists for this email (no user yet), return resend_url so user can resend.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = strtolower(trim($data['email']));
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            // If active pending exists for this email, guide with resend link
            $canonical = $this->normalizeEmail($email);
            $pending = PendingRegistration::active()->where('email_canonical', $canonical)->first();
            if ($pending) {
                $resendUrl = URL::temporarySignedRoute(
                    'pending.resend',
                    now()->addMinutes(10),
                    ['id' => $pending->id]
                );
                return response()->json([
                    'message'    => 'Please verify your email from the link we sent, or resend it.',
                    'resend_url' => $resendUrl,
                ], 401);
            }
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (method_exists($user, 'hasVerifiedEmail') && ! $user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email not verified.'], 403);
        }

        $token = $user->createToken('EasyLease')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'city' => $user->city,
                'email_verified' => (bool) $user->email_verified_at,
            ],
            'token' => $token,
        ], 200);
    }


    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $rules = [
            'name'  => ['sometimes', 'filled', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'filled',
                'string',
                'email:rfc,dns',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
                new NotDisposableEmail,
            ],
            'phone' => [
                'sometimes',
                'filled',
                'string',
                'regex:/^\+91[6-9]\d{9}$/',
                Rule::unique('users', 'phone')->ignore($user->id),
            ],
            // NEW: allow city to be updated (including clearing it)
            'city'  => ['sometimes', 'nullable', 'string', 'max:100'],
        ];

        $messages = [
            'name.filled'   => 'Please enter your name.',
            'email.filled'  => 'Please enter your email.',
            'email.email'   => 'Please enter a valid email address.',
            'email.unique'  => 'This email is already registered.',
            'phone.filled'  => 'Please enter your mobile number.',
            'phone.unique'  => 'This mobile number is already registered.',
            'phone.regex'   => 'Enter a valid mobile number.',
            // Optional:
            'city.max'      => 'City must be at most 100 characters.',
        ];

        $data = $request->validate($rules, $messages);

        if (empty($data)) {
            return response()->json([
                'id'    => (string) $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
                'city'  => $user->city,
            ], 200);
        }

        try {
            // Update name immediately
            if (array_key_exists('name', $data)) {
                $user->name = trim($data['name']);
            }

            // Update phone immediately (normalize)
            if (array_key_exists('phone', $data)) {
                $user->phone = $this->normalizePhone($data['phone']);
            }

            // NEW: update city immediately (normalize, allow null/empty to clear)
            if (Schema::hasColumn('users', 'city') && array_key_exists('city', $data)) {
                $user->city = ($data['city'] === null || trim($data['city']) === '')
                    ? null
                    : $this->normalizeCity($data['city']);
            }

            // Stage email change (do NOT update user->email yet)
            $emailChangePayload = null;
            if (array_key_exists('email', $data)) {
                $newEmail = strtolower(trim($data['email']));
                if ($newEmail !== strtolower($user->email)) {
                    $newCanonical = $this->normalizeEmail($newEmail);

                    // Extra guard for canonical uniqueness
                    if (Schema::hasColumn('users', 'email_canonical')) {
                        $exists = User::where('email_canonical', $newCanonical)
                            ->where('id', '!=', $user->id)
                            ->exists();
                        if ($exists) {
                            return response()->json(['message' => 'This email is already registered.'], 422);
                        }
                    }

                    // Remove any previous pending for this user
                    PendingEmailChange::where('user_id', $user->id)->delete();

                    $tokenPlain = Str::random(64);
                    $tokenHash  = hash('sha256', $tokenPlain);

                    $pec = PendingEmailChange::create([
                        'user_id'             => $user->id,
                        'new_email'           => $newEmail,
                        'new_email_canonical' => $newCanonical,
                        'token_hash'          => $tokenHash,
                        'expires_at'          => Carbon::now()->addMinutes(30),
                    ]);

                    // Build frontend verify URL (add kind=email_change for your VerifyEmailPage switch)
                    $verifyUrl = rtrim(config('app.frontend_url', 'http://127.0.0.1:5173'), '/')
                        . '/verify-email?token=' . urlencode($tokenPlain) . '&kind=email_change';

                    // Send confirmation to new email
                    Mail::to($newEmail)->send(new EmailChangeMail($user->name ?: 'there', $verifyUrl));

                    // Signed resend URL
                    $resendUrl = URL::temporarySignedRoute(
                        'email-change.resend',
                        now()->addMinutes(10),
                        ['id' => $pec->id]
                    );

                    $emailChangePayload = [
                        'pending_email_change' => true,
                        'email'                => $newEmail,
                        'resend_url'           => $resendUrl,
                        'message'              => 'We sent a confirmation link to your new email. Please verify to update your account.',
                    ];
                }
            }

            $user->save();

            if ($emailChangePayload) {
                // Return staged info for frontend to navigate to /verify-email with timer
                return response()->json($emailChangePayload, 202);
            }

            return response()->json([
                'id'    => (string) $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
                'city'  => $user->city,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Profile update failed', [
                'user_id' => $user->id,
                'error'   => $e->getMessage(),
            ]);
            return response()->json(['message' => app()->environment('local') ? $e->getMessage() : 'Could not update profile'], 500);
        }
    }

    public function emailChangeConfirm(Request $request)
    {
        $request->validate(['token' => ['required', 'string', 'min:32']]);
        $hash = hash('sha256', $request->input('token'));

        $pec = PendingEmailChange::active()->where('token_hash', $hash)->first();
        if (!$pec) {
            return response()->json(['message' => 'Invalid or expired link.'], 400);
        }

        // Final guard: ensure the target email is still free
        $taken = User::where('email', $pec->new_email)
            ->orWhere(function ($q) use ($pec) {
                if (Schema::hasColumn('users', 'email_canonical')) {
                    $q->orWhere('email_canonical', $pec->new_email_canonical);
                }
            })->exists();
        if ($taken) {
            $pec->delete();
            return response()->json(['message' => 'This email is already in use.'], 409);
        }

        $user = User::findOrFail($pec->user_id);
        $user->email = $pec->new_email;
        if (Schema::hasColumn('users', 'email_canonical')) {
            $user->email_canonical = $pec->new_email_canonical;
        }
        // Typically we keep email_verified_at as already verified user,
        // but you can also set it as now() if you want to mark "verified" again.
        $user->save();

        $pec->delete();

        // No token issued here; user may already be logged in in that browser/tab.
        // Frontend will reload /account so /auth/me picks the updated email.
        return response()->json(['message' => 'Email updated successfully.'], 200);
    }

    /**
     * GET /api/auth/email-change/resend/{id} (signed)
     */
    public function emailChangeResend(Request $request, int $id)
    {
        $pec = PendingEmailChange::find($id);
        if (!$pec) {
            return response()->json(['message' => 'Link expired. Please try updating email again.'], 404);
        }
        if (Carbon::now()->greaterThan($pec->expires_at)) {
            $pec->delete();
            return response()->json(['message' => 'Link expired. Please try updating email again.'], 410);
        }

        $tokenPlain = Str::random(64);
        $pec->token_hash = hash('sha256', $tokenPlain);
        $pec->expires_at = Carbon::now()->addMinutes(30);
        $pec->save();

        $verifyUrl = rtrim(config('app.frontend_url', 'http://127.0.0.1:5173'), '/')
            . '/verify-email?token=' . urlencode($tokenPlain) . '&kind=email_change';

        Mail::to($pec->new_email)->send(
            new EmailChangeMail($pec->user->name ?? 'there', $verifyUrl)
        );

        return response()->json(['message' => 'Confirmation email sent.'], 200);
    }

    /**
     * GET /api/auth/available?name=... | ?phone=... | ?email=... [&exclude={userId}]
     * IMPORTANT: Now checks ONLY users table (ignores pending) so users can re-signup using same email.
     */
    public function available(Request $request)
    {
        if ($request->filled('name')) {
            $val = trim($request->query('name'));
            return response()->json(['field' => 'name', 'value' => $val, 'available' => true]);
        }

        if ($request->filled('phone')) {
            $raw = trim($request->query('phone'));
            $val = $this->normalizePhone($raw);
            $exclude = $request->query('exclude');

            if (!preg_match('/^\+91[6-9]\d{9}$/', $val)) {
                return response()->json([
                    'field' => 'phone',
                    'value' => $val,
                    'available' => false,
                    'reason' => 'invalid_format',
                ]);
            }

            $existsInUsers = User::where('phone', $val)
                ->when($exclude, fn($q) => $q->where('id', '!=', $exclude))
                ->exists();

            return response()->json([
                'field' => 'phone',
                'value' => $val,
                'available' => !$existsInUsers,
            ]);
        }

        if ($request->filled('email')) {
            $val = strtolower(trim($request->query('email')));
            $exclude = $request->query('exclude');
            $canonical = $this->normalizeEmail($val);

            $existsInUsers = User::when($exclude, fn($q) => $q->where('id', '!=', $exclude))
                ->where(function ($q) use ($val, $canonical) {
                    $q->where('email', $val);
                    if (Schema::hasColumn('users', 'email_canonical')) {
                        $q->orWhere('email_canonical', $canonical);
                    }
                })
                ->exists();

            return response()->json([
                'field' => 'email',
                'value' => $val,
                'available' => !$existsInUsers,
            ]);
        }

        return response()->json(['message' => 'Provide name, phone, or email query param'], 422);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }

    public function me(Request $request)
    {
        return response()->json(
            $request->user()->only('id', 'name', 'email', 'phone', 'role', 'city')
        );
    }

    public function googleLogin(Request $request)
    {
        $request->validate([
            'access_token' => ['required', 'string'],
        ]);

        try {
            $accessToken = $request->input('access_token');

            $resp = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://www.googleapis.com/oauth2/v3/userinfo');

            if ($resp->failed()) {
                return response()->json(['message' => 'Invalid Google token'], 400);
            }

            $g = $resp->json();
            $email = strtolower($g['email'] ?? '');
            $name  = $g['name']  ?? null;

            if (!$email) {
                return response()->json(['message' => 'Google did not return an email.'], 400);
            }

            $user = User::where('email', $email)->first();
            if (!$user && Schema::hasColumn('users', 'email_canonical')) {
                $canonical = $this->normalizeEmail($email);
                $user = User::where('email_canonical', $canonical)->first();
            }

            if (!$user) {
                return response()->json([
                    'code'    => 'USER_NOT_FOUND',
                    'message' => 'No account exists with this Google email. Please sign up to continue.',
                    'google'  => ['email' => $email, 'name' => $name],
                ], 404);
            }

            $token = $user->createToken('web')->plainTextToken;

            return response()->json([
                'user'  => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role'  => $user->role,
                    'city' => $user->city,
                    'email_verified' => (bool) $user->email_verified_at,
                ],
                'token' => $token,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Google login failed', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Could not log in with Google'], 500);
        }
    }
}
