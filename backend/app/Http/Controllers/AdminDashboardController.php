<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Property;
use App\Models\BannedAccount;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;

class AdminDashboardController extends Controller
{
    public function overview(Request $request)
    {
        // Users
        $totalUsers = User::count();
        $roles = ['tenant', 'owner', 'broker', 'builder'];
        $usersByRoleRaw = User::select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        $usersByRole = [];
        foreach ($roles as $r) {
            $usersByRole[$r] = (int) ($usersByRoleRaw[$r] ?? 0);
        }

        $totalTenants  = $usersByRole['tenant'];
        $totalOwners   = $usersByRole['owner'];
        $totalBrokers  = $usersByRole['broker'];
        $totalBuilders = $usersByRole['builder'];

        $emailVerifiedUsers = User::whereNotNull('email_verified_at')->count();
        $phoneVerifiedUsers = User::whereNotNull('phone_verified_at')->count();

        // Properties
        $totalProperties   = Property::count();
        $activeProperties  = Property::where('status', 'active')->count();
        $pendingProperties = Property::where('status', 'pending')->count();
        $inactiveProperties = $pendingProperties; // treat 'pending' as 'inactive' for KPI

        $propertiesByType = Property::select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')->pluck('count', 'type')->toArray();

        $propertiesByFor = Property::select('for', DB::raw('COUNT(*) as count'))
            ->groupBy('for')->pluck('count', 'for')->toArray();

        // Stacked: Active vs Inactive by Type
        $propsStatusByType = Property::select(
            'type',
            DB::raw("SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active_count"),
            DB::raw("SUM(CASE WHEN status!='active' THEN 1 ELSE 0 END) as inactive_count")
        )
            ->groupBy('type')
            ->get();

        $chartStatusByType = [
            'labels'   => $propsStatusByType->pluck('type')->map(fn($t) => strtoupper($t))->values(),
            'active'   => $propsStatusByType->pluck('active_count')->map(fn($v) => (int)$v)->values(),
            'inactive' => $propsStatusByType->pluck('inactive_count')->map(fn($v) => (int)$v)->values(),
        ];

        // Latest
        $latestUsers = User::withCount('properties')->latest()->take(10)->get();
        $latestProperties = Property::with('user')->latest()->take(6)->get();

        // Charts
        $chartUsersByRole = [
            'labels' => array_map('ucfirst', array_keys($usersByRole)),
            'data'   => array_values($usersByRole),
        ];
        $chartPropertiesByType = [
            'labels' => array_map('strtoupper', array_keys($propertiesByType)),
            'data'   => array_values($propertiesByType),
        ];
        $chartPropertiesByFor = [
            'labels' => array_map('ucfirst', array_keys($propertiesByFor)),
            'data'   => array_values($propertiesByFor),
        ];
        $chartStatus = [
            'labels' => ['Active', 'Pending'],
            'data'   => [$activeProperties, $pendingProperties],
        ];

        return view('admin.dashboard.overview', compact(
            'totalUsers',
            'totalTenants',
            'totalOwners',
            'totalBrokers',
            'totalBuilders',
            'emailVerifiedUsers',
            'phoneVerifiedUsers',
            'totalProperties',
            'activeProperties',
            'inactiveProperties',
            'pendingProperties',
            'latestUsers',
            'latestProperties',
            'chartUsersByRole',
            'chartPropertiesByType',
            'chartPropertiesByFor',
            'chartStatus',
            'chartStatusByType'
        ));
    }

