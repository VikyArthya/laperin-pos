<?php

namespace App\Exports;

use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PayrollExport implements FromCollection, WithEvents, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $filters;

    protected $payrollData;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->payrollData = $this->generatePayrollData();
    }

    protected function generatePayrollData()
    {
        $month = $this->filters['month'] ?? date('m');
        $year = $this->filters['year'] ?? date('Y');
        $weekPeriod = $this->filters['week_period'] ?? null;

        $sales = Sale::with(['shift', 'employee'])
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->whereNotNull('employee_id')
            ->where('is_karyawan_hadir', true);

        if ($weekPeriod && $weekPeriod !== 'all') {
            $weeklyPeriods = $this->generateWeeklyPeriods($month, $year);
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

        usort($payrollData, fn ($a, $b) => strcmp($a['employee_name'], $b['employee_name']));

        return $payrollData;
    }

    public function collection()
    {
        $rows = [];

        foreach ($this->payrollData as $employee) {
            foreach ($employee['details'] as $detail) {
                $rows[] = array_merge([
                    'employee_name' => $employee['employee_name'],
                    'total_hari' => $employee['total_hari'],
                    'total_omset' => $employee['total_omset'],
                    'total_gaji' => $employee['total_gaji'],
                ], $detail);
            }
        }

        return new Collection($rows);
    }

    public function headings(): array
    {
        return [
            'NAMA KARYAWAN',
            'TOTAL HARI',
            'TOTAL OMSET',
            'TOTAL GAJI',
            'TANGGAL',
            'SHIFT',
            'OMSET HARIAN',
            'GAJI BASE (20%)',
            'BONUS',
            'GAJI HARIAN',
        ];
    }

    public function map($row): array
    {
        return [
            $row['employee_name'],
            $row['total_hari'],
            'Rp '.number_format($row['total_omset'], 0, ',', '.'),
            'Rp '.number_format($row['total_gaji'], 0, ',', '.'),
            $row['tanggal'],
            $row['shift'],
            'Rp '.number_format($row['omset'], 0, ',', '.'),
            'Rp '.number_format($row['gaji_base'], 0, ',', '.'),
            'Rp '.number_format($row['bonus'], 0, ',', '.'),
            'Rp '.number_format($row['gaji_harian'], 0, ',', '.'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                    'color' => ['rgb' => 'FFFFFF'],
                    'name' => 'Calibri',
                ],
                'fill' => [
                    'fillType' => Fill::FILL_GRADIENT_LINEAR,
                    'startColor' => ['rgb' => '059669'],
                    'endColor' => ['rgb' => '10B981'],
                    'rotation' => 90,
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THICK,
                        'color' => ['rgb' => '047857'],
                    ],
                ],
            ],
        ];
    }

    public function title(): string
    {
        $title = 'Laporan Penggajian';

        if (! empty($this->filters['month']) && ! empty($this->filters['year'])) {
            $months = [
                '1' => 'Januari', '2' => 'Februari', '3' => 'Maret', '4' => 'April',
                '5' => 'Mei', '6' => 'Juni', '7' => 'Juli', '8' => 'Agustus',
                '9' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
            ];
            $month = $this->filters['month'];
            $year = $this->filters['year'];
            $title .= ' - '.($months[$month] ?? $month).' '.$year;
        }

        return $title;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();

                if ($highestRow < 2) {
                    return;
                }

                // Insert title rows at the top
                $sheet->insertNewRowBefore(1, 3);
                $sheet->mergeCells('A1:'.$highestColumn.'1');
                $sheet->setCellValue('A1', '💰 LAPORAN PENGAJIAN KARYAWAN - LA PERIN POS 💰');
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 18,
                        'color' => ['rgb' => 'FFFFFF'],
                        'name' => 'Calibri',
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_GRADIENT_LINEAR,
                        'startColor' => ['rgb' => '047857'],
                        'endColor' => ['rgb' => '059669'],
                        'rotation' => 90,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THICK,
                            'color' => ['rgb' => '065F46'],
                        ],
                    ],
                ]);

                // Add decorative row
                $sheet->mergeCells('A2:'.$highestColumn.'2');
                $sheet->setCellValue('A2', '📊 PAYROLL REPORT - EMPLOYEE SALARY BREAKDOWN 📈');
                $sheet->getStyle('A2')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'color' => ['rgb' => 'FFFFFF'],
                        'name' => 'Calibri',
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '10B981'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // Add subtitle with filter info
                $subtitle = '📅 Periode: ';
                if (! empty($this->filters['month']) && ! empty($this->filters['year'])) {
                    $months = [
                        '1' => 'Januari', '2' => 'Februari', '3' => 'Maret', '4' => 'April',
                        '5' => 'Mei', '6' => 'Juni', '7' => 'Juli', '8' => 'Agustus',
                        '9' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
                    ];
                    $month = $this->filters['month'];
                    $year = $this->filters['year'];
                    $subtitle .= ($months[$month] ?? $month).' '.$year;
                } else {
                    $subtitle .= 'Semua Periode';
                }

                if (! empty($this->filters['week_period']) && $this->filters['week_period'] !== 'all') {
                    $subtitle .= ' | 📆 Minggu: '.$this->filters['week_period'];
                }

                $sheet->setCellValue('A3', $subtitle);
                $sheet->mergeCells('A3:'.$highestColumn.'3');
                $sheet->getStyle('A3')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'color' => ['rgb' => '064E3B'],
                        'name' => 'Calibri',
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'D1FAE5'],
                    ],
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '6EE7B7'],
                        ],
                    ],
                ]);

                // Set row height for title rows
                $sheet->getRowDimension(1)->setRowHeight(30);
                $sheet->getRowDimension(2)->setRowHeight(22);
                $sheet->getRowDimension(3)->setRowHeight(20);

                // Update row references
                $headerRow = 4;
                $firstDataRow = 5;
                $lastDataRow = $highestRow + 3;

                // Apply zebra striping to data rows
                for ($row = $firstDataRow; $row <= $lastDataRow; $row++) {
                    if ($row % 2 == 0) {
                        $sheet->getStyle('A'.$row.':'.$highestColumn.$row)->applyFromArray([
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'ECFDF5'],
                            ],
                        ]);
                    } else {
                        $sheet->getStyle('A'.$row.':'.$highestColumn.$row)->applyFromArray([
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'FFFFFF'],
                            ],
                        ]);
                    }

                    $sheet->getStyle('A'.$row.':'.$highestColumn.$row)->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => 'A7F3D0'],
                            ],
                        ],
                        'font' => [
                            'size' => 11,
                            'name' => 'Calibri',
                            'color' => ['rgb' => '064E3B'],
                        ],
                    ]);
                }

                // Align numeric columns to the right
                $numericColumns = ['C', 'D', 'G', 'H', 'I', 'J'];
                foreach ($numericColumns as $col) {
                    $sheet->getStyle($col.$firstDataRow.':'.$col.$lastDataRow)
                        ->getAlignment()
                        ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // Set column widths
                $columnWidths = [
                    'A' => 25,
                    'B' => 12,
                    'C' => 18,
                    'D' => 18,
                    'E' => 15,
                    'F' => 15,
                    'G' => 18,
                    'H' => 18,
                    'I' => 15,
                    'J' => 18,
                ];

                foreach ($columnWidths as $column => $width) {
                    $sheet->getColumnDimension($column)->setWidth($width);
                }

                // Calculate totals
                $grandTotalOmset = collect($this->payrollData)->sum('total_omset');
                $grandTotalGaji = collect($this->payrollData)->sum('total_gaji');
                $totalEmployees = count($this->payrollData);
                $totalDays = collect($this->payrollData)->sum('total_hari');

                // Add totals row
                $totalRow = $lastDataRow + 1;
                $sheet->setCellValue('A'.$totalRow, 'GRAND TOTAL');
                $sheet->setCellValue('B'.$totalRow, $totalDays.' Hari');
                $sheet->setCellValue('C'.$totalRow, 'Rp '.number_format($grandTotalOmset, 0, ',', '.'));
                $sheet->setCellValue('D'.$totalRow, 'Rp '.number_format($grandTotalGaji, 0, ',', '.'));
                $sheet->setCellValue('E'.$totalRow, $totalEmployees.' Karyawan');

                // Style the totals row
                $sheet->getStyle('A'.$totalRow.':'.$highestColumn.$totalRow)->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 13,
                        'color' => ['rgb' => 'FFFFFF'],
                        'name' => 'Calibri',
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_GRADIENT_LINEAR,
                        'startColor' => ['rgb' => '047857'],
                        'endColor' => ['rgb' => '059669'],
                        'rotation' => 90,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THICK,
                            'color' => ['rgb' => '059669'],
                        ],
                    ],
                ]);

                $sheet->getRowDimension($totalRow)->setRowHeight(25);

                // Add signature section
                $signatureRow = $totalRow + 2;

                // Add a separator line
                $sheet->mergeCells('A'.($totalRow + 1).':'.$highestColumn.($totalRow + 1));
                $sheet->getStyle('A'.($totalRow + 1))->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'D1FAE5'],
                    ],
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '6EE7B7'],
                        ],
                    ],
                ]);

                $sheet->setCellValue('H'.$signatureRow, 'Dibuat Oleh,');
                $sheet->setCellValue('I'.$signatureRow, 'Diperiksa Oleh,');
                $sheet->setCellValue('J'.$signatureRow, 'Disetujui Oleh,');

                $sheet->setCellValue('H'.($signatureRow + 1), 'Admin Keuangan');
                $sheet->setCellValue('I'.($signatureRow + 1), 'Manager');
                $sheet->setCellValue('J'.($signatureRow + 1), 'Direktur');

                $sheet->setCellValue('H'.($signatureRow + 4), '(...........................)');
                $sheet->setCellValue('I'.($signatureRow + 4), '(...........................)');
                $sheet->setCellValue('J'.($signatureRow + 4), '(...........................)');

                $sheet->getStyle('H'.$signatureRow.':J'.($signatureRow + 4))->applyFromArray([
                    'font' => [
                        'size' => 10,
                        'name' => 'Calibri',
                        'color' => ['rgb' => '064E3B'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                    ],
                ]);

                // Add disclaimer
                $disclaimerRow = $signatureRow + 6;
                $sheet->mergeCells('A'.$disclaimerRow.':'.$highestColumn.$disclaimerRow);
                $sheet->setCellValue('A'.$disclaimerRow, '💡 Dokumen ini adalah laporan penggajian resmi La Perin Pos. Rumus: Gaji = (Omset × 20%) + (⌊Omset ÷ 100rb⌋ × 5rb)');

                $sheet->getStyle('A'.$disclaimerRow)->applyFromArray([
                    'font' => [
                        'italic' => true,
                        'size' => 9,
                        'color' => ['rgb' => '047857'],
                        'name' => 'Calibri',
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'D1FAE5'],
                    ],
                ]);

                $sheet->getRowDimension($disclaimerRow)->setRowHeight(25);
            },
        ];
    }

    private function generateWeeklyPeriods($month, $year)
    {
        $periods = [];
        $currentDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();

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
            return $periods;
        }

        $startDate = $firstFriday->copy()->subDays(6);

        while ($startDate->month <= $month && $startDate->year == $year) {
            $endDate = $startDate->copy()->addDays(6);

            if ($endDate->month >= $month && $startDate->month <= $month) {
                $periods[] = [
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString(),
                    'payment_date' => $endDate->toDateString(),
                    'label' => $startDate->translatedFormat('d M').' - '.$endDate->translatedFormat('d M Y'),
                ];
            }

            $startDate->addDays(7);

            if ($startDate->month > $month && $endDate->month > $month) {
                break;
            }
        }

        return $periods;
    }
}
