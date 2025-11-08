@extends('layouts.admin', ['title' => 'User Detail'])
@section('title', 'User Detail')

@section('content')
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">{{ $user->name }}</h1>
      <div class="text-gray-600">Joined {{ $user->created_at?->format('d M Y') }}</div>
    </div>
    <a href="{{ route('all-users') }}" class="px-4 py-2 rounded border hover:bg-gray-50">Back</a>
  </div>
  <div class="flex items-center gap-2 justify-end">
    <!-- Ban User -->
    <form action="{{ route('admin.users.ban', $user) }}" method="POST"
          onsubmit="return confirm('Ban this user? This will delete their account and prevent sign-up with the same email/phone.');"
          class="flex items-center gap-2">
      @csrf
      <input type="text" name="reason" placeholder="Reason (optional)"
             class="hidden md:block rounded border border-gray-700 focus:ring-indigo-600 focus:border-indigo-600 text-md px-2 py-1"
             style="max-width: 220px;">
      <button type="submit"
              class="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700">
        Ban this user
      </button>
    </form>

    <!-- Remove User -->
    <form action="{{ route('admin.users.destroy', $user) }}" method="POST"
          onsubmit="return confirm('Remove this user? This will delete the account.');">
      @csrf
      @method('DELETE')
      <button type="submit"
              class="px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700">
        Remove this user
      </button>
    </form>
    </div>

  <!-- Summary cards -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <div class="bg-white rounded-xl shadow p-5">
      <div class="text-gray-500">Total Properties</div>
      <div class="mt-1 text-2xl font-bold">{{ number_format($propsTotal) }}</div>
    </div>
    <div class="bg-white rounded-xl shadow p-5">
      <div class="text-gray-500">Active</div>
      <div class="mt-1 text-2xl font-bold text-emerald-600">{{ number_format($propsActive) }}</div>
    </div>
    <div class="bg-white rounded-xl shadow p-5">
      <div class="text-gray-500">Pending</div>
      <div class="mt-1 text-2xl font-bold text-amber-600">{{ number_format($propsPending) }}</div>
    </div>
  </div>

  <!-- User info -->
  <div class="bg-white rounded-xl shadow p-6 mb-6">
    <h2 class="text-lg font-semibold mb-4">User Information</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <!-- <div>
        <div class="text-gray-500">ID</div>
        <div class="font-medium">{{ $user->id }}</div>
      </div> -->
      <div>
          <div class="text-gray-500">Name</div>
          <div class="font-medium">{{ $user->name }}</div>
        </div>
        <div>
          <div class="text-gray-500">Role</div>
          <div class="font-medium">{{ ucfirst($user->role) }}</div>
        </div>
      <div>
        <div class="text-gray-500">City</div>
        <div class="font-medium">{{ $user->city ?? '-' }}</div>
      </div>
      <div>
        <div class="text-gray-500">Email</div>
        <div class="font-medium">{{ $user->email }}</div>
      </div>
      <div>
        <div class="text-gray-500">Email (canonical)</div>
        <div class="font-medium">{{ $user->email_canonical ?? '-' }}</div>
      </div>
      <div>
        <div class="text-gray-500">Phone</div>
        <div class="font-medium">{{ $user->phone }}</div>
      </div>
      <div>
        <div class="text-gray-500">Email Verified</div>
        <div class="font-medium">{{ $user->email_verified_at ? $user->email_verified_at->format('d M Y H:i') : 'No' }}</div>
      </div>
      <div>
        <div class="text-gray-500">Phone Verified</div>
        <div class="font-medium">{{ $user->phone_verified_at ? $user->phone_verified_at->format('d M Y H:i') : 'No' }}</div>
      </div>
      <div>
        <div class="text-gray-500">Created At</div>
        <div class="font-medium">{{ $user->created_at?->format('d M Y H:i') }}</div>
      </div>
      <div>
        <div class="text-gray-500">Updated At</div>
        <div class="font-medium">{{ $user->updated_at?->format('d M Y H:i') }}</div>
      </div>
    </div>

    <div class="mt-4 text-xs text-gray-500">
      <!-- Security note: password hash and remember token are not displayed. -->
    </div>
  </div>

  <!-- Properties owned by user -->
  <div class="bg-white rounded-xl shadow">
    <div class="p-6 border-b flex items-center justify-between">
      <h2 class="text-lg font-semibold">Properties by {{ $user->name }}</h2>
      <a href="{{ route('all-properties', ['user_id' => $user->id]) }}" class="text-indigo-600 text-sm hover:underline">View All Properties</a>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="px-4 py-3 text-left font-semibold">Property</th>
            <th class="px-4 py-3 text-left font-semibold">Details</th>
            <th class="px-4 py-3 text-left font-semibold">Price</th>
            <th class="px-4 py-3 text-left font-semibold">Status</th>
            <th class="px-4 py-3 text-left font-semibold">Posted</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          @forelse($properties as $prop)
            @php
              $imgs = $prop->images ?? [];
              $thumb = $imgs[0] ?? null;
              $thumbUrl = $thumb
                ? (preg_match('/^https?:/i', $thumb) ? $thumb : asset('storage/' . ltrim($thumb, '/')))
                : 'https://via.placeholder.com/120x80?text=IMG';
            @endphp
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img src="{{ $thumbUrl }}" class="w-20 h-14 object-cover rounded border" alt="thumb">
                  <div>
                    <a href="{{ route('property.detail', $prop->id) }}" class="font-medium text-indigo-600 hover:underline">
                      {{ $prop->title }}
                    </a>
                    <div class="text-xs text-gray-500">📍 {{ $prop->location ?? $prop->formatted_address }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-700">
                <div class="flex flex-wrap gap-2">
                  <span class="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">Type: {{ strtoupper($prop->type) }}</span>
                  <span class="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">For: {{ ucfirst($prop->for) }}</span>
                  @if(!is_null($prop->bedrooms))<span class="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{{ $prop->bedrooms }} BR</span>@endif
                  @if(!is_null($prop->bathrooms))<span class="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{{ $prop->bathrooms }} Bath</span>@endif
                  @if(!is_null($prop->area))<span class="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{{ number_format($prop->area) }} sq.ft</span>@endif
                  @if($prop->furnishing)<span class="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{{ ucfirst($prop->furnishing) }}</span>@endif
                </div>
              </td>
              <td class="px-4 py-3 font-semibold text-indigo-700">₹{{ number_format($prop->price) }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2 py-0.5 rounded {{ $prop->status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700' }}">
                  {{ ucfirst($prop->status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ $prop->created_at->format('d M Y') }}</td>
            </tr>
          @empty
            <tr><td colspan="5" class="px-4 py-6 text-center text-gray-500">No properties found for this user.</td></tr>
          @endforelse
        </tbody>
      </table>
    </div>

    <div class="p-4">
      {{ $properties->onEachSide(1)->links() }}
    </div>
  </div>
@endsection