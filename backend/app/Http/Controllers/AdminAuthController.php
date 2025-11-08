<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class AdminAuthController extends Controller
{
    // Show login page
    public function showLogin()
    {
        return view('adminauth.login');
    }

    // Handle login
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        // Fixed credentials
        $fixedUser = 'admin';
        $fixedPass = '123';

        if ($request->username === $fixedUser && $request->password === $fixedPass) {
            Session::put('isAdminLoggedIn', true);
            return redirect()->route('admin.dashboard');
        }

        return back()->withErrors(['Invalid credentials!']);
    }

    // Logout
    public function logout()
    {
        Session::forget('isAdminLoggedIn');
         return redirect()->route('admin.login');
        
    }
}
