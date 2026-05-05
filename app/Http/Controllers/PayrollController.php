<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    /**
     * Rumus Gaji Harian:
     * gaji = (omset × 20%) + (floor(omset / 100.000) × 5.000)
     *
     * Contoh: omset 500.000
     *   - Base:  500.000 × 0.20 = 100.000
     *   - Bonus: floor(500.000 / 100.000) × 5.000 = 5 × 5.000 = 25.000
     *   - Total: 125.000
     */
    public function index(Request $request)
    {
        $month = $request->input('month', date('m'));
        $year  = $request->input('year', date('Y'));

        // Get all sales for the chosen period, grouped by the user who created them
        $sales = Sale::with('shift')
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->whereNotNull('user_id')
            ->orderBy('tanggal', 'asc')
            ->get();

        $grouped = $sales->groupBy('user_id');

        // Load all related users at once
        $userIds = $grouped->keys()->toArray();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        $payrollData = [];

        foreach ($grouped as $userId => $userSales) {
            $user = $users->get($userId);
            if (!$user) continue;

            $details = [];
            $totalGaji = 0;

            foreach ($userSales as $sale) {
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
                'user_id'     => $userId,
                'user_name'   => $user->name,
                'user_role'   => $user->role,
                'total_hari'  => count($details),
                'total_omset' => $userSales->sum('omset_penjualan'),
                'total_gaji'  => $totalGaji,
                'details'     => $details,
            ];
        }

        // Sort by name
        usort($payrollData, fn($a, $b) => strcmp($a['user_name'], $b['user_name']));

        return Inertia::render('Payroll/Index', [
            'payrollData' => $payrollData,
            'filters'     => [
                'month' => (int) $month,
                'year'  => (int) $year,
            ],
        ]);
    }
}
