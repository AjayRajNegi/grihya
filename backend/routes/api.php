<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\HomeLoanApplicationController;
use App\Http\Controllers\Api\HomeLoanLeadController;
use App\Http\Controllers\Api\SitemapFeedController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/google',   [AuthController::class, 'googleLogin'])->middleware('throttle:12,1');

    Route::get('/available', [AuthController::class, 'available'])->middleware('throttle:30,1');

    Route::post('/pending/confirm', [AuthController::class, 'pendingConfirm'])->middleware('throttle:30,1');

    Route::get('/pending/resend/{id}', [AuthController::class, 'pendingResend'])
        ->name('pending.resend')
        ->middleware(['signed', 'throttle:3,10']); // up to 3 resends in 10 minutes

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
    });
    Route::post('/email-change/confirm', [AuthController::class, 'emailChangeConfirm'])->middleware('throttle:30,1');
    Route::get('/email-change/resend/{id}', [AuthController::class, 'emailChangeResend'])
        ->name('email-change.resend')
        ->middleware(['signed', 'throttle:3,10']);

    Route::post('/password/forgot', [PasswordController::class, 'forgot'])->middleware('throttle:5,1');
    Route::post('/password/reset', [PasswordController::class, 'reset'])->middleware('throttle:10,1');
});

Route::get('/agents', [UserController::class, 'agents']);
Route::middleware('auth:sanctum')->get('/agents/{id}/contact', [UserController::class, 'agentContact']);

Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/featured', [PropertyController::class, 'featured']);
Route::get('/properties/{id}', [PropertyController::class, 'show']);
Route::middleware('auth:sanctum')->post('/properties', [PropertyController::class, 'store']);
Route::middleware('auth:sanctum')->get('/my/properties', [PropertyController::class, 'myProperties']);
Route::middleware('auth:sanctum')->put('/properties/{id}', [PropertyController::class, 'update']);
Route::middleware('auth:sanctum')->delete('/properties/{id}', [PropertyController::class, 'destroy']);


Route::middleware('auth:sanctum')->patch('/properties/{id}/status', [PropertyController::class, 'updateStatus']);
Route::middleware('auth:sanctum')->post('/properties/{id}/toggle-status', [PropertyController::class, 'toggleStatus']);


Route::get('/posts', [BlogController::class, 'index']);
Route::get('/posts/{post:slug}', [BlogController::class, 'show']);

Route::post('/posts/{post:slug}/like', [BlogController::class, 'like']);
Route::post('/posts/{post:slug}/unlike', [BlogController::class, 'unlike']);
Route::post('/posts/{post:slug}/share', [BlogController::class, 'share']);

Route::get('/posts/{post:slug}/comments', [CommentController::class, 'index']);
Route::post('/posts/{post:slug}/comments', [CommentController::class, 'store']);

Route::post('/home-loans/applications', [HomeLoanApplicationController::class, 'store'])->middleware('throttle:20,1');

Route::post('/home-loans/partner-leads', [HomeLoanLeadController::class, 'store'])->middleware('throttle:20,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/posts', [BlogController::class, 'store']);
    Route::put('/posts/{post:slug}', [BlogController::class, 'update']);
    Route::delete('/posts/{post:slug}', [BlogController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->prefix('chat')->group(function () {
    Route::post('/start', [ChatController::class, 'start']); // returns conversation token
    Route::get('/conversations/{token}/messages', [ChatController::class, 'messages']);
    Route::post('/conversations/{token}/messages', [ChatController::class, 'send']);
    Route::post('/conversations/{token}/read', [ChatController::class, 'markRead']);
});

Route::middleware('throttle:60,1')->group(function () {
    Route::get('/sitemap/blogs', [SitemapFeedController::class, 'blogs']);
    Route::get('/sitemap/properties', [SitemapFeedController::class, 'properties']);
});
