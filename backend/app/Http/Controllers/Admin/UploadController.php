<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'], // 5 MB
        ]);

        $path = $request->file('file')->store('blog', 'public');
        return response()->json([
            'path' => $path,
            'url'  => Storage::url($path),
        ]);
    }
}