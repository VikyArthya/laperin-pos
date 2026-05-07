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
                'font' => ['bold' => true, 'size' => 11],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '3B82F6'],
                ],
                'font' => [
                    'color' => ['rgb' => 'FFFFFF'],
                    'bold' => true,
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

                // Get all data to calculate totals
                $sales = $this->query()->get();

                if ($sales->isEmpty()) {
                    return;
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
                $totalRow = $highestRow + 1;
                $sheet->setCellValue('A'.$totalRow, 'TOTAL:');
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

                // Style the totals row
                $sheet->getStyle('A'.$totalRow.':R'.$totalRow)->applyFromArray([
                    'font' => ['bold' => true, 'size' => 11],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '10B981'],
                    ],
                    'font' => [
                        'color' => ['rgb' => 'FFFFFF'],
                        'bold' => true,
                    ],
                ]);
            },
        ];
    }
}
