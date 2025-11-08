@extends('layouts.admin', ['title' => 'All Properties'])

@section('content')
<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold">All Properties</h1>
    <p class="text-gray-600">Filter and manage properties.</p>
  </div>
  <div class="flex gap-3">
    <div class="bg-white rounded-lg shadow px-4 py-2 text-sm">Total: <span class="font-semibold">{{ number_format($totalProperties) }}</span></div>
    <div class="bg-white rounded-lg shadow px-4 py-2 text-sm">Active: <span class="font-semibold text-green-600">{{ number_format($activeProperties) }}</span></div>
    <div class="bg-white rounded-lg shadow px-4 py-2 text-sm">Pending: <span class="font-semibold text-yellow-600">{{ number_format($pendingProperties) }}</span></div>
  </div>
</div>

@if(session('success'))
<div class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-sm">
  {{ session('success') }}
</div>
@endif

<div class="bg-white rounded-xl shadow p-5 mb-6">
  <form method="get" action="{{ route('all-properties') }}" class="grid md:grid-cols-6 gap-4">
    <div class="md:col-span-2">
      <label class="text-sm text-gray-600">Search (title, location)</label>
      <input type="text" name="q" value="{{ request('q') }}" placeholder="e.g. 2BHK, Andheri"
        class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
    </div>
    <div>
      <label class="text-sm text-gray-600">Type</label>
      <select name="type" class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
        <option value="">Any</option>
        @foreach(['pg','flat','house','commercial','land'] as $t)
        <option value="{{ $t }}" @selected(request('type')===$t)>{{ strtoupper($t) }}</option>
        @endforeach
      </select>
    </div>
    <div>
      <label class="text-sm text-gray-600">For</label>
      <select name="for" class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
        <option value="">Any</option>
        @foreach(['rent','sale'] as $f)
        <option value="{{ $f }}" @selected(request('for')===$f)>{{ ucfirst($f) }}</option>
        @endforeach
      </select>
    </div>
    <div>
      <label class="text-sm text-gray-600">Status</label>
      <select name="status" class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
        <option value="">Any</option>
        @foreach(['active','pending'] as $s)
        <option value="{{ $s }}" @selected(request('status')===$s)>{{ ucfirst($s) }}</option>
        @endforeach
      </select>
    </div>
    <div>
      <label class="text-sm text-gray-600">Furnishing</label>
      <select name="furnishing" class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
        <option value="">Any</option>
        @foreach(['furnished','semifurnished','unfurnished'] as $fu)
        <option value="{{ $fu }}" @selected(request('furnishing')===$fu)>{{ ucfirst($fu) }}</option>
        @endforeach
      </select>
    </div>

    <div>
      <label class="text-sm text-gray-600">Min Bedrooms</label>
      <input type="number" min="0" name="min_bedrooms" value="{{ request('min_bedrooms') }}"
        class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
    </div>
    <div>
      <label class="text-sm text-gray-600">Max Bedrooms</label>
      <input type="number" min="0" name="max_bedrooms" value="{{ request('max_bedrooms') }}"
        class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
    </div>
    <div>
      <label class="text-sm text-gray-600">Min Price (₹)</label>
      <input type="number" min="0" name="min_price" value="{{ request('min_price') }}"
        class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
    </div>
    <div>
      <label class="text-sm text-gray-600">Max Price (₹)</label>
      <input type="number" min="0" name="max_price" value="{{ request('max_price') }}"
        class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
    </div>
    <div>
      <label class="text-sm text-gray-600">Owner (User ID)</label>
      <input type="number" min="1" name="user_id" value="{{ request('user_id') }}"
        class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" placeholder="e.g. 12">
    </div>
    <div>
      <label class="text-sm text-gray-600">Sort</label>
      <select name="sort" class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
        <option value="">Newest</option>
        <option value="oldest" @selected(request('sort')==='oldest' )>Oldest</option>
        <option value="price_asc" @selected(request('sort')==='price_asc' )>Price ↑</option>
        <option value="price_desc" @selected(request('sort')==='price_desc' )>Price ↓</option>
      </select>
    </div>
    <div class="md:col-span-6 flex justify-end gap-2">
      <a href="{{ route('all-properties') }}" class="px-4 py-2 rounded border">Reset</a>
      <button class="px-4 py-2 rounded bg-indigo-600 text-white">Filter</button>
    </div>
  </form>
</div>



<div class="bg-white rounded-xl shadow overflow-x-auto">
  <table class="min-w-full text-sm">
    <thead class="bg-gray-50 text-gray-600">
      <tr>
        <th class="px-4 py-3 text-left font-semibold">Property</th>
        <th class="px-4 py-3 text-left font-semibold">Location</th>
        <th class="px-4 py-3 text-left font-semibold">Owner</th>
        <th class="px-4 py-3 text-left font-semibold">Price</th>
        <th class="px-4 py-3 text-left font-semibold">Status</th>
        <!-- <th class="px-4 py-3 text-left font-semibold">Posted</th> -->
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
      <tr class="hover:bg-gray-50 cursor-pointer"
        tabindex="0"
        onclick=window.location='{{ route('property.detail', $prop->id) }}'
        onkeydown="if(event.key==='Enter'){ window.location='{{ route('property.detail', $prop->id) }}' }">
        <td class="px-4 py-3">
          <div class="flex items-center gap-3">
            <a href="{{ route('property.detail', $prop->id) }}" onclick="event.stopPropagation();">
              <img src="{{ $thumbUrl }}" class="w-20 h-14 object-cover rounded border" alt="thumb">
            </a>
            <div>
              <a href="{{ route('property.detail', $prop->id) }}" class="font-medium text-indigo-600 hover:underline" onclick="event.stopPropagation();">
                {{ $prop->title }}
              </a>
              <!-- <div class="text-xs text-gray-500">Type: {{ strtoupper($prop->type) }} • For: {{ ucfirst($prop->for) }}</div> -->
            </div>
          </div>
        </td>
        <td class="px-4 py-3 text-gray-700">
          <div class="truncate max-w-xs" title="{{ $prop->location ?? $prop->formatted_address }}">
            {{ $prop->location ?? $prop->formatted_address ?? '-' }}
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="font-medium">{{ optional($prop->user)->name ?? 'Unknown' }}</div>
          <div class="text-xs text-gray-500">
            {{ optional($prop->user)->email }} @if(optional($prop->user)->phone) • {{ optional($prop->user)->phone }} @endif
          </div>
        </td>
        <td class="px-4 py-3 font-semibold text-indigo-700">₹{{ number_format($prop->price) }}</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center px-2 py-0.5 rounded bg-{{ $prop->status === 'active' ? 'green' : 'yellow' }}-100 text-{{ $prop->status === 'active' ? 'green' : 'yellow' }}-700">
            {{ ucfirst($prop->status) }}
          </span>
        </td>
        <!-- <td class="px-4 py-3 text-gray-600">{{ $prop->created_at->format('d M Y') }}</td> -->
      </tr>
      @empty
      <tr>
        <td colspan="6" class="px-4 py-6 text-center text-gray-500">No properties found.</td>
      </tr>
      @endforelse
    </tbody>
  </table>
</div>

<div class="mt-4">
  {{ $properties->onEachSide(1)->links() }}
</div>
@endsection