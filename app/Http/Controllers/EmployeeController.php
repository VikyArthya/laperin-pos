<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::with('user')->orderBy('nama', 'asc')->paginate(10);
        $users = User::where('role', 'karyawan')->orderBy('name')->get(['id', 'name', 'email']);
        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'gambar_ktp' => 'nullable|image|max:5120', // max 5MB
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($request->hasFile('gambar_ktp')) {
            $validated['gambar_ktp'] = $request->file('gambar_ktp')->store('ktp', 'public');
        }

        Employee::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'gambar_ktp' => 'nullable|image|max:5120',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($request->hasFile('gambar_ktp')) {
            if ($employee->gambar_ktp) {
                Storage::disk('public')->delete($employee->gambar_ktp);
            }
            $validated['gambar_ktp'] = $request->file('gambar_ktp')->store('ktp', 'public');
        }

        $employee->update($validated);
        return redirect()->back();
    }

    public function destroy(Employee $employee)
    {
        if ($employee->gambar_ktp) {
            Storage::disk('public')->delete($employee->gambar_ktp);
        }
        $employee->delete();
        return redirect()->back();
    }
}
