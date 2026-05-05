<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    /**
     * Rumus Gaji Harian:
     * gaji = (omset × 20%) + (floor(omset / 100.000) × 5.000)
     */
    public function index(Request $request)
    {
        $month = $request->input('month', date('m'));
        $year  = $request->input('year', date('Y'));

        // Get all sales for the chosen period that have an employee assigned
        $sales = Sale::with(['shift', 'employee'])
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->whereNotNull('employee_id')
            ->where('is_karyawan_hadir', true)
            ->orderBy('tanggal', 'asc')
            ->get();

        $grouped = $sales->groupBy('employee_id');

        $payrollData = [];

        foreach ($grouped as $employeeId => $employeeSales) {
            $employee = $employeeSales->first()->employee;
            if (!$employee) continue;

            $details = [];
            $totalGaji = 0;

            foreach ($employeeSales as $sale) {
                $omset     = (int) $sale->omset_penjualan;
                $gajiBase  = floor($omset * 0.20);
                $bonus     = floor($omset / 100000) * 5000;
                $gajiHarian = $gajiBase + $bonus;
                $totalGaji += $gajiHarian;

                $details[] = [
                    'id'          => $sale->id,
                    'tanggal'     => $sale->tanggal,
                    'shift'       => $sale->shift ? $sale->shift->nama_shift : '-',
                    'omset'       => $omset,
                    'gaji_base'   => $gajiBase,
                    'bonus'       => $bonus,
                    'gaji_harian' => $gajiHarian,
                ];
            }

            $payrollData[] = [
                'employee_id' => $employeeId,
                'employee_name' => $employee->nama,
                'total_hari'  => count($details),
                'total_omset' => $employeeSales->sum('omset_penjualan'),
                'total_gaji'  => $totalGaji,
                'details'     => $details,
            ];
        }

        // Sort by name
        usort($payrollData, fn($a, $b) => strcmp($a['employee_name'], $b['employee_name']));

        return Inertia::render('Payroll/Index', [
            'payrollData' => $payrollData,
            'filters'     => [
                'month' => (int) $month,
                'year'  => (int) $year,
            ],
        ]);
    }
}
