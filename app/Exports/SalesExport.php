<?php

namespace App\Exports;

use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesExport implements FromQuery, WithColumnFormatting, WithHeadings, WithMapping, WithStyles, WithTitle
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
            $sale->modal_awal,
            $sale->cash ?? 0,
            $sale->qris ?? 0,
            $sale->sf ?? 0,
            $sale->dana_masuk,
            $sale->dana_keluar,
            $sale->selisih_dana,
            $sale->omset_penjualan,
            $sale->gaji_karyawan,
            $sale->untung_kotor,
            $sale->untung_bersih,
            $sale->selisih_pembayaran ?? 0,
            ($sale->untung_bersih ?? 0) + ($sale->selisih_pembayaran ?? 0),
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

    public function columnFormats(): array
    {
        return [
            'C' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'D' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'E' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'F' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'G' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'H' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'I' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'J' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'K' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'L' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'M' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'N' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'O' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
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
}
