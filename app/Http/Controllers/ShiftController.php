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
        return Inertia::render('Shifts/Index', [
            'shifts' => $shifts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_shift' => 'required|string|max:255|unique:shifts,nama_shift',
        ]);

        Shift::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'nama_shift' => 'required|string|max:255|unique:shifts,nama_shift,' . $shift->id,
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
