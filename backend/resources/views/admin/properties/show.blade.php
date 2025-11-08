@extends('layouts.admin', ['title' => 'Property Detail'])
@section('title', 'Property Detail')

@section('content')
<style>
    [x-cloak] {
        display: none !important;
    }
</style>

@php
// Build full URLs for all images (supports absolute and storage paths)
$rawImages = $images ?? ($property->images ?? []);
$imgUrls = [];
foreach ($rawImages as $img) {
$imgUrls[] = preg_match('/^https?:/i', $img) ? $img : asset('storage/' . ltrim($img, '/'));
}
$heroUrl = $imgUrls[0] ?? 'https://via.placeholder.com/1200x600?text=Property';
@endphp

<div
    x-data='{
    open: false,
    images: @json($imgUrls),
    current: 0,
    zoom: 1,
    openAt(i) { if (!this.images || !this.images.length) return; this.current = i; this.zoom = 1; this.open = true; this.$nextTick(() => this.focusViewer()); },
    close() { this.open = false; this.zoom = 1; },
    prev() { if (!this.images.length) return; this.current = (this.current - 1 + this.images.length) % this.images.length; this.zoom = 1; },
    next() { if (!this.images.length) return; this.current = (this.current + 1) % this.images.length; this.zoom = 1; },
    zoomIn() { this.zoom = Math.min(this.zoom + 0.25, 3); },
    zoomOut() { this.zoom = Math.max(this.zoom - 0.25, 1); },
    toggleZoom() { this.zoom = this.zoom > 1 ? 1 : 2; },
    focusViewer() { const v = this.$refs.viewer; if (v) v.focus(); }
  }'
    @keydown.window.escape="close()"
    @keydown.window.arrow-left.prevent="open && prev()"
    @keydown.window.arrow-right.prevent="open && next()">
    <div class="mb-6 flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold">{{ $property->title }}</h1>
            <div class="text-gray-600">📍 {{ $property->location ?? $property->formatted_address ?? '-' }}</div>
        </div>
        <div class="flex items-center gap-2">
            <form method="POST"
                action="{{ route('properties.destroy', $property) }}"
                onsubmit="return confirm('Are you sure you want to delete this property? This action cannot be undone.');">
                @csrf
                @method('DELETE')
                <button type="submit" class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
                    Delete this property
                </button>
            </form>
            <a href="{{ route('all-properties') }}" class="px-4 py-2 rounded border hover:bg-gray-50">Back</a>
        </div>
    </div>

    <!-- Top summary -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-xl shadow overflow-hidden">
            <img src="{{ $heroUrl }}" alt="Property Image" class="w-full h-72 object-cover cursor-zoom-in" @click="openAt(0)">
            @if(count($imgUrls) > 1)
            <div class="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                @foreach($imgUrls as $idx => $u)
                <img src="{{ $u }}" loading="lazy" class="h-20 w-full object-cover rounded border cursor-zoom-in" alt="Gallery {{ $idx+1 }}" @click="openAt({{ $idx }})">
                @endforeach
            </div>
            @endif
        </div>

        <div class="bg-white rounded-xl shadow p-5 space-y-4">
            <div class="flex items-center justify-between">
                <div class="text-3xl font-bold text-indigo-700">₹{{ number_format($property->price) }}</div>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm {{ $property->status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700' }}">
                    {{ ucfirst($property->status) }}
                </span>
            </div>
            <div class="text-sm text-gray-600">Posted on {{ $property->created_at?->format('d M Y') ?? '-' }}</div>
            <div class="border-t"></div>
            <div>
                <div class="text-sm text-gray-500">Owner</div>
                <div class="mt-1">
                    <div class="font-medium">{{ optional($property->user)->name ?? 'Unknown' }}</div>
                    <div class="text-sm text-gray-600">
                        {{ optional($property->user)->email }} @if(optional($property->user)->phone) • {{ optional($property->user)->phone }} @endif
                    </div>
                    @if($property->user_id)
                    <a href="{{ route('all-properties', ['user_id' => $property->user_id]) }}" class="text-indigo-600 text-sm hover:underline mt-1 inline-block">View this owner’s properties</a>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div class="bg-white rounded-xl shadow p-5 space-y-3">
            <h2 class="font-semibold mb-2">Property Details</h2>
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="text-gray-500">Type</div>
                <div class="font-medium">{{ strtoupper($property->type) }}</div>
                <div class="text-gray-500">For</div>
                <div class="font-medium">{{ ucfirst($property->for) }}</div>
                <div class="text-gray-500">Bedrooms</div>
                <div class="font-medium">{{ $property->bedrooms ?? '-' }}</div>
                <div class="text-gray-500">Bathrooms</div>
                <div class="font-medium">{{ $property->bathrooms ?? '-' }}</div>
                <div class="text-gray-500">Area</div>
                <div class="font-medium">{{ $property->area ? number_format($property->area) . ' sq.ft' : '-' }}</div>
                <div class="text-gray-500">Furnishing</div>
                <div class="font-medium">{{ $property->furnishing ? ucfirst($property->furnishing) : '-' }}</div>
                <div class="text-gray-500">Display Label</div>
                <div class="font-medium">{{ $property->display_label ?? '-' }}</div>
                <div class="text-gray-500">Address</div>
                <div class="font-medium">{{ $property->formatted_address ?? $property->location ?? '-' }}</div>

                @if($property->for === 'rent')
                <div class="text-gray-500">Available Now</div>
                <div class="font-medium">{{ $property->available_immediately ? 'Yes' : 'No' }}</div>
                <div class="text-gray-500">Available From</div>
                <div class="font-medium">{{ $property->available_from_date?->format('d M Y') ?? '-' }}</div>
                @else
                <div class="text-gray-500">Ready to Move</div>
                <div class="font-medium">{{ $property->ready_to_move ? 'Yes' : 'No' }}</div>
                <div class="text-gray-500">Possession</div>
                <div class="font-medium">{{ $property->possession_date?->format('d M Y') ?? '-' }}</div>
                @endif
            </div>
        </div>

        <div class="bg-white rounded-xl shadow p-5 space-y-3 lg:col-span-2">
            <h2 class="font-semibold mb-2">Description</h2>
            <p class="text-gray-700 whitespace-pre-line">{{ $property->description }}</p>

            @if(!empty($amenities))
            <div class="mt-5">
                <h3 class="font-semibold mb-2">Amenities</h3>
                <div class="flex flex-wrap gap-2">
                    @foreach($amenities as $am)
                    @if(is_string($am))
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">{{ $am }}</span>
                    @elseif(is_array($am) && isset($am['name']))
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">{{ $am['name'] }}</span>
                    @endif
                    @endforeach
                </div>
            </div>
            @endif

            @if(!empty($property->lat) && !empty($property->lng))
            <div class="mt-5">
                <h3 class="font-semibold mb-2">Map</h3>
                <div class="rounded overflow-hidden border">
                    <iframe width="100%" height="300" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"
                        src="https://maps.google.com/maps?q={{ $property->lat }},{{ $property->lng }}&z=15&output=embed"></iframe>
                </div>
            </div>
            @endif
        </div>
    </div>

    <!-- Lightbox Modal -->
    <div x-cloak x-show="open" x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
        <!-- Dim background -->
        <div class="absolute inset-0 bg-black/80 z-10" @click="close()"></div>

        <!-- Content -->
        <div class="relative z-20 max-w-6xl w-full">
            <!-- Close button -->
            <button class="absolute -top-10 right-0 text-white/90 hover:text-white" @click="close()" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <!-- Viewer -->
            <div class="bg-black rounded-lg shadow overflow-hidden outline-none" tabindex="-1" x-ref="viewer">
                <div class="relative h-[80vh] w-full overflow-auto flex items-center justify-center">
                    <img
                        :src="images[current]"
                        alt="Preview"
                        class="max-h-full max-w-full object-contain select-none transition-transform duration-200 ease-out"
                        :class="zoom > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'"
                        :style="`transform: scale(${zoom}); transform-origin: center;`"
                        @click.stop="toggleZoom()">
                </div>

                <!-- Prev -->
                <div class="absolute inset-y-0 left-0 flex items-center">
                    <button class="m-2 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white" @click.stop="prev()" aria-label="Previous">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
                <!-- Next -->
                <div class="absolute inset-y-0 right-0 flex items-center">
                    <button class="m-2 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white" @click.stop="next()" aria-label="Next">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M7.293 4.293a1 1 0 011.414 0L14 9.586a1 1 0 010 1.414l-5.293 5.293a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>

                <!-- Zoom controls -->
                <div class="absolute bottom-3 right-3 flex items-center gap-2">
                    <button class="rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 text-white text-sm" @click.stop="zoomOut()">-</button>
                    <span class="text-white text-sm select-none">Zoom: <span x-text="(zoom*100).toFixed(0) + '%'"></span></span>
                    <button class="rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 text-white text-sm" @click.stop="zoomIn()">+</button>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection