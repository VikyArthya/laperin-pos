<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')
            ->orderBy('nama_produk', 'asc')
            ->paginate(10);

        $categories = Category::active()
            ->orderBy('nama_kategori')
            ->get();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
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
            'stok' => 'required|integer|min:0',
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
            'stok' => 'required|integer|min:0',
        ]);

        $product->update($validated);

        return redirect()->back();
    }

    public function addStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'jumlah' => 'required|integer|min:1',
        ]);

        $product->increment('stok', $validated['jumlah']);

        return redirect()->back();
    }

    public function reduceStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'jumlah' => 'required|integer|min:1',
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
