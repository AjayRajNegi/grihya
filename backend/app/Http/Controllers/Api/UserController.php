<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Property;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function agents(Request $request)
    {
        $perPage    = (int) $request->query('per_page', 12);
        $cityFilter = $request->query('city');
        $hasUsersCity = Schema::hasColumn('users', 'city');

        $q = User::query()
            ->where('users.role', 'broker')
            ->orderBy('users.name', 'asc')
            ->select('users.id', 'users.name', 'users.role');

        if ($hasUsersCity) {
            $q->addSelect('users.city');
            if ($cityFilter) {
                $q->where('users.city', 'like', "%{$cityFilter}%");
            }
        } else {
            // Derive city from the latest property
            $citySub = Property::query()
                ->selectRaw("COALESCE(
                    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(location_components, '$.locality')), ''),
                    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(location_components, '$.admin2')), ''),
                    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(location_components, '$.admin1')), '')
                )")
                ->whereColumn('properties.user_id', 'users.id')
                ->orderByDesc('created_at')
                ->limit(1);
            $q->selectSub($citySub, 'city');

            if ($cityFilter) {
                $q->having('city', 'like', "%{$cityFilter}%");
            }
        }

        return response()->json($q->paginate($perPage));
    }

    // GET /api/agents/{id}/contact — requires auth; returns phone/email
    public function agentContact($id, Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $agent = User::query()
            ->select('id', 'name', 'email', 'phone', 'role')
            ->where('role', 'broker')
            ->findOrFail($id);

        return response()->json([
            'id'    => $agent->id,
            'name'  => $agent->name,
            'phone' => $agent->phone,
            'email' => $agent->email,
        ]);
    }
}
