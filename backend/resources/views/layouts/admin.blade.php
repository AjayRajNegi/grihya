<!DOCTYPE html>
<html lang="en" x-data="{ openSidebar: false }">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>

<body class="bg-neutral-50">

    <!-- Mobile top bar -->
    <div class="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
        <div class="flex items-center justify-between px-4 h-14">
            <button class="p-2 rounded hover:bg-gray-100" @click="openSidebar = true" aria-label="Open menu">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h10M4 18h16" />
                </svg>
            </button>
            <div class="font-semibold">{{ $title ?? 'Admin' }}</div>
            <div></div>
        </div>
    </div>

    <!-- Fixed Sidebar (desktop) -->
    <aside class="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 lg:w-72
                 bg-gradient-to-b from-slate-900 via-indigo-900 to-indigo-800
                 text-white h-screen overflow-y-auto shadow-xl">
        <div class="flex flex-col w-full px-4 py-6">
            <!-- Logo -->
            <div class="flex items-center gap-3 mb-6">
                <!-- <img src="{{ asset('img/Easy_Lease_Logo.svg') }}" onerror="this.style.display='none'" class="w-9 h-9" alt="Logo"> -->
                <div>
                    <img src="/img/Easy_Lease_Logo.png" alt="Logo" height="46" width="250">
                    <div class="text-white/70 text-lg mt-1">
                        <strong class="text-white">Admin</strong> Control Center
                    </div>
                </div>
            </div>

            <!-- Nav -->
            <nav class="flex-1 space-y-1">
                <a href="{{ route('overview') }}"
                    class="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-white/10
                  {{ request()->routeIs('overview') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">
                    <span>Overview</span>
                </a>

                <a href="{{ route('all-users') }}"
                    class="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-white/10
                  {{ request()->routeIs('all-users') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">
                    <span>All Users</span>
                </a>

                <a href="{{ route('all-properties') }}"
                    class="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-white/10
                  {{ request()->routeIs('all-properties') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">
                    <span>All Properties</span>
                </a>

                <a href="{{ route('admin.blogs.index') }}"
                    class="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-white/10 {{ request()->routeIs('admin.blogs.*') ? 'bg-white/15 font-semibold' : '' }}">
                    <span>Blogs</span>
                </a>

                <a href="{{ route('admin.chat.index') }}"
                    class="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-white/10
                  {{ request()->routeIs('admin.chat.*') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">
                    <span>Check Inquiries</span>
                </a>
                <a href="{{ route('admin.banned.index') }}"
                    class="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-white/10
   {{ request()->routeIs('admin.banned.*') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">
                    <span>Banned Accounts</span>
                </a>
            </nav>

            <!-- Logout -->
            <div class="pt-4 border-t border-white/10">
                <a href="{{ route('admin.logout') }}"
                    class="w-full inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-white/90
                  font-semibold px-4 py-2 rounded-md shadow">
                    <span>Logout</span>
                </a>
            </div>
        </div>
    </aside>

    <!-- Mobile Sidebar Drawer -->
    <div x-show="openSidebar" x-transition class="fixed inset-0 z-50 md:hidden" aria-modal="true">
        <div class="absolute inset-0 bg-black/50" @click="openSidebar=false"></div>
        <div class="absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-indigo-900 to-indigo-800 text-white p-4 flex flex-col">
            <div class="flex items-center justify-between mb-6">
                <div class="text-lg font-extrabold">Admin</div>
                <button class="p-2 rounded hover:bg-white/10" @click="openSidebar=false">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <nav class="space-y-1">
                <a href="{{ route('overview') }}"
                    class="block px-3 py-2 rounded hover:bg-white/10 {{ request()->routeIs('overview') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">Overview</a>

                <a href="{{ route('all-users') }}"
                    class="block px-3 py-2 rounded hover:bg-white/10 {{ request()->routeIs('all-users') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">All Users</a>

                <a href="{{ route('all-properties') }}"
                    class="block px-3 py-2 rounded hover:bg-white/10 {{ request()->routeIs('all-properties') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">All Properties</a>

                <a href="{{ route('admin.submit-blog') }}"
                    class="block px-3 py-2 rounded hover:bg-white/10 {{ request()->routeIs('admin.submit-blog') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">Submit Blog</a>

                <a href="{{ route('admin.chat.index') }}"
                    class="block px-3 py-2 rounded hover:bg-white/10 {{ request()->routeIs('admin.chat.*') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">Check Inquiries</a>
                <a href="{{ route('admin.banned.index') }}"
                    class="block px-3 py-2 rounded hover:bg-white/10
   {{ request()->routeIs('admin.banned.*') ? 'bg-white/15 ring-1 ring-white/10 font-semibold' : '' }}">
                    Banned Accounts
                </a>
            </nav>

            <div class="mt-auto pt-4 border-t border-white/10">
                <a href="{{ route('admin.logout') }}"
                    class="w-full inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-white/90 font-semibold px-4 py-2 rounded-md shadow">Logout</a>
            </div>
        </div>
    </div>

    <!-- Main Content (offset by fixed sidebar on md+) -->
    <main class="min-h-screen md:ml-64 lg:ml-72">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            @yield('content')
        </div>
    </main>

    @yield('scripts')
</body>

</html>