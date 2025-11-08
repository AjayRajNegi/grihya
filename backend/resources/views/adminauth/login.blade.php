<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Easy Lease - Admin Login</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
  <style>
    @keyframes float {
      0% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0); }
    }
    .float-animation {
      animation: float 3s ease-in-out infinite;
    }
    .bg-primary { background-color: #2AB09C; }
    .bg-primary-dark { background-color: #1F8A7A; }
    .bg-primary-light { background-color: #4CC8B4; }
    .text-primary { color: #2AB09C; }
    .focus-ring-primary { --tw-ring-color: #2AB09C; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-[#2AB09C] via-[#4CC8B4] to-[#1F8A7A] flex items-center justify-center p-4">
  <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 transform transition-all hover:scale-105">
    <!-- Lottie Animation -->
    <div class="flex justify-center">
      <img src="https://cdn-icons-gif.flaticon.com/17675/17675719.gif" alt="House Animation" width="200px" class="float-animation">
    </div>

    <!-- Header -->
    <h2 class="text-3xl font-extrabold text-center text-gray-900 mb-2">Grihya</h2>
    <p class="text-center text-gray-600">Admin Portal Login</p>

    <!-- Error Message -->
    @if ($errors->any())
      <div class="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center animate-pulse">
        {{ $errors->first() }}
      </div>
    @endif

    <!-- Login Form -->
    <form action="{{ route('admin.login.post') }}" method="POST" class="space-y-5 bg-white rounded-lg">
      @csrf
      <div class="relative">
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          required
          class="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus-ring-primary focus:outline-none transition-all duration-300"
        >
        <svg class="absolute right-3 top-3 h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>

      <div class="relative">
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          required
          class="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus-ring-primary focus:outline-none transition-all duration-300"
        >
        <svg class="absolute right-3 top-3 h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.1.9-2 2-2m-2 6v-2m0 0c-1.1 0-2-.9-2-2s.9-2 2-2m0 4c1.1 0 2 .9 2 2m4-8h1m-1 4h1m-5 4h5a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h5z"></path>
        </svg>
      </div>

      <button 
        type="submit"
        class="w-full py-3 rounded-lg bg-gradient-to-r from-[#2AB09C] to-[#4CC8B4] text-white font-semibold hover:from-[#1F8A7A] hover:to-[#2AB09C] transform transition-all duration-300 hover:scale-105"
      >
        Sign In
      </button>
    </form>

    <!-- Footer -->
    <p class="mt-6 text-center text-sm text-gray-500">
      Powered by <span class="font-semibold text-primary">Easy Lease</span> &copy; 2025
    </p>
  </div>
</body>
</html>