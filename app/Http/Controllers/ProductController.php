<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::orderBy('kategori', 'asc')
            ->orderBy('nama_produk', 'asc')
            ->paginate(10);

        return Inertia::render('Products/Index', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'kategori' => 'nullable|string|max:255',
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
            'kategori' => 'nullable|string|max:255',
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