    public function users(Request $request)
    {
        $users = User::query()
            ->withCount('properties')
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = $request->q;
                $q->where(function ($sub) use ($term) {
                    $sub->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('role'), fn($q) => $q->where('role', $request->role))
            ->when($request->filled('city'), fn($q) => $q->where('city', 'like', "%{$request->city}%"))
            ->when($request->filled('verified'), function ($q) use ($request) {
                switch ($request->verified) {
                    case 'email':
                        $q->whereNotNull('email_verified_at');
                        break;
                    case 'phone':
                        $q->whereNotNull('phone_verified_at');
                        break;
                    case 'both':
                        $q->whereNotNull('email_verified_at')->whereNotNull('phone_verified_at');
                        break;
                    case 'none':
                        $q->whereNull('email_verified_at')->whereNull('phone_verified_at');
                        break;
                }
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $totalUsers = User::count();
        $roles = ['tenant', 'owner', 'broker', 'builder'];
        $usersByRoleRaw = User::select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')->pluck('count', 'role')->toArray();

        $usersByRole = [];
        foreach ($roles as $r) $usersByRole[$r] = (int)($usersByRoleRaw[$r] ?? 0);

        return view('admin.users.index', compact('users', 'totalUsers', 'usersByRole'));
    }

    public function properties(Request $request)
    {
        $properties = Property::with('user')
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = $request->q;
                $q->where(function ($sub) use ($term) {
                    $sub->where('title', 'like', "%{$term}%")
                        ->orWhere('location', 'like', "%{$term}%")
                        ->orWhere('formatted_address', 'like', "%{$term}%")
                        ->orWhere('display_label', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('type'), fn($q) => $q->where('type', $request->type))
            ->when($request->filled('for'), fn($q) => $q->where('for', $request->for))
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('furnishing'), fn($q) => $q->where('furnishing', $request->furnishing))
            ->when($request->filled('min_bedrooms'), fn($q) => $q->where('bedrooms', '>=', (int) request('min_bedrooms')))
            ->when($request->filled('max_bedrooms'), fn($q) => $q->where('bedrooms', '<=', (int) request('max_bedrooms')))
            ->when($request->filled('min_price'), fn($q) => $q->where('price', '>=', (int) $request->min_price))
            ->when($request->filled('max_price'), fn($q) => $q->where('price', '<=', (int) $request->max_price))
            ->when($request->filled('user_id'), fn($q) => $q->where('user_id', $request->user_id))
            ->when($request->filled('sort'), function ($q) use ($request) {
                return match ($request->sort) {
                    'price_asc'  => $q->orderBy('price', 'asc'),
                    'price_desc' => $q->orderBy('price', 'desc'),
                    'oldest'     => $q->orderBy('created_at', 'asc'),
                    default      => $q->orderBy('created_at', 'desc'),
                };
            }, function ($q) {
                $q->orderBy('created_at', 'desc');
            })
            ->paginate(15)
            ->withQueryString();

        $totalProperties   = Property::count();
        $activeProperties  = Property::where('status', 'active')->count();
        $pendingProperties = Property::where('status', 'pending')->count();

        return view('admin.properties.index', compact(
            'properties',
            'totalProperties',
            'activeProperties',
            'pendingProperties'
        ));
    }

    public function propertyDetail($id)
    {
        $property = Property::with('user')->findOrFail($id);
        $images = is_array($property->images) ? $property->images : [];
        $amenities = is_array($property->amenities)
            ? $property->amenities
            : (is_string($property->amenities) ? (json_decode($property->amenities, true) ?: []) : []);

        return view('admin.properties.show', compact('property', 'images', 'amenities'));
    }

    public function userDetail($id)
    {
        $user = User::withCount('properties')->findOrFail($id);

        // User’s properties + simple stats
        $properties = Property::with('user')
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(10);

        $propsTotal   = Property::where('user_id', $user->id)->count();
        $propsActive  = Property::where('user_id', $user->id)->where('status', 'active')->count();
        $propsPending = Property::where('user_id', $user->id)->where('status', 'pending')->count();

        return view('admin.users.show', compact('user', 'properties', 'propsTotal', 'propsActive', 'propsPending'));
    }

    public function destroyUser(User $user)
    {
        DB::transaction(function () use ($user) {
            // delete/cleanup related records as needed
            Property::where('user_id', $user->id)->delete();
            // add more cleanup if you have e.g. conversations, favorites, etc.

            $user->delete();
        });

        return redirect()->route('all-users')->with('success', 'User removed successfully.');
    }

    public function banUser(Request $request, User $user)
    {
        $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($request, $user) {
            BannedAccount::updateOrCreate(
                [
                    'email' => $user->email,
                ],
                [
                    'user_id'             => $user->id,
                    'banned_by'           => auth()->id(),
                    'banned_at'           => now(),
                    'reason'              => $request->input('reason'),

                    'name'                => $user->name,
                    'email'               => $user->email,
                    'email_canonical'     => $user->email_canonical,
                    'phone'               => $user->phone,
                    'city'                => $user->city,
                    'role'                => $user->role,
                    'email_verified_at'   => $user->email_verified_at,
                    'phone_verified_at'   => $user->phone_verified_at,
                    'original_created_at' => $user->created_at,
                ]
            );

            // Optional: also ensure phone uniqueness – if email is null but phone exists
            if ($user->phone) {
                BannedAccount::updateOrCreate(
                    [
                        'phone' => $user->phone,
                    ],
                    [
                        'user_id'             => $user->id,
                        'banned_by'           => auth()->id(),
                        'banned_at'           => now(),
                        'reason'              => $request->input('reason'),

                        'name'                => $user->name,
                        'email'               => $user->email,
                        'email_canonical'     => $user->email_canonical,
                        'phone'               => $user->phone,
                        'city'                => $user->city,
                        'role'                => $user->role,
                        'email_verified_at'   => $user->email_verified_at,
                        'phone_verified_at'   => $user->phone_verified_at,
                        'original_created_at' => $user->created_at,
                    ]
                );
            }

            // Delete related records as needed, e.g. properties
            Property::where('user_id', $user->id)->delete();

            // Delete user (forceDelete if using SoftDeletes and you want hard delete)
            // $user->forceDelete();
            $user->delete();
        });

        return redirect()->route('all-users')->with('success', 'User banned and removed successfully.');
    }

    public function destroy(Property $property): RedirectResponse
    {
        // Optional but recommended if using policies:
        // $this->authorize('delete', $property);

        $property->delete(); // hard delete from `properties` table
        return redirect()
            ->route('all-properties')
            ->with('success', 'Property deleted successfully.');
    }
}
