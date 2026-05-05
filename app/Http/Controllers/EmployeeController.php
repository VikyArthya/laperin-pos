<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::orderBy('nama', 'asc')->paginate(10);
        return Inertia::render('Employees/Index', [
            'employees' => $employees
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        Employee::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        $employee->update($validated);
        return redirect()->back();
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return redirect()->back();
    }
}
