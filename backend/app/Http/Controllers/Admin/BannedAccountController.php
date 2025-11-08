<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BannedAccount;
use Illuminate\Http\Request;

class BannedAccountController extends Controller
{
    public function index(Request $request)
    {
        // Adjust ordering column as needed (e.g., 'banned_at' if present)
        $banned = BannedAccount::query()
            ->when($request->search, function ($q, $search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('user_id', 'like', "%{$search}%");
            })
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return view('admin.banned.index', compact('banned'));
    }

    public function show($id)
    {
        $account = BannedAccount::findOrFail($id);
        return view('admin.banned.show', compact('account'));
    }

    public function destroy($id)
    {
        $account = BannedAccount::findOrFail($id);
        $account->delete();

        return redirect()
            ->route('admin.banned.index')
            ->with('success', 'Account has been unbanned.');
    }
}
