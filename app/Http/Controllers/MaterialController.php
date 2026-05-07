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
        ]);

        Material::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Material $material)
    {
        $validated = $request->validate([
            'nama_bahan' => 'required|string|max:255',
        ]);

        $material->update($validated);

        return redirect()->back();
    }

    public function destroy(Material $material)
    {
        $material->delete();

        return redirect()->back();
    }
}
