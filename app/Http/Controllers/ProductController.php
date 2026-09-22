<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $cabangFilter = $request->input('cabang');

        $query = Product::with('category')->orderBy('nama_produk', 'asc');

        if ($cabangFilter === '__umum__') {
            $query->where(function ($q) {
                $q->whereDoesntHave('category')
                    ->orWhereHas('category', function ($cq) {
                        $cq->whereNull('cabang')->orWhere('cabang', '');
                    });
            });
        } elseif ($cabangFilter) {
            $query->whereHas('category', function ($q) use ($cabangFilter) {
                $q->where('cabang', $cabangFilter);
            });
        }

        $products = $query->paginate(10)->withQueryString();

        $categories = Category::active()
            ->orderBy('nama_kategori')
            ->get();

        $cabangs = Category::whereNotNull('cabang')->where('cabang', '!=', '')
            ->pluck('cabang')
            ->merge(\App\Models\Shift::whereNotNull('cabang')->where('cabang', '!=', '')->pluck('cabang'))
            ->unique()
            ->values();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'cabangs' => $cabangs,
            'currentCabang' => $cabangFilter,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'kategori' => 'nullable|string|max:255', // Untuk backward compatibility
            'harga_beli' => 'required|integer|min:0',
            'harga' => 'required|integer|min:0',
            'stok' => 'required|numeric|min:0',
        ]);

        Product::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'kategori' => 'nullable|string|max:255', // Untuk backward compatibility
            'harga_beli' => 'required|integer|min:0',
            'harga' => 'required|integer|min:0',
            'stok' => 'required|numeric|min:0',
        ]);

        $product->update($validated);

        return redirect()->back();
    }

    public function addStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'jumlah' => 'required|numeric|min:0.01',
        ]);

        $product->increment('stok', $validated['jumlah']);

        return redirect()->back();
    }

    public function reduceStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'jumlah' => 'required|numeric|min:0.01',
        ]);

        $currentStock = $product->stok ?? 0;
        $reduceAmount = $validated['jumlah'];

        if ($currentStock < $reduceAmount) {
            return back()->withErrors(['jumlah' => 'Stok tidak mencukupi. Stok saat ini: '.$currentStock]);
        }

        $product->decrement('stok', $reduceAmount);

        return redirect()->back();
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->back();
    }
}
