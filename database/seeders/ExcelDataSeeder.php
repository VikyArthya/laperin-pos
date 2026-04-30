<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shift;
use App\Models\Product;
use App\Models\Material;
use App\Models\Employee;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\EmployeeSalary;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;

class ExcelDataSeeder extends Seeder
{
    public function run()
    {
        $filePath = base_path('Rekap Penjualan Laper.in.xlsx');
        
        if (!file_exists($filePath)) {
            $this->command->error("File Excel tidak ditemukan di: " . $filePath);
            return;
        }

        $this->command->info("Membaca file Excel...");
        $spreadsheet = IOFactory::load($filePath);
        $sheetNames = $spreadsheet->getSheetNames();

        foreach ($sheetNames as $sheetName) {
            $sheet = $spreadsheet->getSheetByName($sheetName);
            $rows = $sheet->toArray(null, true, true, false); // no formatting, calc formulas, return indexed array

            if ($sheetName === 'MA') {
                $this->importMaterials($rows);
            } elseif ($sheetName === 'Gaji Karyawan') {
                // Untuk sementara gaji karyawan bisa di-import secara dinamis dari sheet bulanan.
                // Jika ingin parsing sheet khusus "Gaji Karyawan" bisa dilanjutkan di sini.
                $this->command->info("Melewati sheet khusus Gaji Karyawan (bisa diparsing jika diperlukan)...");
            } elseif (in_array($sheetName, ['Januari 2025', 'Februari 2025', 'November 2025', 'Desember 2025', 'Februari 2026', 'Maret 2026', 'April 2026'])) {
                // Semua sheet bulanan
                $this->importSales($sheetName, $rows);
            }
        }
        
        $this->command->info("Data Excel berhasil di-import!");
    }

    private function importMaterials($rows)
    {
        $this->command->info("Importing Materials...");
        foreach ($rows as $index => $row) {
            if ($index === 0) continue; // Skip header
            
            $namaBahan = $row[0];
            $nominal = $row[1];

            if ($namaBahan) {
                Material::updateOrCreate(
                    ['nama_bahan' => trim($namaBahan)],
                    ['nominal' => (int) $nominal]
                );
            }
        }
    }

    private function importSales($sheetName, $rows)
    {
        $this->command->info("Importing Sales dari sheet: " . $sheetName);
        
        if (count($rows) < 2) return;
        
        // Ambil header di baris pertama
        $headers = $rows[0];
        
        // Cari index dari kolom yang tetap
        $idxTanggal = array_search('Hari/Tanggal', $headers);
        $idxShift = array_search('Shift', $headers);
        
        if ($idxTanggal === false || $idxShift === false) {
            $this->command->warn("Format header tidak sesuai di sheet: " . $sheetName);
            return;
        }

        // Definisi kolom tetap
        $fixedColumns = [
            'Modal Awal (Rp)' => 'modal_awal',
            'Cash' => 'cash',
            'QRIS' => 'qris',
            'SF (OUT)' => 'sf_out',
            'SF (IN)' => 'sf_in',
            'SF (Selisih)' => 'sf_selisih',
            'Omset Penjualan (Rp)' => 'omset_penjualan',
            'Omset Bubuk' => 'omset_bubuk',
            'Omset Topping (Rp)' => 'omset_topping',
            'Packaging (Rp)' => 'biaya_packaging',
            'Karyawan' => 'is_karyawan_hadir',
            'Gaji Karyawan (Rp)' => 'gaji_karyawan',
            'Untung Kotor (Rp)' => 'untung_kotor',
            'Untung bersih (Rp)' => 'untung_bersih',
            'Untung Bersih Tanpa Karyawan (Rp)' => 'untung_bersih_tanpa_karyawan',
            'Selisih Uang Penjualan (Rp)' => 'selisih_uang_penjualan',
            'Catatan' => 'catatan',
        ];

        // Temukan index produk dinamis (kolom antara Shift dan Modal Awal / Omset Bubuk)
        $productIndices = [];
        foreach ($headers as $idx => $header) {
            if (empty($header) || in_array($header, ['Hari/Tanggal', 'Shift'])) continue;
            
            if (array_key_exists($header, $fixedColumns)) continue;
            
            // Anggap sisanya adalah produk / menu / topping / bowl
            $productIndices[$header] = $idx;
        }

        foreach ($rows as $index => $row) {
            if ($index === 0) continue; // Skip header

            $tanggalStr = $row[$idxTanggal];
            $shiftName = $row[$idxShift];

            if (empty($tanggalStr) || empty($shiftName)) continue;

            // Handle format tanggal Excel (serial number atau text)
            if (is_numeric($tanggalStr)) {
                $tanggal = Date::excelToDateTimeObject($tanggalStr)->format('Y-m-d');
            } else {
                try {
                    // Coba parsing jika format teks seperti "Jum'at, 06/02/2026"
                    $parts = explode(', ', $tanggalStr);
                    $datePart = count($parts) > 1 ? $parts[1] : $tanggalStr;
                    $tanggal = Carbon::createFromFormat('d/m/Y', $datePart)->format('Y-m-d');
                } catch (\Exception $e) {
                    $tanggal = Carbon::now()->format('Y-m-d'); // Default fallback
                }
            }

            // Dapatkan atau Buat Shift
            $shift = Shift::firstOrCreate(['nama_shift' => trim($shiftName)]);

            // Buat record Sale
            $saleData = [
                'tanggal' => $tanggal,
                'shift_id' => $shift->id,
            ];

            foreach ($fixedColumns as $excelCol => $dbCol) {
                $idx = array_search($excelCol, $headers);
                if ($idx !== false) {
                    $val = $row[$idx];
                    if ($dbCol === 'catatan') {
                        $saleData[$dbCol] = $val;
                    } elseif ($dbCol === 'is_karyawan_hadir') {
                        $saleData[$dbCol] = !empty($val) && $val != 0;
                    } else {
                        // Cast ke int untuk uang
                        $saleData[$dbCol] = (int) preg_replace('/[^0-9\-]/', '', (string)$val);
                    }
                }
            }

            $sale = Sale::create($saleData);

            // Import Sale Items
            foreach ($productIndices as $productName => $idx) {
                $qty = $row[$idx];
                if (!empty($qty) && $qty > 0) {
                    
                    // Kategori penentuan sederhana
                    $kategori = 'Menu Utama';
                    if (str_contains(strtolower($productName), 'bowl') || str_contains(strtolower($productName), 'packaging')) {
                        $kategori = 'Packaging';
                    } elseif (in_array(strtolower($productName), ['cikur', 'cuanki', 'mie', 'mentai', 'keju creamy', 'chili oil'])) {
                        $kategori = 'Topping';
                    }

                    $product = Product::firstOrCreate(
                        ['nama_produk' => trim($productName)],
                        ['kategori' => $kategori, 'harga' => 0]
                    );

                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'product_id' => $product->id,
                        'qty' => (float) $qty,
                        'harga_satuan' => 0, // Excel lama tidak ada harga
                        'subtotal' => 0
                    ]);
                }
            }

            // Jika ada gaji karyawan, simpan ke employee_salaries
            // (Mengambil nama shift sebagai nama karyawan sementara sesuai anomali Excel)
            if ($sale->gaji_karyawan > 0 && $sale->is_karyawan_hadir) {
                $employee = Employee::firstOrCreate(['nama' => trim($shiftName)]);
                EmployeeSalary::create([
                    'employee_id' => $employee->id,
                    'tanggal' => $tanggal,
                    'nominal_gaji' => $sale->gaji_karyawan
                ]);
            }
        }
    }
}
