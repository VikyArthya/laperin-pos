<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index()
    {
        $shifts = Shift::orderBy('nama_shift', 'asc')->paginate(10);
        $cabangs = \App\Models\Category::whereNotNull('cabang')->where('cabang', '!=', '')
            ->pluck('cabang')
            ->merge(Shift::whereNotNull('cabang')->where('cabang', '!=', '')->pluck('cabang'))
            ->unique()
            ->values();

        return Inertia::render('Shifts/Index', [
            'shifts' => $shifts,
            'cabangs' => $cabangs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_shift' => 'required|string|max:255|unique:shifts,nama_shift',
            'cabang' => 'nullable|string|max:255',
        ]);

        Shift::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'nama_shift' => 'required|string|max:255|unique:shifts,nama_shift,' . $shift->id,
            'cabang' => 'nullable|string|max:255',
        ]);

        $shift->update($validated);
        return redirect()->back();
    }

    public function destroy(Shift $shift)
    {
        $shift->delete();
        return redirect()->back();
    }
}
