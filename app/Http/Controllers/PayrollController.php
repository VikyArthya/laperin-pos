<?php

namespace App\Http\Controllers;

use App\Exports\PayrollExport;
use App\Models\Employee;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PayrollController extends Controller
{
    /**
     * Rumus Gaji Harian:
     * gaji = (omset × 20%) + (floor(omset / 100.000) × 5.000)
     */
    public function index(Request $request)
    {
        $month = $request->input('month', date('m'));
        $year = $request->input('year', date('Y'));
        $weekPeriod = $request->input('week_period', null); // format: "YYYY-MM-DD" (tanggal Jriday)

        // Generate weekly periods for the selected month
        $weeklyPeriods = $this->generateWeeklyPeriods($month, $year);

        // Get all sales for the chosen period that have an employee assigned
        $sales = Sale::with(['shift', 'employee'])
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->whereNotNull('employee_id')
            ->where('is_karyawan_hadir', true);

        // Filter by weekly period if selected
        if ($weekPeriod && $weekPeriod !== 'all') {
            $period = collect($weeklyPeriods)->firstWhere('payment_date', $weekPeriod);
            if ($period) {
                $sales->whereBetween('tanggal', [$period['start_date'], $period['end_date']]);
            }
        }

        $sales = $sales->orderBy('tanggal', 'asc')->get();

        $grouped = $sales->groupBy('employee_id');

        $payrollData = [];

        foreach ($grouped as $employeeId => $employeeSales) {
            $employee = $employeeSales->first()->employee;
            if (! $employee) {
                continue;
            }

            $details = [];
            $totalGaji = 0;

            foreach ($employeeSales as $sale) {
                $omset = (int) $sale->omset_penjualan;
                $gajiBase = floor($omset * 0.20);
                $bonus = floor($omset / 100000) * 5000;
                $gajiHarian = $gajiBase + $bonus;
                $totalGaji += $gajiHarian;

                $details[] = [
                    'id' => $sale->id,
                    'tanggal' => $sale->tanggal,
                    'shift' => $sale->shift ? $sale->shift->nama_shift : '-',
                    'omset' => $omset,
                    'gaji_base' => $gajiBase,
                    'bonus' => $bonus,
                    'gaji_harian' => $gajiHarian,
                ];
            }

            $payrollData[] = [
                'employee_id' => $employeeId,
                'employee_name' => $employee->nama,
                'total_hari' => count($details),
                'total_omset' => $employeeSales->sum('omset_penjualan'),
                'total_gaji' => $totalGaji,
                'details' => $details,
            ];
        }

        // Sort by name
        usort($payrollData, fn ($a, $b) => strcmp($a['employee_name'], $b['employee_name']));

        return Inertia::render('Payroll/Index', [
            'payrollData' => $payrollData,
            'weeklyPeriods' => $weeklyPeriods,
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
                'week_period' => $weekPeriod,
            ],
        ]);
    }

    /**
     * Generate weekly periods for a given month
     * Each period starts from Saturday and ends on Friday (payment day)
     *
     * @param  int  $month
     * @param  int  $year
     * @return array
     */
    private function generateWeeklyPeriods($month, $year)
    {
        $periods = [];
        $currentDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();

        // Find the first Friday of the month
        $firstFriday = null;
        $tempDate = $currentDate->copy();
        while ($tempDate->month == $month) {
            if ($tempDate->dayOfWeek == Carbon::FRIDAY) {
                $firstFriday = $tempDate->copy();
                break;
            }
            $tempDate->addDay();
        }

        if (! $firstFriday) {
            return $periods; // No Friday in this month (should not happen)
        }

        // Start from the Saturday before the first Friday
        $startDate = $firstFriday->copy()->subDays(6); // Saturday before first Friday

        // Generate all weekly periods in this month
        while ($startDate->month <= $month && $startDate->year == $year) {
            $endDate = $startDate->copy()->addDays(6); // Friday

            // Only include periods that overlap with the selected month
            if ($endDate->month >= $month && $startDate->month <= $month) {
                $periods[] = [
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString(),
                    'payment_date' => $endDate->toDateString(),
                    'label' => $startDate->translatedFormat('d M').' - '.$endDate->translatedFormat('d M Y'),
                ];
            }

            // Move to next Saturday
            $startDate->addDays(7);

            // Break if we've gone beyond the month
            if ($startDate->month > $month && $endDate->month > $month) {
                break;
            }
        }

        return $periods;
    }

    public function export(Request $request)
    {
        $filters = [
            'month' => $request->input('month', date('m')),
            'year' => $request->input('year', date('Y')),
            'week_period' => $request->input('week_period', null),
        ];

        $filename = 'Laporan_Penggajian_';

        if (! empty($filters['month']) && ! empty($filters['year'])) {
            $months = [
                '1' => 'Januari', '2' => 'Februari', '3' => 'Maret', '4' => 'April',
                '5' => 'Mei', '6' => 'Juni', '7' => 'Juli', '8' => 'Agustus',
                '9' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
            ];
            $filename .= ($months[$filters['month']] ?? $filters['month']).'_'.$filters['year'];
        }

        if (! empty($filters['week_period']) && $filters['week_period'] !== 'all') {
            $filename .= '_Minggu_'.$filters['week_period'];
        }

        $filename .= '.xlsx';

        return Excel::download(new PayrollExport($filters), $filename);
    }
}
