<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    // GET /email/verify/{id}/{hash}
    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        // Validate hash
        if (! hash_equals((string) $hash, sha1($user->email))) {
            // Redirect back to the SAME page with invalid status
            return redirect()->away(
                config('app.frontend_url') . '/verify-email?status=invalid'
            );
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->away(
                config('app.frontend_url') . '/verify-email?status=already&uid=' . $user->id
            );
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // Redirect to the SAME Verify page with success
        return redirect()->away(
            config('app.frontend_url') . '/verify-email?status=success&uid=' . $user->id
        );
    }

    // GET /api/auth/email/resend?signed... (public; signed)
    public function resendSigned(Request $request)
    {
        $id = $request->query('id');
        $user = User::findOrFail($id);

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 200);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent.'], 200);
    }

    // GET /api/auth/email/status?signed... (kept for fallback, not used in UI now)
    public function status(Request $request)
    {
        $id = $request->query('id');
        $user = User::findOrFail($id);

        return response()->json(['verified' => (bool) $user->email_verified_at], 200);
    }
}