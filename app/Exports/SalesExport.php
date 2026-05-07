<?php

namespace App\Exports;

use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromQuery;
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

class SalesExport implements FromQuery, WithEvents, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Sale::with(['shift', 'employee'])->orderBy('tanggal', 'desc')->orderBy('created_at', 'desc');

        if (! empty($this->filters['month'])) {
            $parts = explode('-', $this->filters['month']);
            if (count($parts) == 2) {
                $query->whereYear('tanggal', $parts[0])
                    ->whereMonth('tanggal', $parts[1]);
            }
        }

        if (! empty($this->filters['shift_id'])) {
            $query->where('shift_id', $this->filters['shift_id']);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'TANGGAL',
            'SHIFT',
            'MODAL AWAL',
            'CASH',
            'QRIS',
            'SF',
            'DANA MASUK',
            'DANA KELUAR',
            'SELISIH DANA',
            'OMSET PENJUALAN',
            'GAJI KARYAWAN',
            'UNTUNG KOTOR',
            'UNTUNG BERSIH',
            'SELISIH PEMBAYARAN',
            'TOTAL UNTUNG',
            'KARYAWAN HADIR',
            'NAMA KARYAWAN',
            'CATATAN',
        ];
    }

    public function map($sale): array
    {
        return [
            $sale->tanggal,
            $sale->shift->nama_shift ?? '-',
            'Rp '.number_format($sale->modal_awal, 0, ',', '.'),
            'Rp '.number_format($sale->cash ?? 0, 0, ',', '.'),
            'Rp '.number_format($sale->qris ?? 0, 0, ',', '.'),
            'Rp '.number_format($sale->sf ?? 0, 0, ',', '.'),
            'Rp '.number_format($sale->dana_masuk, 0, ',', '.'),
            'Rp '.number_format($sale->dana_keluar, 0, ',', '.'),
            'Rp '.number_format($sale->selisih_dana, 0, ',', '.'),
            'Rp '.number_format($sale->omset_penjualan, 0, ',', '.'),
            'Rp '.number_format($sale->gaji_karyawan, 0, ',', '.'),
            'Rp '.number_format($sale->untung_kotor, 0, ',', '.'),
            'Rp '.number_format($sale->untung_bersih, 0, ',', '.'),
            'Rp '.number_format($sale->selisih_pembayaran ?? 0, 0, ',', '.'),
            'Rp '.number_format(($sale->untung_bersih ?? 0) + ($sale->selisih_pembayaran ?? 0), 0, ',', '.'),
            $sale->is_karyawan_hadir ? 'Ya' : 'Tidak',
            $sale->employee->nama ?? '-',
            $sale->catatan ?? '-',
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
                    'startColor' => ['rgb' => '0EA5E9'], // Sky blue
                    'endColor' => ['rgb' => '38BDF8'], // Light sky blue
                    'rotation' => 90,
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THICK,
                        'color' => ['rgb' => '0284C7'],
                    ],
                ],
            ],
        ];
    }

    public function title(): string
    {
        $title = 'Laporan Penjualan';

        if (! empty($this->filters['month'])) {
            $months = [
                '01' => 'Januari', '02' => 'Februari', '03' => 'Maret', '04' => 'April',
                '05' => 'Mei', '06' => 'Juni', '07' => 'Juli', '08' => 'Agustus',
                '09' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
            ];
            $parts = explode('-', $this->filters['month']);
            if (count($parts) == 2) {
                $title .= ' - '.($months[$parts[1]] ?? $parts[1]).' '.$parts[0];
            }
        }

        if (! empty($this->filters['shift_id'])) {
            $sale = Sale::with('shift')->where('shift_id', $this->filters['shift_id'])->first();
            if ($sale && $sale->shift) {
                $title .= ' - '.$sale->shift->nama_shift;
            }
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

                // Get all data to calculate totals
                $sales = $this->query()->get();

                if ($sales->isEmpty()) {
                    return;
                }

                // Insert title row at the top
                $sheet->insertNewRowBefore(1, 3);
                $sheet->mergeCells('A1:'.$highestColumn.'1');
                $sheet->setCellValue('A1', '💰 LAPORAN PENJUALAN - LA PERIN POS 💰');
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 18,
                        'color' => ['rgb' => 'FFFFFF'],
                        'name' => 'Calibri',
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_GRADIENT_LINEAR,
                        'startColor' => ['rgb' => '0284C7'], // Dark sky blue
                        'endColor' => ['rgb' => '0EA5E9'], // Sky blue
                        'rotation' => 90,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THICK,
                            'color' => ['rgb' => '0369A1'],
                        ],
                    ],
                ]);

                // Add decorative row with financial icons
                $sheet->mergeCells('A2:'.$highestColumn.'2');
                $sheet->setCellValue('A2', '📊 FINANCIAL REPORT - OMSET & PROFIT ANALYSIS 📈');
                $sheet->getStyle('A2')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'color' => ['rgb' => 'FFFFFF'],
                        'name' => 'Calibri',
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '38BDF8'], // Light sky blue
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // Add subtitle with filter info
                $subtitle = '📅 Periode: ';
                if (! empty($this->filters['month'])) {
                    $months = [
                        '01' => 'Januari', '02' => 'Februari', '03' => 'Maret', '04' => 'April',
                        '05' => 'Mei', '06' => 'Juni', '07' => 'Juli', '08' => 'Agustus',
                        '09' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
                    ];
                    $parts = explode('-', $this->filters['month']);
                    if (count($parts) == 2) {
                        $subtitle .= ($months[$parts[1]] ?? $parts[1]).' '.$parts[0];
                    }
                } else {
                    $subtitle .= 'Semua Periode';
                }

                if (! empty($this->filters['shift_id'])) {
                    $subtitle .= ' | 🏪 Cabang: Shift '.$this->filters['shift_id'];
                }

                $sheet->setCellValue('A3', $subtitle);
                $sheet->mergeCells('A3:'.$highestColumn.'3');
                $sheet->getStyle('A3')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'color' => ['rgb' => '0C4A6E'], // Dark blue text
                        'name' => 'Calibri',
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E0F2FE'], // Very light blue
                    ],
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '7DD3FC'],
                        ],
                    ],
                ]);

                // Set row height for title rows
                $sheet->getRowDimension(1)->setRowHeight(30);
                $sheet->getRowDimension(2)->setRowHeight(22);
                $sheet->getRowDimension(3)->setRowHeight(20);

                // Update highest row after title insertion
                $dataStartRow = 3;
                $headerRow = 4;
                $firstDataRow = 5;
                $lastDataRow = $highestRow + 3; // +3 for the inserted rows

                // Apply zebra striping to data rows with light blue colors
                for ($row = $firstDataRow; $row <= $lastDataRow; $row++) {
                    if ($row % 2 == 0) {
                        // Even rows - very light blue background
                        $sheet->getStyle('A'.$row.':'.$highestColumn.$row)->applyFromArray([
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'F0F9FF'], // Very light blue
                            ],
                        ]);
                    } else {
                        // Odd rows - white background
                        $sheet->getStyle('A'.$row.':'.$highestColumn.$row)->applyFromArray([
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'FFFFFF'],
                            ],
                        ]);
                    }

                    // Add borders to all data cells
                    $sheet->getStyle('A'.$row.':'.$highestColumn.$row)->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => 'BAE6FD'], // Light blue border
                            ],
                        ],
                        'font' => [
                            'size' => 11,
                            'name' => 'Calibri',
                            'color' => ['rgb' => '0C4A6E'],
                        ],
                    ]);
                }

                // Align numeric columns to the right
                $numericColumns = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
                foreach ($numericColumns as $col) {
                    $sheet->getStyle($col.$firstDataRow.':'.$col.$lastDataRow)
                        ->getAlignment()
                        ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // Set column widths
                $columnWidths = [
                    'A' => 15, // Tanggal
                    'B' => 20, // Shift
                    'C' => 18, // Modal Awal
                    'D' => 15, // Cash
                    'E' => 15, // QRIS
                    'F' => 12, // SF
                    'G' => 18, // Dana Masuk
                    'H' => 18, // Dana Keluar
                    'I' => 16, // Selisih Dana
                    'J' => 20, // Omset Penjualan
                    'K' => 18, // Gaji Karyawan
                    'L' => 18, // Untung Kotor
                    'M' => 18, // Untung Bersih
                    'N' => 20, // Selisih Pembayaran
                    'O' => 18, // Total Untung
                    'P' => 16, // Karyawan Hadir
                    'Q' => 25, // Nama Karyawan
                    'R' => 30, // Catatan
                ];

                foreach ($columnWidths as $column => $width) {
                    $sheet->getColumnDimension($column)->setWidth($width);
                }

                // Calculate totals
                $totals = [
                    'modal_awal' => $sales->sum('modal_awal'),
                    'cash' => $sales->sum('cash'),
                    'qris' => $sales->sum('qris'),
                    'sf' => $sales->sum('sf'),
                    'dana_masuk' => $sales->sum('dana_masuk'),
                    'dana_keluar' => $sales->sum('dana_keluar'),
                    'selisih_dana' => $sales->sum('selisih_dana'),
                    'omset_penjualan' => $sales->sum('omset_penjualan'),
                    'gaji_karyawan' => $sales->sum('gaji_karyawan'),
                    'untung_kotor' => $sales->sum('untung_kotor'),
                    'untung_bersih' => $sales->sum('untung_bersih'),
                    'selisih_pembayaran' => $sales->sum('selisih_pembayaran'),
                ];

                $totalUntung = $totals['untung_bersih'] + $totals['selisih_pembayaran'];
                $karyawanHadirCount = $sales->where('is_karyawan_hadir', true)->count();

                // Add totals row
                $totalRow = $lastDataRow + 1;
                $sheet->setCellValue('A'.$totalRow, 'GRAND TOTAL');
                $sheet->setCellValue('C'.$totalRow, 'Rp '.number_format($totals['modal_awal'], 0, ',', '.'));
                $sheet->setCellValue('D'.$totalRow, 'Rp '.number_format($totals['cash'], 0, ',', '.'));
                $sheet->setCellValue('E'.$totalRow, 'Rp '.number_format($totals['qris'], 0, ',', '.'));
                $sheet->setCellValue('F'.$totalRow, 'Rp '.number_format($totals['sf'], 0, ',', '.'));
                $sheet->setCellValue('G'.$totalRow, 'Rp '.number_format($totals['dana_masuk'], 0, ',', '.'));
                $sheet->setCellValue('H'.$totalRow, 'Rp '.number_format($totals['dana_keluar'], 0, ',', '.'));
                $sheet->setCellValue('I'.$totalRow, 'Rp '.number_format($totals['selisih_dana'], 0, ',', '.'));
                $sheet->setCellValue('J'.$totalRow, 'Rp '.number_format($totals['omset_penjualan'], 0, ',', '.'));
                $sheet->setCellValue('K'.$totalRow, 'Rp '.number_format($totals['gaji_karyawan'], 0, ',', '.'));
                $sheet->setCellValue('L'.$totalRow, 'Rp '.number_format($totals['untung_kotor'], 0, ',', '.'));
                $sheet->setCellValue('M'.$totalRow, 'Rp '.number_format($totals['untung_bersih'], 0, ',', '.'));
                $sheet->setCellValue('N'.$totalRow, 'Rp '.number_format($totals['selisih_pembayaran'], 0, ',', '.'));
                $sheet->setCellValue('O'.$totalRow, 'Rp '.number_format($totalUntung, 0, ',', '.'));
                $sheet->setCellValue('P'.$totalRow, $karyawanHadirCount.' Hari');

                // Style the totals row with light blue theme
                $sheet->getStyle('A'.$totalRow.':'.$highestColumn.$totalRow)->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 13,
                        'color' => ['rgb' => 'FFFFFF'],
                        'name' => 'Calibri',
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_GRADIENT_LINEAR,
                        'startColor' => ['rgb' => '0369A1'], // Dark sky blue
                        'endColor' => ['rgb' => '0EA5E9'], // Sky blue
                        'rotation' => 90,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THICK,
                            'color' => ['rgb' => '0284C7'],
                        ],
                    ],
                ]);

                $sheet->getRowDimension($totalRow)->setRowHeight(25);

                // Align numeric cells in totals row to the right
                foreach ($numericColumns as $col) {
                    $sheet->getStyle($col.$totalRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // Add signature section at the bottom with financial theme
                $signatureRow = $totalRow + 2;

                // Add a separator line
                $sheet->mergeCells('A'.($totalRow + 1).':'.$highestColumn.($totalRow + 1));
                $sheet->getStyle('A'.($totalRow + 1))->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E0F2FE'], // Light blue
                    ],
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '7DD3FC'],
                        ],
                    ],
                ]);

                $sheet->setCellValue('N'.$signatureRow, 'Dibuat Oleh,');
                $sheet->setCellValue('O'.$signatureRow, 'Diperiksa Oleh,');
                $sheet->setCellValue('P'.$signatureRow, 'Disetujui Oleh,');

                $sheet->setCellValue('N'.($signatureRow + 1), 'Admin Keuangan');
                $sheet->setCellValue('O'.($signatureRow + 1), 'Manager');
                $sheet->setCellValue('P'.($signatureRow + 1), 'Direktur');

                $sheet->setCellValue('N'.($signatureRow + 4), '(...........................)');
                $sheet->setCellValue('O'.($signatureRow + 4), '(...........................)');
                $sheet->setCellValue('P'.($signatureRow + 4), '(...........................)');

                // Style signature section
                $sheet->getStyle('N'.$signatureRow.':P'.($signatureRow + 4))->applyFromArray([
                    'font' => [
                        'size' => 10,
                        'name' => 'Calibri',
                        'color' => ['rgb' => '0C4A6E'], // Dark blue text
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                    ],
                ]);

                // Add financial disclaimer with light blue theme
                $disclaimerRow = $signatureRow + 6;
                $sheet->mergeCells('A'.$disclaimerRow.':'.$highestColumn.$disclaimerRow);
                $sheet->setCellValue('A'.$disclaimerRow, '💡 Dokumen ini adalah laporan keuangan resmi La Perin Pos. Untuk pertanyaan atau klarifikasi, hubungi departemen keuangan.');

                $sheet->getStyle('A'.$disclaimerRow)->applyFromArray([
                    'font' => [
                        'italic' => true,
                        'size' => 9,
                        'color' => ['rgb' => '0369A1'], // Dark blue text
                        'name' => 'Calibri',
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E0F2FE'], // Light blue
                    ],
                ]);

                $sheet->getRowDimension($disclaimerRow)->setRowHeight(25);

                // Protect the sheet (optional - allows formatting only)
                // $sheet->getProtection()->setSheet(true);
                // $sheet->getProtection()->setFormatCells(true);
            },
        ];
    }
}
