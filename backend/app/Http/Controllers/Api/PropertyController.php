<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $q = Property::query()->with('user:id,name,phone,email,role');

        if ($s = $request->query('q')) {
            $s = mb_strtolower($s);
            $q->where(function ($w) use ($s) {
                $w->whereRaw('LOWER(title) LIKE ?', ["%$s%"])
                    ->orWhereRaw('LOWER(description) LIKE ?', ["%$s%"])
                    ->orWhereRaw('LOWER(location) LIKE ?', ["%$s%"])
                    ->orWhereRaw('LOWER(display_label) LIKE ?', ["%$s%"])
                    ->orWhereRaw('LOWER(formatted_address) LIKE ?', ["%$s%"])
                    ->orWhereRaw('LOWER(location_tokens) LIKE ?', ["%$s%"]);
            });
        }

        if (!$request->user()) { // anonymous user
            $q->where('status', 'active');
        }

        if ($loc = $request->query('location')) {
            $loc = mb_strtolower($loc);
            $q->where(function ($w) use ($loc) {
                $w->whereRaw('LOWER(location) LIKE ?', ["%$loc%"])
                    ->orWhereRaw('LOWER(display_label) LIKE ?', ["%$loc%"])
                    ->orWhereRaw('LOWER(formatted_address) LIKE ?', ["%$loc%"])
                    ->orWhereRaw('LOWER(location_tokens) LIKE ?', ["%$loc%"]);
            });
        }
        if ($type = $request->query('type')) $q->where('type', $type);
        if ($for  = $request->query('for'))  $q->where('for', $for);
        if ($furn = $request->query('furnishing')) $q->where('furnishing', $furn);

        if ($request->filled('available_immediately')) {
            $val = $request->query('available_immediately');
            $yes = in_array(strtolower((string)$val), ['1', 'true', 'yes'], true);
            $q->where('available_immediately', $yes ? 1 : 0);
        }

        if ($request->filled('ready_to_move')) {
            $val = $request->query('ready_to_move');
            $yes = in_array(strtolower((string)$val), ['1', 'true', 'yes'], true);
            $q->where('ready_to_move', $yes ? 1 : 0);
        }

        if ($tenants = $request->query('preferred_tenants')) {
            $tenants = strtolower($tenants);
            if ($tenants === 'family') {
                $q->whereIn('preferred_tenants', ['family', 'both']);
            } elseif ($tenants === 'bachelor') {
                $q->whereIn('preferred_tenants', ['bachelor', 'both']);
            } elseif ($tenants === 'both') {
                $q->where('preferred_tenants', 'both');
            }
        }

        if (($bed = $request->query('bedrooms')) && $bed !== 'any') {
            if ($bed === '4+') $q->where('bedrooms', '>=', 4);
            else $q->where('bedrooms', (int) $bed);
        }

        if (($bath = $request->query('bathrooms')) && $bath !== 'any') {
            if ($bath === '3+') $q->where('bathrooms', '>=', 3);
            else $q->where('bathrooms', (int) $bath);
        }

        if ($range = $request->query('price')) {
            if ($range === '0-10000') {
                $q->where('price', '<=', 10000);
            } elseif ($range === '100000+') {
                $q->where('price', '>', 100000);
            } else {
                [$min, $max] = array_map('intval', explode('-', $range));
                $q->whereBetween('price', [$min, $max]);
            }
        } else {
            if ($min = $request->query('minPrice')) $q->where('price', '>=', (int) $min);
            if ($max = $request->query('maxPrice')) $q->where('price', '<=', (int) $max);
        }

        $amenities = $request->input('amenities', []);
        if (is_array($amenities) && count($amenities)) {
            foreach ($amenities as $amenity) $q->whereJsonContains('amenities', $amenity);
        }

        // ADD THIS: filter by who listed the property (user.role)
        if ($listedBy = $request->query('listed_by')) {
            $q->whereHas('user', function ($w) use ($listedBy) {
                $w->where('role', $listedBy); // 'owner' | 'builder' (adjust if your builder uses a different role)
            });
        }

        // ADD: filter by specific lister (user)
        if ($userId = $request->query('user_id')) {
            $q->where('user_id', (int) $userId);
        }

        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $hasCoords = $lat !== null && $lng !== null && $lat !== '' && $lng !== '';
        $radius = (int) ($request->query('radius') ?? 20000);

        // Apply text narrowing ONLY in text-mode
        if (!$hasCoords) {
            if ($s = $request->query('q')) {
                $s = mb_strtolower($s);
                $q->where(function ($w) use ($s) {
                    $w->whereRaw('LOWER(title) LIKE ?', ["%$s%"])
                        ->orWhereRaw('LOWER(description) LIKE ?', ["%$s%"])
                        ->orWhereRaw('LOWER(location) LIKE ?', ["%$s%"])
                        ->orWhereRaw('LOWER(display_label) LIKE ?', ["%$s%"])
                        ->orWhereRaw('LOWER(formatted_address) LIKE ?', ["%$s%"])
                        ->orWhereRaw('LOWER(location_tokens) LIKE ?', ["%$s%"]);
                });
            }
            if ($loc = $request->query('location')) {
                $loc = mb_strtolower($loc);
                $q->where(function ($w) use ($loc) {
                    $w->whereRaw('LOWER(location) LIKE ?', ["%$loc%"])
                        ->orWhereRaw('LOWER(display_label) LIKE ?', ["%$loc%"])
                        ->orWhereRaw('LOWER(formatted_address) LIKE ?', ["%$loc%"])
                        ->orWhereRaw('LOWER(location_tokens) LIKE ?', ["%$loc%"]);
                });
            }
        }

        // Nearby mode: compute distance, filter by radius, sort by nearest
        if ($hasCoords) {
            $latF = (float) $lat;
            $lngF = (float) $lng;

            $h = "(6371000 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat))))";

            $q->select('properties.*')
                ->selectRaw("$h AS distance", [$latF, $lngF, $latF])
                ->whereNotNull('lat')
                ->whereNotNull('lng')
                ->having('distance', '<=', $radius)
                ->orderBy('distance', 'asc');
        } else {
            $sortBy = $request->query('sortBy', 'newest');
            switch ($sortBy) {
                case 'oldest':
                    $q->orderBy('created_at', 'asc');
                    break;
                case 'priceLowToHigh':
                    $q->orderBy('price', 'asc');
                    break;
                case 'priceHighToLow':
                    $q->orderBy('price', 'desc');
                    break;
                default:
                    $q->orderBy('created_at', 'desc');
            }
        }


        // if ($lat !== null && $lng !== null && $lat !== '' && $lng !== '') {
        //     $h = "(6371000 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat))))";
        //     $q->select('*')->selectRaw("$h AS distance", [$lat, $lng, $lat])
        //         ->whereNotNull('lat')->whereNotNull('lng')
        //         ->whereRaw("$h < ?", [$lat, $lng, $lat, $radius])
        //         ->orderBy('distance');
        // } else {
        //     $sortBy = $request->query('sortBy', 'newest');
        //     switch ($sortBy) {
        //         case 'oldest':
        //             $q->orderBy('created_at', 'asc');
        //             break;
        //         case 'priceLowToHigh':
        //             $q->orderBy('price', 'asc');
        //             break;
        //         case 'priceHighToLow':
        //             $q->orderBy('price', 'desc');
        //             break;
        //         case 'newest':
        //         default:
        //             $q->orderBy('created_at', 'desc');
        //     }
        // }


        $perPage = (int) $request->query('per_page', 12);
        return response()->json($q->paginate($perPage));
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['owner', 'broker', 'builder'])) {
            return response()->json(['message' => 'Only owners, brokers, and builders can list properties.'], 403);
        }

        try {
            // 1) Normalize duplicated/malformed inputs BEFORE validate()
            $normalizeScalar = function (string $key) use ($request) {
                $v = $request->input($key);
                if (is_array($v)) {
                    $request->merge([$key => end($v)]); // keep last occurrence
                }
            };

            // Scalars we expect as strings
            foreach (['display_label', 'location', 'formatted_address', 'place_id', 'postal_code', 'city'] as $key) {
                $normalizeScalar($key);
            }

            // lat/lng may arrive as arrays or partial/non-numeric => drop both to trigger geocode
            foreach (['lat', 'lng'] as $key) {
                $v = $request->input($key);
                if (is_array($v)) {
                    $request->merge([$key => end($v)]);
                }
            }
            $latRaw = $request->input('lat');
            $lngRaw = $request->input('lng');
            $latOk = $latRaw !== null && $latRaw !== '' && is_numeric($latRaw);
            $lngOk = $lngRaw !== null && $lngRaw !== '' && is_numeric($lngRaw);
            if (!($latOk && $lngOk)) {
                // Remove both so the validator won't fail and we can geocode later
                $request->request->remove('lat');
                $request->request->remove('lng');
            }

            // location_components must be a JSON string if present
            $lc = $request->input('location_components');
            if (is_array($lc)) {
                $request->merge(['location_components' => json_encode($lc)]);
            } elseif (is_string($lc) && $lc !== '') {
                json_decode($lc);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $request->request->remove('location_components');
                }
            }

            // 2) Validate as usual
            $data = $request->validate([
                'title'       => 'required|string|max:255',
                'description' => 'required|string',
                'type'        => 'required|in:pg,flat,house,commercial,land',
                'for'         => 'required|in:rent,sale',
                'price'       => 'required|integer|min:0',
                'location'    => 'required|string|max:255',
                'bedrooms'    => 'nullable|integer|min:0',
                'bathrooms'   => 'nullable|integer|min:0',
                'area'        => 'nullable|numeric|min:0',
                'furnishing'  => 'nullable|in:furnished,semifurnished,unfurnished',
                'amenities'   => 'nullable|array',
                'amenities.*' => 'string',
                'images'      => 'sometimes|array|max:10',
                'images.*'    => 'file|mimetypes:image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,image/gif,image/bmp,image/tiff|max:15360',
                'imageUrls'   => 'sometimes|array',
                'imageUrls.*' => 'string|url',

                'place_id'            => 'nullable|string|max:255',
                'lat'                 => 'nullable|numeric|between:-90,90',
                'lng'                 => 'nullable|numeric|between:-180,180',
                'postal_code'         => 'nullable|string|max:32',
                'city'                => 'nullable|string|max:255',
                'display_label'       => 'nullable|string|max:255',
                'formatted_address'   => 'nullable|string|max:512',
                'location_components' => 'nullable|json',
                'location_tokens'     => 'nullable|string',
                // NEW: allow passing status but default to active if not provided
                'status'              => 'sometimes|in:pending,active',
                // NEW optional fields
                'available_immediately' => 'nullable|boolean',
                'available_from_date'   => 'nullable|date',
                'ready_to_move'         => 'nullable|boolean',
                'possession_date'       => 'nullable|date',
                'preferred_tenants'     => 'nullable|in:family,bachelor,both',
            ], [
                'images.*.file'      => 'The :nth image must be a valid file.',
                'images.*.mimetypes' => 'The :nth image must be one of: JPEG, PNG, WEBP, AVIF, HEIC, HEIF, GIF, BMP, or TIFF.',
                'images.*.max'       => 'The :nth image must not exceed 15 MB.',
            ]);

            // Cast area to int if provided
            if (array_key_exists('area', $data) && $data['area'] !== null && $data['area'] !== '') {
                $data['area'] = (int) $data['area'];
            }

            // Images
            $images = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $file) {
                    if (!$file->isValid()) {
                        throw ValidationException::withMessages([
                            'images' => 'The ' . $this->ordinal($index + 1) . ' image is invalid or corrupted.',
                        ]);
                    }
                    $path = $file->store('properties/' . $user->id, 'public');
                    $images[] = url(Storage::url($path));
                }
            }
            if (!empty($data['imageUrls'])) {
                foreach ($data['imageUrls'] as $u) if ($u) $images[] = $u;
            }

            // Components (client or default)
            $components = json_decode($request->input('location_components', '{}'), true) ?: [];

            // Ensure a display label
            if (empty($data['display_label'])) {
                $data['display_label'] = $data['location'];
            }

            // Geocode if either LAT or LNG is missing (pre-normalization removed partials)
            $needGeo = !isset($data['lat']) || !isset($data['lng']);
            if ($needGeo) {
                $qStr = $data['display_label'] ?: $data['location'];
                if ($qStr) {
                    if ($geo = $this->geocodeAddress($qStr)) {
                        $data['lat'] = $geo['lat'];
                        $data['lng'] = $geo['lng'];
                        if (empty($data['formatted_address']) && !empty($geo['formatted'])) {
                            $data['formatted_address'] = $geo['formatted'];
                        }
                        $components = array_filter(
                            array_merge($components, $geo['components'] ?? []),
                            fn($v) => $v !== null && $v !== ''
                        );
                    }
                }
            }

            // Tokens
            $tokens = $request->input('location_tokens');
            if (!$tokens) {
                $tokens = $this->buildLocationTokens([
                    'route'       => $components['route'] ?? '',
                    'sublocality' => $components['sublocality'] ?? '',
                    'locality'    => $components['locality'] ?? ($data['city'] ?? ''),
                    'admin1'      => $components['admin1'] ?? '',
                    'admin2'      => $components['admin2'] ?? '',
                    'postalCode'  => $components['postalCode'] ?? ($data['postal_code'] ?? ''),
                    'alias'       => $this->aliasFor($components['route'] ?? ''),
                ]);
            }

            Log::debug('Property store geo', [
                'q' => $data['display_label'] ?? $data['location'] ?? null,
                'lat' => $data['lat'] ?? null,
                'lng' => $data['lng'] ?? null,
                'components' => $components,
            ]);

            $doc = Property::create([
                'user_id'             => $user->id,
                'title'               => $data['title'],
                'description'         => $data['description'],
                'type'                => $data['type'],
                'for'                 => $data['for'],
                'price'               => $data['price'],
                'location'            => $data['location'],
                'display_label'       => $data['display_label'] ?? $data['location'],
                'formatted_address'   => $data['formatted_address'] ?? null,
                'place_id'            => $data['place_id'] ?? null,
                'lat'                 => $data['lat'] ?? null,
                'lng'                 => $data['lng'] ?? null,
                'location_components' => $components ?: null,
                'location_tokens'     => $tokens,
                'bedrooms'            => $data['bedrooms'] ?? null,
                'bathrooms'           => $data['bathrooms'] ?? null,
                'area'                => $data['area'] ?? null,
                'furnishing'          => $data['furnishing'] ?? null,
                'amenities'           => $data['amenities'] ?? [],
                'images'              => $images,
                // NEW
                'available_immediately' => array_key_exists('available_immediately', $data) ? (bool)$data['available_immediately'] : null,
                'available_from_date'   => $data['available_from_date'] ?? null,
                'ready_to_move'         => array_key_exists('ready_to_move', $data) ? (bool)$data['ready_to_move'] : null,
                'possession_date'       => $data['possession_date'] ?? null,
                'preferred_tenants'     => $data['preferred_tenants'] ?? null,
                'status' => $data['status'] ?? 'active',
            ]);

            return response()->json($doc, 201);
        } catch (ValidationException $e) {
            $errors = $e->errors();
            $customErrors = [];
            foreach ($errors as $field => $messages) {
                if (preg_match('/^images\.(\d+)$/', $field, $m)) {
                    $nth = $this->ordinal(((int)$m[1]) + 1);
                    $customErrors[$field] = array_map(fn($msg) => str_replace(':nth', $nth, $msg), $messages);
                } else {
                    $customErrors[$field] = $messages;
                }
            }
            return response()->json(['message' => 'Please check your inputs.', 'errors' => $customErrors], 422);
        } catch (\Exception $e) {
            Log::error('Property store error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'exception' => $e,
                'request_data' => $request->except(['images']),
            ]);
            return response()->json(['message' => 'Unable to save your property. Please try again.'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $doc = Property::with('user:id,name,phone,email,role')->find($id);
        if (!$doc) return response()->json(['message' => 'Not found'], 404);
        return response()->json($doc);
    }

    public function featured(Request $request)
    {
        $limit = (int) $request->query('limit', 6);

        $q = Property::query()
            ->with('user:id,name,phone,email,role')
            ->select('properties.*')
            ->selectRaw("
                (
                  (CASE WHEN COALESCE(JSON_LENGTH(images),0) >= 3 THEN 2 ELSE 0 END) +
                  (CASE WHEN CHAR_LENGTH(COALESCE(description, '')) >= 120 THEN 2 ELSE 0 END) +
                  (CASE WHEN bedrooms IS NOT NULL THEN 1 ELSE 0 END) +
                  (CASE WHEN bathrooms IS NOT NULL THEN 1 ELSE 0 END) +
                  (CASE WHEN area IS NOT NULL THEN 1 ELSE 0 END) +
                  (CASE WHEN furnishing IS NOT NULL THEN 1 ELSE 0 END) +
                  (CASE WHEN COALESCE(JSON_LENGTH(amenities),0) >= 3 THEN 1 ELSE 0 END)
                ) AS details_score
            ")
            ->whereNotNull('images')
            ->whereRaw('COALESCE(JSON_LENGTH(images),0) > 0')
            ->whereNotNull('description');

        if ($type = $request->query('type')) $q->where('type', $type);
        if ($for  = $request->query('for'))  $q->where('for', $for);
        if ($loc  = $request->query('location')) $q->where('location', 'like', "%$loc%");

        $featured = $q->orderByDesc('details_score')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return response()->json($featured);
    }

    public function myProperties(Request $request)
    {
        $perPage = (int) $request->query('per_page', 12);
        $status = $request->query('status'); // 'active' | 'inactive' | null

        $q = Property::query()
            ->where('user_id', $request->user()->id)
            ->with('user:id,name,phone,email,role')
            ->orderByDesc('created_at');

        if ($status === 'active') {
            $q->where('status', 'active');
        } elseif ($status === 'inactive') {
            // Inactive = anything not 'active' (including null/pending)
            $q->where(function ($w) {
                $w->whereNull('status')->orWhere('status', '!=', 'active');
            });
        }

        return response()->json($q->paginate($perPage));
    }

    public function destroy(Request $request, string $id)
    {
        $prop = Property::find($id);
        if (!$prop) return response()->json(['message' => 'Not found'], 404);

        $user = $request->user();
        if ($prop->user_id !== $user->id && ($user->role ?? '') !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $prop->delete();
        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();

        try {
            $property = Property::where('id', $id)->where('user_id', $user->id)->first();
            if (!$property) {
                return response()->json(['message' => 'Property not found or you do not have permission to edit it.'], 404);
            }

            // 1) Normalize duplicated/malformed inputs BEFORE validate()
            $normalizeScalar = function (string $key) use ($request) {
                $v = $request->input($key);
                if (is_array($v)) {
                    $request->merge([$key => end($v)]); // keep last occurrence
                }
            };
            foreach (['display_label', 'location', 'formatted_address', 'place_id', 'postal_code', 'city'] as $key) {
                $normalizeScalar($key);
            }

            foreach (['lat', 'lng'] as $key) {
                $v = $request->input($key);
                if (is_array($v)) {
                    $request->merge([$key => end($v)]);
                }
            }
            $latRaw = $request->input('lat');
            $lngRaw = $request->input('lng');
            $latOk = $latRaw !== null && $latRaw !== '' && is_numeric($latRaw);
            $lngOk = $lngRaw !== null && $lngRaw !== '' && is_numeric($lngRaw);
            if (!($latOk && $lngOk)) {
                $request->request->remove('lat');
                $request->request->remove('lng');
            }

            $lc = $request->input('location_components');
            if (is_array($lc)) {
                $request->merge(['location_components' => json_encode($lc)]);
            } elseif (is_string($lc) && $lc !== '') {
                json_decode($lc);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $request->request->remove('location_components');
                }
            }

            // 2) Validate
            $data = $request->validate([
                'title'          => 'sometimes|string|min:1|max:255',
                'description'    => 'sometimes|string|min:1',
                'type'           => 'sometimes|in:pg,flat,house,commercial,land',
                'for'            => 'sometimes|in:rent,sale',
                'price'          => 'sometimes|integer|min:0',
                'location'       => 'sometimes|string|min:1|max:255',
                'bedrooms'       => 'nullable|integer|min:0',
                'bathrooms'      => 'nullable|integer|min:0',
                'area'           => 'nullable|numeric|min:0',
                'furnishing'     => 'nullable|in:furnished,semifurnished,unfurnished',
                'amenities'      => 'nullable|array',
                'amenities.*'    => 'string',
                'images'         => 'sometimes|array|max:10',
                'images.*'       => 'file|mimetypes:image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,image/gif,image/bmp,image/tiff|max:15360',
                'existingImages' => 'sometimes|array',
                'existingImages.*' => 'string|url',

                'place_id'            => 'nullable|string|max:255',
                'lat'                 => 'nullable|numeric|between:-90,90',
                'lng'                 => 'nullable|numeric|between:-180,180',
                'postal_code'         => 'nullable|string|max:32',
                'city'                => 'nullable|string|max:255',
                'display_label'       => 'nullable|string|max:255',
                'formatted_address'   => 'nullable|string|max:512',
                'location_components' => 'nullable|json',
                'location_tokens'     => 'nullable|string',
                'status' => 'sometimes|in:pending,active',
                // NEW optional fields
                'available_immediately' => 'nullable|boolean',
                'available_from_date'   => 'nullable|date',
                'ready_to_move'         => 'nullable|boolean',
                'possession_date'       => 'nullable|date',
                'preferred_tenants'     => 'nullable|in:family,bachelor,both',
            ], [
                'images.*.file'      => 'The :nth image must be a valid file.',
                'images.*.mimetypes' => 'The :nth image must be one of: JPEG, PNG, WEBP, AVIF, HEIC, HEIF, GIF, BMP, or TIFF.',
                'images.*.max'       => 'The :nth image must not exceed 15 MB.',
                'title.min'          => 'The title must not be empty.',
                'description.min'    => 'The description must not be empty.',
                'location.min'       => 'The location must not be empty.',
            ]);

            // Cast area to int if provided
            if (array_key_exists('area', $data) && $data['area'] !== null && $data['area'] !== '') {
                $data['area'] = (int) $data['area'];
            }

            // Images handling
            $images = $data['existingImages'] ?? $property->images ?? [];
            $currentImages = $property->images ?? [];
            $imagesToDelete = array_diff($currentImages, $data['existingImages'] ?? $currentImages);
            foreach ($imagesToDelete as $url) {
                $path = parse_url($url, PHP_URL_PATH);
                if ($path) {
                    $storagePath = str_replace('/storage/', '', $path);
                    Storage::disk('public')->delete($storagePath);
                }
            }
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $file) {
                    if (!$file->isValid()) {
                        throw ValidationException::withMessages([
                            'images' => 'The ' . $this->ordinal($index + 1) . ' image is invalid or corrupted.',
                        ]);
                    }
                    $path = $file->store('properties/' . $user->id, 'public');
                    $images[] = url(Storage::url($path));
                }
            }

            // Components
            $components = json_decode($request->input('location_components', '{}'), true) ?: ($property->location_components ?? []);

            // Geocode if either coord missing
            $needLat = !array_key_exists('lat', $data) || $data['lat'] === null || $data['lat'] === '';
            $needLng = !array_key_exists('lng', $data) || $data['lng'] === null || $data['lng'] === '';
            if ($needLat || $needLng) {
                $qStr = $data['display_label'] ?? $data['location'] ?? $property->display_label ?? $property->location;
                if ($qStr) {
                    if ($geo = $this->geocodeAddress($qStr)) {
                        $data['lat'] = $geo['lat'];
                        $data['lng'] = $geo['lng'];
                        if (empty($data['formatted_address']) && !empty($geo['formatted'])) {
                            $data['formatted_address'] = $geo['formatted'];
                        }
                        $components = array_filter(
                            array_merge($components, $geo['components'] ?? []),
                            fn($v) => $v !== null && $v !== ''
                        );
                    }
                }
            }

            // display_label fallback
            if (!array_key_exists('display_label', $data) || $data['display_label'] === null || $data['display_label'] === '') {
                $data['display_label'] = $property->display_label ?? ($data['location'] ?? $property->location);
            }

            // Tokens
            $tokens = $request->input('location_tokens');
            if (!$tokens) {
                $tokens = $this->buildLocationTokens([
                    'route'       => $components['route'] ?? '',
                    'sublocality' => $components['sublocality'] ?? '',
                    'locality'    => $components['locality'] ?? ($data['city'] ?? ''),
                    'admin1'      => $components['admin1'] ?? '',
                    'admin2'      => $components['admin2'] ?? '',
                    'postalCode'  => $components['postalCode'] ?? ($data['postal_code'] ?? ''),
                    'alias'       => $this->aliasFor($components['route'] ?? ''),
                ]);
            }

            $property->update([
                'title'               => $data['title'] ?? $property->title,
                'description'         => $data['description'] ?? $property->description,
                'type'                => $data['type'] ?? $property->type,
                'for'                 => $data['for'] ?? $property->for,
                'price'               => $data['price'] ?? $property->price,
                'location'            => $data['location'] ?? $property->location,

                'display_label'       => $data['display_label'] ?? $property->display_label,
                'formatted_address'   => $data['formatted_address'] ?? $property->formatted_address,
                'place_id'            => $data['place_id'] ?? $property->place_id,
                'lat'                 => $data['lat'] ?? $property->lat,
                'lng'                 => $data['lng'] ?? $property->lng,
                'location_components' => $components ?: $property->location_components,
                'location_tokens'     => $tokens ?? $property->location_tokens,

                'bedrooms'            => $data['bedrooms'] ?? $property->bedrooms,
                'bathrooms'           => $data['bathrooms'] ?? $property->bathrooms,
                'area'                => $data['area'] ?? $property->area,
                'furnishing'          => $data['furnishing'] ?? $property->furnishing,
                'amenities'           => $data['amenities'] ?? $property->amenities,
                'images'              => $images,
                // NEW
                'available_immediately' => array_key_exists('available_immediately', $data) ? (bool)$data['available_immediately'] : $property->available_immediately,
                'available_from_date'   => array_key_exists('available_from_date', $data) ? $data['available_from_date'] : $property->available_from_date,
                'ready_to_move'         => array_key_exists('ready_to_move', $data) ? (bool)$data['ready_to_move'] : $property->ready_to_move,
                'possession_date'       => array_key_exists('possession_date', $data) ? $data['possession_date'] : $property->possession_date,
                'preferred_tenants'     => array_key_exists('preferred_tenants', $data) ? $data['preferred_tenants'] : $property->preferred_tenants,
                'status' => $data['status'] ?? $property->status,
            ]);

            return response()->json($property->refresh(), 200);
        } catch (ValidationException $e) {
            $errors = $e->errors();
            $customErrors = [];
            foreach ($errors as $field => $messages) {
                if (preg_match('/^images\.(\d+)$/', $field, $m)) {
                    $nth = $this->ordinal(((int)$m[1]) + 1);
                    $customErrors[$field] = array_map(fn($msg) => str_replace(':nth', $nth, $msg), $messages);
                } else {
                    $customErrors[$field] = $messages;
                }
            }
            return response()->json(['message' => 'Please check your inputs.', 'errors' => $customErrors], 422);
        } catch (\Exception $e) {
            Log::error('Property update error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'property_id' => $id,
                'request_data' => $request->except(['images']),
                'exception' => $e,
            ]);
            return response()->json(['message' => 'Unable to update your property. Please try again.'], 500);
        }
    }

    // Helpers
    private function normalize(string $s): string
    {
        $s = mb_strtolower($s);
        $s = str_replace('.', '', $s);
        return trim($s);
    }

    private function aliasFor(string $route): ?string
    {
        $map = [
            'general mahadev singh road' => 'gms road',
            'gen mahadev singh road'     => 'gms road',
            'g m s road'                 => 'gms road',
            'mahatma gandhi road'        => 'mg road',
            'm g road'                   => 'mg road',
            'rajpur road'                => 'rajpur rd',
            'national highway 7'         => 'nh 7',
        ];
        $key = $this->normalize($route);
        return $map[$key] ?? null;
    }

    private function buildLocationTokens(array $parts): string
    {
        $tok = [];
        $push = function ($s) use (&$tok) {
            $s = $this->normalize($s ?? '');
            if (!$s) return;
            $tok[] = $s;
            // common variants
            $tok[] = str_replace(' road', ' rd', $s);
            $tok[] = str_replace(' rd.', ' rd', $s);
            $tok[] = str_replace(' marg', ' road', $s);
        };

        foreach (['route', 'alias', 'sublocality', 'locality', 'admin1', 'admin2', 'postalCode'] as $k) {
            if (!empty($parts[$k])) $push($parts[$k]);
        }
        $tok = array_values(array_unique(array_filter($tok)));
        return implode(' ', $tok);
    }

    private function ordinal(int $number): string
    {
        $ends = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
        if (($number % 100) >= 11 && ($number % 100) <= 13) return $number . 'th';
        return $number . ($ends[$number % 10] ?? 'th');
    }

    private function geocodeAddress(string $query): ?array
    {
        try {
            $resp = Http::withHeaders(['User-Agent' => 'EasyLease/1.0 (support@easylease.app)'])
                ->timeout(8)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'format' => 'jsonv2',
                    'q' => $query,
                    'limit' => 1,
                    'addressdetails' => 1,
                ]);

            if (!$resp->ok()) return null;
            $first = $resp->json()[0] ?? null;
            if (!$first || empty($first['lat']) || empty($first['lon'])) return null;

            $addr = $first['display_name'] ?? null;
            $a = $first['address'] ?? [];

            $city = $a['city'] ?? $a['town'] ?? $a['village'] ?? $a['county'] ?? $a['state'] ?? null;

            return [
                'lat' => (float) $first['lat'],
                'lng' => (float) $first['lon'],
                'formatted' => $addr,
                'components' => [
                    'route'       => $a['road'] ?? null,
                    'sublocality' => $a['suburb'] ?? $a['neighbourhood'] ?? $a['city_district'] ?? $a['borough'] ?? null,
                    'locality'    => $city,
                    'admin1'      => $a['state'] ?? null,
                    'admin2'      => $a['county'] ?? null,
                    'postalCode'  => $a['postcode'] ?? null,
                ],
            ];
        } catch (\Throwable $e) {
            Log::warning('Geocode failed', ['q' => $query, 'err' => $e->getMessage()]);
            return null;
        }
    }

    public function updateStatus(Request $request, string $id)
    {
        $user = $request->user();

        // Validate input
        $data = $request->validate([
            'status' => 'required|in:pending,active',
        ]);

        // Find property and authorize
        $property = Property::find($id);
        if (!$property) {
            return response()->json(['message' => 'Not found'], 404);
        }
        if ($property->user_id !== $user->id && (($user->role ?? '') !== 'admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Update and return
        $property->status = $data['status'];
        $property->save();

        return response()->json($property->refresh(), 200);
    }

    public function toggleStatus(Request $request, string $id)
    {
        $user = $request->user();

        $property = Property::find($id);
        if (!$property) {
            return response()->json(['message' => 'Not found'], 404);
        }
        if ($property->user_id !== $user->id && (($user->role ?? '') !== 'admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $next = $property->status === 'active' ? 'pending' : 'active';
        $property->status = $next;
        $property->save();

        return response()->json($property->refresh(), 200);
    }
}
