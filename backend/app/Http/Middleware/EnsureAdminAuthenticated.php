<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Session;

class EnsureAdminAuthenticated
{
    public function handle($request, Closure $next)
    {
        if (!Session::get('isAdminLoggedIn')) {
            return redirect()->route('admin.login');
        }
        return $next($request);
    }
}
