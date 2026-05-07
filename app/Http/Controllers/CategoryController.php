<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('products')
            ->orderBy('nama_kategori')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('Categories/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
            'kode' => 'nullable|string|max:50|unique:categories,kode',
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Category::create([
            'nama_kategori' => $request->nama_kategori,
            'kode' => $request->kode,
            'deskripsi' => $request->deskripsi,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('categories.index');
    }

    public function edit(Category $category)
    {
        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
            'kode' => 'nullable|string|max:50|unique:categories,kode,'.$category->id,
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category->update([
            'nama_kategori' => $request->nama_kategori,
            'kode' => $request->kode,
            'deskripsi' => $request->deskripsi,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('categories.index');
    }

    public function destroy(Category $category)
    {
        // Cek apakah kategori masih digunakan oleh produk
        if ($category->products()->count() > 0) {
            return back()->withErrors(['message' => 'Kategori masih digunakan oleh produk. Hapus atau ubah kategori produk terlebih dahulu.']);
        }

        $category->delete();

        return redirect()->route('categories.index');
    }
}
