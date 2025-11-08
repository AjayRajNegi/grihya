<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;

class PasswordController extends Controller
{
    // POST /api/auth/password/forgot
    public function forgot(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email']
        ]);

        Password::sendResetLink(['email' => $request->input('email')]);

        return response()->json(['ok' => true, 'message' => 'If that email is registered, you will receive a password reset link shortly.',], 200);
    }

    // POST /api/auth/password/reset 

    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6', 'confirmed']
        ]);
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),

            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->input('password')),
                    'remember_token' => Str::random(60)
                ])->save();
                event(new PasswordReset($user));
            }
        );
        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['ok' => true, 'message' => 'Your password has been reset.',], 200);
        }
        return response()->json([
            'ok' => false,
            'message' => __($status),
            
        ], 422);
    }
}
