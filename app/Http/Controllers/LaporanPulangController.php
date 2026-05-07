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
            'dana_keluar' => 'nullable|integer|min:0',
            'catatan_dana_keluar' => 'nullable|string',
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
                'dana_keluar' => (int) ($request->dana_keluar ?? 0),
                'catatan_dana_keluar' => $request->catatan_dana_keluar,
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
        // Admin bisa edit semua laporan
        if (auth()->check() && auth()->user()->role === 'admin') {
            // Admin can edit
        }
        // Karyawan hanya bisa mengedit laporan yang di-assign ke dia dan belum completed
        elseif (auth()->check() && auth()->user()->role === 'karyawan') {
            if (! $laporanPulang->isSubmittedByAdmin()) {
                abort(403, 'Laporan ini belum siap untuk diisi.');
            }

            // Cek apakah laporan di-assign ke karyawan yang sedang login
            $authEmployee = Employee::where('user_id', auth()->id())->first();
            if (! $authEmployee || $laporanPulang->employee_id !== $authEmployee->id) {
                abort(403, 'Laporan ini tidak di-assign ke Anda.');
            }
        } else {
            abort(403, 'Anda tidak memiliki akses untuk mengedit laporan ini.');
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
        // Hanya admin dan karyawan terkait yang bisa update laporan
        if (auth()->user()->role !== 'admin' && auth()->user()->role !== 'karyawan') {
            abort(403, 'Anda tidak memiliki akses untuk mengupdate laporan ini.');
        }

        // Jika karyawan, cek validasi status laporan
        if (auth()->user()->role === 'karyawan') {
            if (! $laporanPulang->isSubmittedByAdmin() && ! $laporanPulang->employee_id) {
                abort(403, 'Laporan ini belum siap untuk diisi.');
            }
        }

        $request->validate([
            'cash' => 'nullable|integer|min:0',
            'qris' => 'nullable|integer|min:0',
            'sf' => 'nullable|integer|min:0',
            'dana_keluar' => 'nullable|integer|min:0',
            'catatan_dana_keluar' => 'nullable|string',
            'ma_50' => 'nullable|string',
            'catatan_stok' => 'nullable|string',
            'stock_refill_items' => 'nullable|array',
            'stock_refill_items.*' => 'nullable|integer|exists:materials,id',
            'items' => 'nullable|array',
            'items.*.id' => 'required|exists:laporan_pulang_items,id',
            'items.*.qty_sisa' => 'nullable|integer|min:0',
            'items.*.qty_bawa' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($request, $laporanPulang) {
            $isAdmin = auth()->user()->role === 'admin';
            $isSubmittedByAdmin = $laporanPulang->status === 'submitted_by_admin';

            $cash = (int) ($request->cash ?? 0);
            $qris = (int) ($request->qris ?? 0);
            $sf = (int) ($request->sf ?? 0);
            $danaKeluar = (int) ($request->dana_keluar ?? 0);
            $totalPembayaran = $cash + $qris + $sf;

            // 1. Handle Qty Bawa changes by Admin (hanya jika status masih submitted_by_admin)
            if ($isAdmin && $isSubmittedByAdmin && $request->has('items')) {
                foreach ($request->items as $itemData) {
                    if (isset($itemData['id']) && isset($itemData['qty_bawa'])) {
                        $laporanItem = LaporanPulangItem::find($itemData['id']);
                        if ($laporanItem && $laporanItem->laporan_pulang_id === $laporanPulang->id) {
                            $oldQtyBawa = $laporanItem->qty_bawa;
                            $newQtyBawa = (int) $itemData['qty_bawa'];

                            if ($oldQtyBawa !== $newQtyBawa) {
                                $diff = $newQtyBawa - $oldQtyBawa;
                                $product = $laporanItem->product;
                                if ($product) {
                                    // Jika nambah qty bawa, stok master berkurang
                                    // Jika kurang qty bawa, stok master bertambah
                                    $product->decrement('stok', $diff);
                                }
                                $laporanItem->update(['qty_bawa' => $newQtyBawa]);
                            }
                        }
                    }
                }
            }

            // Tentukan status baru
            // Jika status lama sudah completed, tetap completed
            // Jika status lama submitted_by_admin:
            //   - Jika Admin yang edit dan tidak isi pembayaran/sisa, tetap submitted_by_admin
            //   - Jika Karyawan yang edit, atau Admin isi pembayaran/sisa, jadi completed
            $newStatus = $laporanPulang->status;
            if ($laporanPulang->status === 'completed') {
                $newStatus = 'completed';
            } elseif ($totalPembayaran > 0 || $request->has('items')) {
                // Cek apakah ada qty_sisa yang diisi (bukan 0)
                $hasQtySisa = false;
                if ($request->has('items')) {
                    foreach ($request->items as $i) {
                        if (isset($i['qty_sisa']) && (int) $i['qty_sisa'] > 0) {
                            $hasQtySisa = true;
                            break;
                        }
                    }
                }

                if ($totalPembayaran > 0 || $hasQtySisa || auth()->user()->role === 'karyawan') {
                    $newStatus = 'completed';
                }
            }

            // Update laporan
            $updateData = [
                'cash' => $cash,
                'qris' => $qris,
                'sf' => $sf,
                'total_pembayaran' => $totalPembayaran,
                'dana_keluar' => $danaKeluar,
                'catatan_dana_keluar' => $request->catatan_dana_keluar,
                'ma_50' => $request->ma_50,
                'catatan_stok' => $request->catatan_stok,
                'stock_refill_items' => $request->stock_refill_items ?? [],
                'status' => $newStatus,
            ];

            // Jika belum ada user_id (karyawan belum submit), isi dengan auth id jika role karyawan
            if (! $laporanPulang->user_id && auth()->user()->role === 'karyawan') {
                $updateData['user_id'] = auth()->id();
            }

            $laporanPulang->update($updateData);

            // Jika statusnya completed, baru proses Sale dan Stok Kembalian
            if ($newStatus === 'completed') {
                $authEmployee = Employee::where('id', $laporanPulang->employee_id)->first();
                if (! $authEmployee) {
                    // Fallback jika tidak ada employee_id
                    $authEmployee = Employee::where('user_id', auth()->id())->first();
                }

                // Process items dan hitung qty_terjual
                $totalHargaTerjual = 0;
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
                                    // Hitung total harga terjual dari harga produk × qty terjual
                                    $totalHargaTerjual += $product->harga * $qtyTerjual;

                                    // Modal awal = harga_beli × qty_terjual
                                    if ($product->harga_beli > 0) {
                                        $totalModalAwal += $product->harga_beli * $qtyTerjual;
                                    }

                                    // Kembalikan sisa stok ke master
                                    if ($qtySisa > 0) {
                                        $product->increment('stok', $qtySisa);
                                    }
                                }
                            }
                        }
                    }
                }

                // Hitung selisih pembayaran (Total Pembayaran - Total Harga Terjual)
                // Positif = Lebih bayar (bonus dari ShopeeFood)
                // Negatif = Kurang bayar
                $selisihPembayaran = $totalPembayaran - $totalHargaTerjual;

                // Hitung gaji karyawan berdasarkan total pembayaran
                $gajiKaryawan = 0;
                if ($totalPembayaran > 0) {
                    $gajiBase = floor($totalPembayaran * 0.20);
                    $bonus = floor($totalPembayaran / 100000) * 5000;
                    $gajiKaryawan = $gajiBase + $bonus;
                }

                // PERHITUNGAN PENJUALAN:
                // Omset Penjualan = Total Harga Terjual (harga produk yang terjual)
                // Untung Kotor = Omset Penjualan - Modal Awal
                // Untung Bersih = (Untung Kotor - Gaji Karyawan) + Selisih Pembayaran
                $omsetPenjualan = $totalHargaTerjual;
                $untungKotor = $omsetPenjualan - $totalModalAwal;
                $untungBersihTanpaKaryawan = $untungKotor + $selisihPembayaran;
                $untungBersih = ($untungKotor - $gajiKaryawan) + $selisihPembayaran;

                // Cek apakah sale sudah ada
                $sale = Sale::where('laporan_pulang_id', $laporanPulang->id)->first();

                $saleData = [
                    'user_id' => auth()->id(),
                    'modal_awal' => $totalModalAwal,
                    'cash' => $cash,
                    'qris' => $qris,
                    'sf' => $sf,
                    'dana_keluar' => $danaKeluar,
                    'dana_masuk' => $totalPembayaran,
                    'selisih_dana' => $danaKeluar - $totalPembayaran,
                    'omset_penjualan' => $omsetPenjualan,
                    'is_karyawan_hadir' => true,
                    'employee_id' => $authEmployee?->id,
                    'gaji_karyawan' => $gajiKaryawan,
                    'untung_kotor' => $untungKotor,
                    'untung_bersih' => $untungBersih,
                    'untung_bersih_tanpa_karyawan' => $untungBersihTanpaKaryawan,
                    'selisih_pembayaran' => $selisihPembayaran,
                    'selisih_uang_penjualan' => 0,
                ];

                if ($sale) {
                    // Update existing sale
                    $sale->update(array_merge($saleData, [
                        'catatan' => 'Diperbarui dari Laporan Pulang #'.$laporanPulang->id,
                    ]));

                    // Delete existing sale items
                    SaleItem::where('sale_id', $sale->id)->delete();
                } else {
                    // Create new sale
                    $sale = Sale::create(array_merge($saleData, [
                        'tanggal' => $laporanPulang->tanggal,
                        'shift_id' => $laporanPulang->shift_id,
                        'laporan_pulang_id' => $laporanPulang->id,
                        'omset_bubuk' => 0,
                        'omset_topping' => 0,
                        'biaya_packaging' => 0,
                        'catatan' => 'Otomatis dibuat dari Laporan Pulang #'.$laporanPulang->id,
                    ]));
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

    public function destroy(LaporanPulang $laporanPulang)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang dapat menghapus laporan.');
        }

        DB::transaction(function () use ($laporanPulang) {
            // 1. Kembalikan stok produk
            foreach ($laporanPulang->items as $item) {
                $product = $item->product;
                if ($product) {
                    $qtyBawa = $item->qty_bawa;
                    $qtySisa = $item->qty_sisa;

                    // Jika laporan sudah selesai, yang perlu dikembalikan adalah qty_terjual
                    // Karena saat sisa diinput, sisa tersebut sudah ditambahkan kembali ke stok master.
                    // Jadi selisih yang benar-benar berkurang dari master adalah (bawa - sisa).
                    $qtyTerjual = max(0, $qtyBawa - $qtySisa);

                    if ($qtyTerjual > 0) {
                        $product->increment('stok', $qtyTerjual);
                    }
                }
            }

            // 2. Hapus Sale record terkait (jika ada)
            $sale = Sale::where('laporan_pulang_id', $laporanPulang->id)->first();
            if ($sale) {
                // Hapus item penjualan terlebih dahulu
                SaleItem::where('sale_id', $sale->id)->delete();
                $sale->delete();
            }

            // 3. Hapus item laporan pulang
            LaporanPulangItem::where('laporan_pulang_id', $laporanPulang->id)->delete();

            // 4. Hapus laporan pulang itu sendiri
            $laporanPulang->delete();
        });

        return redirect()->route('laporan-pulang.index')->with('success', 'Laporan pulang berhasil dihapus dan stok telah dikembalikan.');
    }
}
