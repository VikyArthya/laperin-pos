<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\LaporanPulang;
use App\Models\LaporanPulangItem;
use App\Models\Material;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LaporanPulangController extends Controller
{
    public function index()
    {
        $baseQuery = LaporanPulang::with(['shift', 'user', 'admin', 'employee', 'items.product']);

        // Admin: lihat semua laporan
        if (auth()->check() && auth()->user()->role === 'admin') {
            $laporan = $baseQuery->orderBy('tanggal', 'desc')->get();
        }
        // Karyawan: hanya lihat laporan yang di-assign ke dia
        elseif (auth()->check() && auth()->user()->role === 'karyawan') {
            $authEmployee = Employee::where('user_id', auth()->id())->first();
            if ($authEmployee) {
                $laporan = $baseQuery->where('employee_id', $authEmployee->id)->orderBy('tanggal', 'desc')->get();
            } else {
                $laporan = collect();
            }
        } else {
            $laporan = collect();
        }

        return Inertia::render('LaporanPulang/Index', [
            'laporan' => $laporan,
        ]);
    }

    public function create()
    {
        // Hanya admin yang bisa membuat laporan baru
        if (auth()->check() && auth()->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang dapat membuat laporan baru.');
        }

        $shifts = Shift::all();
        $products = Product::orderBy('nama_produk')->get();
        $materials = Material::orderBy('nama_bahan')->get();
        $employees = Employee::orderBy('nama')->get();

        return Inertia::render('LaporanPulang/Create', [
            'shifts' => $shifts,
            'products' => $products,
            'materials' => $materials,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        // Hanya admin yang bisa membuat laporan
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang dapat membuat laporan.');
        }

        $request->validate([
            'tanggal' => 'required|date',
            'shift_id' => 'required|exists:shifts,id',
            'employee_id' => 'required|exists:employees,id',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty_bawa' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($request) {
            // Format tanggal untuk memastikan format yang benar dan avoid timezone issues
            $tanggal = $request->tanggal;
            if (is_string($tanggal)) {
                // Parse tanggal tanpa timezone info
                $parts = explode('-', $tanggal);
                if (count($parts) === 3) {
                    [$year, $month, $day] = $parts;
                    // Create DateTime tanpa timezone (set ke UTC untuk menghindari konversi)
                    $tanggal = sprintf('%04d-%02d-%02d', (int) $year, (int) $month, (int) $day);
                }
            }

            $laporan = LaporanPulang::create([
                'tanggal' => $tanggal,
                'shift_id' => $request->shift_id,
                'admin_id' => auth()->id(),
                'user_id' => null, // Akan diisi saat karyawan submit
                'employee_id' => $request->employee_id, // Admin assign ke karyawan
                'status' => 'submitted_by_admin',
                'cash' => 0,
                'qris' => 0,
                'sf' => 0,
                'total_pembayaran' => 0,
                'ma_50' => null,
                'catatan_stok' => null,
                'stock_refill_items' => [],
            ]);

            // Simpan stok bawa untuk setiap produk dan kurangi stok master
            if ($request->has('items')) {
                foreach ($request->items as $item) {
                    if (isset($item['product_id']) && $item['qty_bawa'] > 0) {
                        $qtyBawa = (int) $item['qty_bawa'];

                        LaporanPulangItem::create([
                            'laporan_pulang_id' => $laporan->id,
                            'product_id' => $item['product_id'],
                            'qty_bawa' => $qtyBawa,
                            'qty_sisa' => 0, // Akan diisi oleh karyawan
                        ]);

                        // Kurangi stok master produk sejumlah qty_bawa
                        $product = Product::find($item['product_id']);
                        if ($product && $product->stok >= $qtyBawa) {
                            $product->decrement('stok', $qtyBawa);
                        }
                    }
                }
            }
        });

        return redirect()->route('laporan-pulang.index');
    }

    public function edit(LaporanPulang $laporanPulang)
    {
        // Hanya karyawan yang bisa mengedit laporan
        if (auth()->check() && auth()->user()->role === 'karyawan') {
            if (! $laporanPulang->isSubmittedByAdmin()) {
                abort(403, 'Laporan ini belum siap untuk diisi.');
            }

            // Cek apakah laporan di-assign ke karyawan yang sedang login
            $authEmployee = Employee::where('user_id', auth()->id())->first();
            if (! $authEmployee || $laporanPulang->employee_id !== $authEmployee->id) {
                abort(403, 'Laporan ini tidak di-assign ke Anda.');
            }
        } else {
            abort(403, 'Hanya karyawan yang dapat mengisi laporan.');
        }

        $laporanPulang->load(['shift', 'items.product']);

        $materials = Material::orderBy('nama_bahan')->get();
        $authEmployee = Employee::where('user_id', auth()->id())->first();

        return Inertia::render('LaporanPulang/Edit', [
            'laporan' => $laporanPulang,
            'materials' => $materials,
            'authEmployee' => $authEmployee,
        ]);
    }

    public function update(Request $request, LaporanPulang $laporanPulang)
    {
        // Hanya karyawan yang bisa update laporan
        if (auth()->user()->role !== 'karyawan') {
            abort(403, 'Hanya karyawan yang dapat mengisi laporan.');
        }

        // Validasi status laporan
        if (! $laporanPulang->isSubmittedByAdmin() && ! $laporanPulang->employee_id) {
            abort(403, 'Laporan ini belum siap untuk diisi.');
        }

        $request->validate([
            'cash' => 'nullable|integer|min:0',
            'qris' => 'nullable|integer|min:0',
            'sf' => 'nullable|integer|min:0',
            'ma_50' => 'nullable|string',
            'catatan_stok' => 'nullable|string',
            'stock_refill_items' => 'nullable|array',
            'stock_refill_items.*' => 'nullable|integer|exists:materials,id',
            'items' => 'nullable|array',
            'items.*.id' => 'required|exists:laporan_pulang_items,id',
            'items.*.qty_sisa' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($request, $laporanPulang) {
            $authEmployee = Employee::where('user_id', auth()->id())->first();
            if (! $authEmployee) {
                abort(403, 'Data karyawan tidak ditemukan.');
            }

            $cash = (int) ($request->cash ?? 0);
            $qris = (int) ($request->qris ?? 0);
            $sf = (int) ($request->sf ?? 0);
            $totalPembayaran = $cash + $qris + $sf;

            // Update laporan
            $laporanPulang->update([
                'user_id' => auth()->id(),
                'employee_id' => $authEmployee->id,
                'cash' => $cash,
                'qris' => $qris,
                'sf' => $sf,
                'total_pembayaran' => $totalPembayaran,
                'ma_50' => $request->ma_50,
                'catatan_stok' => $request->catatan_stok,
                'stock_refill_items' => $request->stock_refill_items ?? [],
                'status' => 'completed',
            ]);

            // Process items dan hitung qty_terjual
            $totalOmsetProduk = 0;
            $totalModalAwal = 0;

            if ($request->has('items')) {
                foreach ($request->items as $item) {
                    if (isset($item['id'])) {
                        $laporanItem = LaporanPulangItem::find($item['id']);
                        if ($laporanItem && $laporanItem->laporan_pulang_id === $laporanPulang->id) {
                            $qtySisa = (int) ($item['qty_sisa'] ?? 0);
                            $qtyBawa = $laporanItem->qty_bawa;

                            // Hitung qty_terjual = qty_bawa - qty_sisa
                            $qtyTerjual = max(0, $qtyBawa - $qtySisa);

                            // Update item laporan pulang
                            $laporanItem->update([
                                'qty_sisa' => $qtySisa,
                            ]);

                            $product = $laporanItem->product;
                            if ($product) {
                                // Hitung omset
                                $totalOmsetProduk += $product->harga * $qtyTerjual;

                                // Modal awal = harga_beli × qty_terjual
                                if ($product->harga_beli > 0) {
                                    $totalModalAwal += $product->harga_beli * $qtyTerjual;
                                }

                                // Kembalikan sisa stok
                                if ($qtySisa > 0) {
                                    $product->increment('stok', $qtySisa);
                                }
                            }
                        }
                    }
                }
            }

            // Auto-create/update Sale record dari Laporan Pulang
            $danaKeluar = 0;
            $gajiKaryawan = 0;
            if ($totalPembayaran > 0) {
                $gajiBase = floor($totalPembayaran * 0.20);
                $bonus = floor($totalPembayaran / 100000) * 5000;
                $gajiKaryawan = $gajiBase + $bonus;
            }

            // Cek apakah sale sudah ada
            $sale = Sale::where('laporan_pulang_id', $laporanPulang->id)->first();

            if ($sale) {
                // Update existing sale
                $sale->update([
                    'user_id' => auth()->id(),
                    'modal_awal' => $totalModalAwal,
                    'cash' => $cash,
                    'qris' => $qris,
                    'sf' => $sf,
                    'dana_keluar' => $danaKeluar,
                    'dana_masuk' => $totalPembayaran,
                    'selisih_dana' => $danaKeluar - $totalPembayaran,
                    'omset_penjualan' => $totalPembayaran,
                    'is_karyawan_hadir' => true,
                    'employee_id' => $authEmployee->id,
                    'gaji_karyawan' => $gajiKaryawan,
                    'untung_kotor' => $totalPembayaran - $danaKeluar - $gajiKaryawan,
                    'untung_bersih' => $totalPembayaran - $danaKeluar - $gajiKaryawan,
                    'untung_bersih_tanpa_karyawan' => $totalPembayaran - $danaKeluar,
                    'catatan' => 'Diperbarui dari Laporan Pulang #'.$laporanPulang->id,
                ]);

                // Delete existing sale items
                SaleItem::where('sale_id', $sale->id)->delete();
            } else {
                // Create new sale
                $sale = Sale::create([
                    'user_id' => auth()->id(),
                    'tanggal' => $laporanPulang->tanggal,
                    'shift_id' => $laporanPulang->shift_id,
                    'laporan_pulang_id' => $laporanPulang->id,
                    'modal_awal' => $totalModalAwal,
                    'cash' => $cash,
                    'qris' => $qris,
                    'sf' => $sf,
                    'dana_keluar' => $danaKeluar,
                    'dana_masuk' => $totalPembayaran,
                    'selisih_dana' => $danaKeluar - $totalPembayaran,
                    'omset_penjualan' => $totalPembayaran,
                    'omset_bubuk' => 0,
                    'omset_topping' => 0,
                    'biaya_packaging' => 0,
                    'is_karyawan_hadir' => true,
                    'employee_id' => $authEmployee->id,
                    'gaji_karyawan' => $gajiKaryawan,
                    'untung_kotor' => $totalPembayaran - $danaKeluar - $gajiKaryawan,
                    'untung_bersih' => $totalPembayaran - $danaKeluar - $gajiKaryawan,
                    'untung_bersih_tanpa_karyawan' => $totalPembayaran - $danaKeluar,
                    'selisih_uang_penjualan' => 0,
                    'catatan' => 'Otomatis dibuat dari Laporan Pulang #'.$laporanPulang->id,
                ]);
            }

            // Create SaleItems dari Laporan Pulang Items
            if ($request->has('items')) {
                foreach ($request->items as $item) {
                    if (isset($item['id'])) {
                        $laporanItem = LaporanPulangItem::find($item['id']);
                        if ($laporanItem && $laporanItem->laporan_pulang_id === $laporanPulang->id) {
                            $product = $laporanItem->product;
                            if ($product) {
                                $qtyBawa = $laporanItem->qty_bawa;
                                $qtySisa = (int) ($item['qty_sisa'] ?? 0);
                                $qtyTerjual = max(0, $qtyBawa - $qtySisa);

                                if ($qtyTerjual > 0) {
                                    $subtotal = $product->harga * $qtyTerjual;

                                    SaleItem::create([
                                        'sale_id' => $sale->id,
                                        'product_id' => $product->id,
                                        'qty' => $qtyTerjual,
                                        'harga_satuan' => $product->harga,
                                        'subtotal' => $subtotal,
                                    ]);
                                }
                            }
                        }
                    }
                }
            }

            // Kurangi stok bahan pokok yang perlu direfill
            if ($request->has('stock_refill_items') && is_array($request->stock_refill_items)) {
                foreach ($request->stock_refill_items as $materialId) {
                    $material = Material::find($materialId);
                    if ($material && $material->stok > 0) {
                        $material->decrement('stok', 1);
                    }
                }
            }
        });

        return redirect()->route('laporan-pulang.index');
    }

    public function show(LaporanPulang $laporanPulang)
    {
        // Admin: bisa lihat semua laporan
        // Karyawan: hanya bisa melihat laporan yang di-assign ke dia
        if (auth()->check() && auth()->user()->role === 'karyawan') {
            $authEmployee = Employee::where('user_id', auth()->id())->first();
            if (! $authEmployee || $laporanPulang->employee_id !== $authEmployee->id) {
                abort(403, 'Anda tidak memiliki akses ke laporan ini.');
            }
        }

        $laporanPulang->load(['shift', 'user', 'admin', 'employee', 'items.product']);

        // Load materials untuk stock refill items
        $stockRefillMaterials = [];
        if ($laporanPulang->stock_refill_items) {
            $stockRefillMaterials = Material::whereIn('id', $laporanPulang->stock_refill_items)->get();
        }

        // Group items by category
        $itemsByCategory = [
            'Menu Utama' => [],
            'Topping' => [],
            'Packaging' => [],
        ];

        foreach ($laporanPulang->items as $item) {
            $kategori = $item->product->kategori ?? 'Lainnya';
            if (! isset($itemsByCategory[$kategori])) {
                $itemsByCategory[$kategori] = [];
            }
            $itemsByCategory[$kategori][] = $item;
        }

        return Inertia::render('LaporanPulang/Show', [
            'laporan' => $laporanPulang,
            'itemsByCategory' => $itemsByCategory,
            'stockRefillMaterials' => $stockRefillMaterials,
        ]);
    }
}
