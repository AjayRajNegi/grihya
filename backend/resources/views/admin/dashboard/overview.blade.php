@extends('layouts.admin', ['title' => 'Overview'])
@section('title', 'Overview')

@section('content')
<!-- Hero -->
<div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white p-8 mb-8 shadow">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold">Overview</h1>
      <p class="text-white/90">Key stats and recent activity across properties.</p>
    </div>
    <div class="flex flex-wrap gap-3">
      <div class="bg-white/10 backdrop-blur rounded-lg px-3 py-2 text-sm">Active Props: <span class="font-semibold">{{ number_format($activeProperties) }}</span></div>
      <div class="bg-white/10 backdrop-blur rounded-lg px-3 py-2 text-sm">Inactive Props: <span class="font-semibold">{{ number_format($inactiveProperties) }}</span></div>
    </div>
  </div>
</div>

<!-- Metric Cards -->
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
  <div class="bg-white rounded-xl shadow p-5">
    <div class="text-gray-500">Total Users</div>
    <div class="mt-1 text-3xl font-bold">{{ number_format($totalUsers) }}</div>
  </div>
  <div class="bg-white rounded-xl shadow p-5">
    <div class="text-gray-500">Total Tenants</div>
    <div class="mt-1 text-3xl font-bold">{{ number_format($totalTenants) }}</div>
  </div>
  <div class="bg-white rounded-xl shadow p-5">
    <div class="text-gray-500">Total Owners</div>
    <div class="mt-1 text-3xl font-bold">{{ number_format($totalOwners) }}</div>
  </div>
  <div class="bg-white rounded-xl shadow p-5">
    <div class="text-gray-500">Total Brokers</div>
    <div class="mt-1 text-3xl font-bold">{{ number_format($totalBrokers) }}</div>
  </div>
  <div class="bg-white rounded-xl shadow p-5">
    <div class="text-gray-500">Total Builders</div>
    <div class="mt-1 text-3xl font-bold">{{ number_format($totalBuilders) }}</div>
  </div>
  <div class="bg-white rounded-xl shadow p-5">
    <div class="text-gray-500">Total Properties</div>
    <div class="mt-1 text-3xl font-bold">{{ number_format($totalProperties) }}</div>
  </div>
  <div class="bg-white rounded-xl shadow p-5">
    <div class="text-gray-500">Active Properties</div>
    <div class="mt-1 text-3xl font-bold text-emerald-600">{{ number_format($activeProperties) }}</div>
  </div>
  <div class="bg-white rounded-xl shadow p-5">
    <div class="text-gray-500">Inactive Properties</div>
    <div class="mt-1 text-3xl font-bold text-amber-600">{{ number_format($inactiveProperties) }}</div>
  </div>
</div>

