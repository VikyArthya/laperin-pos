<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaterialController extends Controller
{
    public function index()
    {
        $materials = Material::orderBy('nama_bahan', 'asc')->paginate(10);

        return Inertia::render('Materials/Index', [
            'materials' => $materials,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_bahan' => 'required|string|max:255',
            'nominal' => 'required|integer|min:0',
            'stok' => 'required|integer|min:0',
        ]);

        Material::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Material $material)
    {
        $validated = $request->validate([
            'nama_bahan' => 'required|string|max:255',
            'nominal' => 'required|integer|min:0',
            'stok' => 'required|integer|min:0',
        ]);

        $material->update($validated);

        return redirect()->back();
    }

    public function addStock(Request $request, Material $material)
    {
        $validated = $request->validate([
            'jumlah' => 'required|integer|min:1',
        ]);

        $material->increment('stok', $validated['jumlah']);

        return redirect()->back();
    }

    public function reduceStock(Request $request, Material $material)
    {
        $validated = $request->validate([
            'jumlah' => 'required|integer|min:1',
        ]);

        $currentStock = $material->stok ?? 0;
        $reduceAmount = $validated['jumlah'];

        if ($currentStock < $reduceAmount) {
            return back()->withErrors(['jumlah' => 'Stok tidak mencukupi. Stok saat ini: '.$currentStock]);
        }

        $material->decrement('stok', $reduceAmount);

        return redirect()->back();
    }

    public function destroy(Material $material)
    {
        $material->delete();

        return redirect()->back();
    }
}
