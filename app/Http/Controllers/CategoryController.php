<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $cabangFilter = $request->input('cabang');

        $query = Category::withCount('products')->orderBy('nama_kategori');

        if ($cabangFilter === '__umum__') {
            $query->where(function ($q) {
                $q->whereNull('cabang')->orWhere('cabang', '');
            });
        } elseif ($cabangFilter) {
            $query->where('cabang', $cabangFilter);
        }

        $categories = $query->get();

        $cabangs = Category::whereNotNull('cabang')->where('cabang', '!=', '')
            ->pluck('cabang')
            ->merge(\App\Models\Shift::whereNotNull('cabang')->where('cabang', '!=', '')->pluck('cabang'))
            ->unique()
            ->values();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'cabangs' => $cabangs,
            'currentCabang' => $cabangFilter,
        ]);
    }

    public function create()
    {
        $cabangs = \App\Models\Category::whereNotNull('cabang')->where('cabang', '!=', '')
            ->pluck('cabang')
            ->merge(\App\Models\Shift::whereNotNull('cabang')->where('cabang', '!=', '')->pluck('cabang'))
            ->unique()
            ->values();

        return Inertia::render('Categories/Create', [
            'cabangs' => $cabangs,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
            'cabang' => 'nullable|string|max:255',
            'kode' => 'nullable|string|max:50|unique:categories,kode',
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Category::create([
            'nama_kategori' => $request->nama_kategori,
            'cabang' => $request->cabang,
            'kode' => $request->kode,
            'deskripsi' => $request->deskripsi,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('categories.index');
    }

    public function edit(Category $category)
    {
        $cabangs = \App\Models\Category::whereNotNull('cabang')->where('cabang', '!=', '')
            ->pluck('cabang')
            ->merge(\App\Models\Shift::whereNotNull('cabang')->where('cabang', '!=', '')->pluck('cabang'))
            ->unique()
            ->values();

        return Inertia::render('Categories/Edit', [
            'category' => $category,
            'cabangs' => $cabangs,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
            'cabang' => 'nullable|string|max:255',
            'kode' => 'nullable|string|max:50|unique:categories,kode,'.$category->id,
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category->update([
            'nama_kategori' => $request->nama_kategori,
            'cabang' => $request->cabang,
            'kode' => $request->kode,
            'deskripsi' => $request->deskripsi,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('categories.index');
    }

    public function destroy(Category $category)
    {
        // Setel category_id menjadi null pada produk yang terkait agar produk tetap aman
        \App\Models\Product::where('category_id', $category->id)->update([
            'category_id' => null,
            'kategori' => null,
        ]);

        $category->delete();

        return redirect()->route('categories.index');
    }
}
