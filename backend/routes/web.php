<?php

use App\Http\Controllers\VerificationController;
use App\Http\Controllers\Api\BlogController as AdminBlogController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Admin\ChatAdminController;
use App\Http\Controllers\Admin\BlogAdminController;
use App\Http\Controllers\Admin\BannedAccountController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('adminauth.login');
});
Route::get('/test-mail', function () {
    try {
        Mail::raw('This is a test email sent using Mailtrap.', function ($message) {
            $message->to('ajayrajnegi111@gmail.com')
                    ->subject('Test Email from Laravel');
        });
        return '✅ Test email sent! Check your Mailtrap inbox.';
    } catch (\Exception $e) {
        return '❌ Mail failed: ' . $e->getMessage();
    }
});

Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->name('verification.verify')
    ->middleware(['signed', 'throttle:6,1']);

Route::prefix('admin')->group(function () {
    Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
    Route::post('/login', [AdminAuthController::class, 'login'])->name('admin.login.post');
    Route::get('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

    Route::middleware(['ensureAdmin'])->group(function () {
        Route::get('/', [AdminDashboardController::class, 'overview'])->name('overview');
        Route::get('/dashboard', fn() => redirect()->route('overview'))->name('admin.dashboard');
        Route::get('/all-users', [AdminDashboardController::class, 'users'])->name('all-users');
        Route::delete('/users/{user}', [AdminDashboardController::class, 'destroyUser'])->name('admin.users.destroy');
        Route::get('/user-detail/{id}', [AdminDashboardController::class, 'userDetail'])
            ->name('user.detail');
        Route::post('/users/{user}/ban', [AdminDashboardController::class, 'banUser'])->name('admin.users.ban');
        Route::get('/banned-accounts', [BannedAccountController::class, 'index'])->name('admin.banned.index');
        Route::get('/banned-accounts/details/{id}', [BannedAccountController::class, 'show'])->name('admin.banned.show');
        Route::delete('/banned-accounts/{id}', [BannedAccountController::class, 'destroy'])->name('admin.banned.destroy');


        Route::get('/get-submit-blog', [AdminBlogController::class, 'see'])->name('admin.submit-blog');
        Route::post('/submit-blog', [AdminBlogController::class, 'store'])->name('admin.submit-blog.post');
        Route::get('/blogs', [BlogAdminController::class, 'index'])->name('admin.blogs.index');
        Route::get('/blogs/{blog}/edit', [BlogAdminController::class, 'edit'])->name('admin.blogs.edit');
        Route::put('/blogs/{blog}', [BlogAdminController::class, 'update'])->name('admin.blogs.update');
        Route::delete('/blogs/{blog}', [BlogAdminController::class, 'destroy'])->name('admin.blogs.destroy');
        Route::get('/blogs/{blog}/comments', [BlogAdminController::class, 'comments'])->name('admin.blogs.comments');
        Route::delete('/blogs/{blog}/comments/{comment}', [BlogAdminController::class, 'destroyComment'])->name('admin.blogs.comments.destroy');



        Route::get('/chat', [ChatAdminController::class, 'index'])->name('admin.chat.index');
        Route::get('/chat/conversations', [ChatAdminController::class, 'list'])->name('admin.chat.list');
        Route::get('/chat/conversations/{token}/messages', [ChatAdminController::class, 'messages'])->name('admin.chat.messages');
        Route::post('/chat/conversations/{token}/messages', [ChatAdminController::class, 'send'])->name('admin.chat.send');
        Route::post('/chat/conversations/{token}/read', [ChatAdminController::class, 'markRead'])
            ->name('admin.chat.read');
        Route::post('/chat/conversations/{token}/status', [ChatAdminController::class, 'updateStatus'])->name('admin.chat.status');



        Route::get('all-properties', [AdminDashboardController::class, 'properties'])->name('all-properties');
        Route::get('/property-detail/{id}', [AdminDashboardController::class, 'propertyDetail'])
            ->name('property.detail');
        Route::delete('/properties/{property}', [AdminDashboardController::class, 'destroy'])
            ->name('properties.destroy');
    });
});

Route::get('/storage/{path}', function (string $path) {
    if (! Storage::disk('public')->exists($path)) abort(404);
    return Storage::disk('public')->response($path);
})->where('path', '.*');