<!-- Charts -->
<div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
  <div class="bg-white rounded-xl shadow p-5">
    <div class="font-semibold mb-3">Users by Role</div>
    <canvas id="chartUsersByRole" height="180"></canvas>
  </div>
  <div class="bg-white rounded-xl shadow p-5 xl:col-span-2">
    <div class="font-semibold mb-3">Properties by Type (Active vs Inactive)</div>
    <canvas id="chartStatusByType" height="180"></canvas>
  </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  <!-- Latest Users -->
  <div class="bg-white rounded-xl shadow">
    <div class="p-5 border-b flex items-center justify-between">
      <div class="font-semibold">Latest Users</div>
      <a href="{{ route('all-users') }}" class="text-indigo-600 text-sm hover:underline">View All</a>
    </div>
    <ul class="divide-y">
      @forelse($latestUsers as $user)
      <li class="p-5 flex items-start justify-between gap-4">
        <div>
          <a href="{{ route('user.detail', $user->id) }}" class="font-medium text-indigo-600 hover:underline">
            {{ $user->name }}
          </a>
          <div class="text-sm text-gray-600">📧 {{ $user->email }} <br> 📞 {{ $user->phone }}</div>
          <div class="text-sm text-gray-500">
            Role: <span class="font-medium">{{ ucfirst($user->role) }}</span>
            @if($user->city) <br> City: {{ $user->city }} @endif
          </div>
          <div class="text-xs text-gray-400">Joined {{ $user->created_at->format('d M Y') }}</div>
        </div>
        <div class="text-right">
          <div class="text-xs">
            <span class="inline-flex items-center px-2 py-0.5 rounded {{ $user->email_verified_at ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700' }}">
              Email {{ $user->email_verified_at ? 'Verified' : 'Unverified' }}
            </span>
          </div>
          <div class="text-xs mt-1">
            <span class="inline-flex items-center px-2 py-0.5 rounded {{ $user->phone_verified_at ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700' }}">
              Phone {{ $user->phone_verified_at ? 'Verified' : 'Unverified' }}
            </span>
          </div>
          <div class="mt-2 text-xs text-gray-500">Props: {{ $user->properties_count }}</div>
          <a href="{{ route('user.detail', $user->id) }}" class="mt-2 inline-block text-indigo-600 text-xs hover:underline">View</a>
        </div>
      </li>
      @empty
      <li class="p-5 text-gray-500">No users found.</li>
      @endforelse
    </ul>
  </div>

  <!-- Latest Properties -->
  <div class="bg-white rounded-xl shadow">
    <div class="p-5 border-b flex items-center justify-between">
      <div class="font-semibold">Latest Properties</div>
      <a href="{{ route('all-properties') }}" class="text-indigo-600 text-sm hover:underline">View All</a>
    </div>
    <div class="p-5 grid sm:grid-cols-2 gap-5">
      @forelse($latestProperties as $property)
      @php
      $imgs = $property->images ?? [];
      $thumb = $imgs[0] ?? null;
      $thumbUrl = $thumb
      ? (preg_match('/^https?:/i', $thumb) ? $thumb : asset('storage/' . ltrim($thumb, '/')))
      : 'https://via.placeholder.com/400x250?text=Property';
      @endphp
      <a href="{{ route('property.detail', $property->id) }}" class="border rounded-lg overflow-hidden hover:shadow-lg transition bg-white block">
        <img src="{{ $thumbUrl }}" alt="property" class="w-full h-32 object-cover">
        <div class="p-3">
          <div class="font-semibold truncate">{{ $property->title }}</div>
          <div class="text-sm text-gray-600 truncate">📍 {{ $property->location ?? $property->formatted_address }}</div>
          <div class="mt-2 flex items-center justify-between">
            <div class="text-indigo-700 font-bold">₹{{ number_format($property->price) }}</div>
            <span class="inline-flex items-center px-2 py-0.5 rounded {{ $property->status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700' }}">
              {{ ucfirst($property->status) }}
            </span>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            Type: {{ strtoupper($property->type) }} • For: {{ ucfirst($property->for) }}
            @if(!is_null($property->bedrooms)) • {{ $property->bedrooms }} BHK @endif
          </div>
          <div class="mt-1 text-xs text-gray-400">
            By {{ optional($property->user)->name ?? 'Unknown' }} • {{ $property->created_at->format('d M Y') }}
          </div>
        </div>
      </a>
      @empty
      <div class="text-gray-500">No properties found.</div>
      @endforelse
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  const chartUsersByRole = @json($chartUsersByRole);
  const chartStatusByType = @json($chartStatusByType);

  new Chart(document.getElementById('chartUsersByRole'), {
    type: 'doughnut',
    data: {
      labels: chartUsersByRole.labels,
      datasets: [{
        data: chartUsersByRole.data,
        backgroundColor: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b']
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      cutout: '60%'
    }
  });

  new Chart(document.getElementById('chartStatusByType'), {
    type: 'bar',
    data: {
      labels: chartStatusByType.labels,
      datasets: [{
          label: 'Active',
          data: chartStatusByType.active,
          backgroundColor: '#10b981'
        },
        {
          label: 'Inactive',
          data: chartStatusByType.inactive,
          backgroundColor: '#f59e0b'
        },
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
</script>
@endsection