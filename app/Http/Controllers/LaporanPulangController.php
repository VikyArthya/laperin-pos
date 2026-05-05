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
        $baseQuery = LaporanPulang::with(['shift', 'user', 'employee', 'items.product']);

        // Karyawan hanya bisa melihat laporan miliknya sendiri
        if (auth()->check() && auth()->user()->role === 'karyawan') {
            $authEmployee = Employee::where('user_id', auth()->id())->first();
            if ($authEmployee) {
                $baseQuery->where('employee_id', $authEmployee->id);
            }
        }

        $laporan = $baseQuery->orderBy('tanggal', 'desc')->get();

        return Inertia::render('LaporanPulang/Index', [
            'laporan' => $laporan,
        ]);
    }

    public function create()
    {
        $shifts = Shift::all();
        $products = Product::orderBy('nama_produk')->get();
        $materials = Material::orderBy('nama_bahan')->get();
        $authEmployee = null;

        if (auth()->check() && auth()->user()->role === 'karyawan') {
            $authEmployee = Employee::where('user_id', auth()->id())->first();
        }

        $employees = Employee::all();

        return Inertia::render('LaporanPulang/Create', [
            'shifts' => $shifts,
            'products' => $products,
            'materials' => $materials,
            'employees' => $employees,
            'authEmployee' => $authEmployee,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'shift_id' => 'required|exists:shifts,id',
            'cash' => 'nullable|integer|min:0',
            'qris' => 'nullable|integer|min:0',
            'sf' => 'nullable|integer|min:0',
            'ma_50' => 'nullable|string',
            'catatan_stok' => 'nullable|string',
            'stock_refill_items' => 'nullable|array',
            'stock_refill_items.*' => 'nullable|integer|exists:materials,id',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty_terjual' => 'nullable|integer|min:0',
            'items.*.qty_bawa' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($request) {
            // Auto-set employee_id untuk role karyawan
            $employeeId = $request->employee_id ?? null;
            if (auth()->user()->role === 'karyawan') {
                $authEmployee = Employee::where('user_id', auth()->id())->first();
                if ($authEmployee) {
                    $employeeId = $authEmployee->id;
                }
            }

            $cash = (int) ($request->cash ?? 0);
            $qris = (int) ($request->qris ?? 0);
            $sf = (int) ($request->sf ?? 0);
            $totalPembayaran = $cash + $qris + $sf;

            $laporan = LaporanPulang::create([
                'tanggal' => $request->tanggal,
                'shift_id' => $request->shift_id,
                'user_id' => auth()->id(),
                'employee_id' => $employeeId,
                'cash' => $cash,
                'qris' => $qris,
                'sf' => $sf,
                'total_pembayaran' => $totalPembayaran,
                'ma_50' => $request->ma_50,
                'catatan_stok' => $request->catatan_stok,
                'stock_refill_items' => $request->stock_refill_items ?? [],
            ]);

            // Process items dan kembalikan stok
            $totalOmsetProduk = 0;
            $totalModalAwal = 0;

            if ($request->has('items')) {
                foreach ($request->items as $item) {
                    if (isset($item['product_id']) && ($item['qty_terjual'] > 0 || $item['qty_bawa'] > 0)) {
                        $qtyTerjual = (int) ($item['qty_terjual'] ?? 0);
                        $qtyBawa = (int) ($item['qty_bawa'] ?? 0);

                        $product = Product::find($item['product_id']);
                        if ($product) {
                            // Hitung omset
                            $totalOmsetProduk += $product->harga * $qtyTerjual;

                            // Modal awal = harga_beli × qty_terjual (sesuai menu Kasir)
                            if ($product->harga_beli > 0) {
                                $totalModalAwal += $product->harga_beli * $qtyTerjual;
                            }
                        }

                        // Simpan item laporan pulang
                        LaporanPulangItem::create([
                            'laporan_pulang_id' => $laporan->id,
                            'product_id' => $item['product_id'],
                            'qty_terjual' => $qtyTerjual,
                            'qty_bawa' => $qtyBawa,
                        ]);

                        // Kembalikan sisa stok
                        $sisa = $qtyBawa - $qtyTerjual;
                        if ($sisa > 0 && $product) {
                            $product->increment('stok', $sisa);
                        }
                    }
                }
            }

            // Auto-create Sale record dari Laporan Pulang
            $danaKeluar = 0; // Bisa disesuaikan jika ada dana keluar lain

            // Hitung gaji karyawan berdasarkan rumus payroll
            // gaji = (omset × 20%) + (floor(omset / 100.000) × 5.000)
            $gajiKaryawan = 0;
            if ($employeeId && $totalPembayaran > 0) {
                $gajiBase = floor($totalPembayaran * 0.20);
                $bonus = floor($totalPembayaran / 100000) * 5000;
                $gajiKaryawan = $gajiBase + $bonus;
            }

            $sale = Sale::create([
                'user_id' => auth()->id(),
                'tanggal' => $request->tanggal,
                'shift_id' => $request->shift_id,
                'modal_awal' => $totalModalAwal,
                'cash' => $cash,
                'qris' => $qris,
                'sf' => $sf,
                'dana_keluar' => $danaKeluar,
                'dana_masuk' => $totalPembayaran,
                'selisih_dana' => $danaKeluar - $totalPembayaran,
                'omset_penjualan' => $totalPembayaran, // Omset = Dana Masuk
                'omset_bubuk' => 0,
                'omset_topping' => 0,
                'biaya_packaging' => 0,
                'is_karyawan_hadir' => $employeeId ? true : false,
                'employee_id' => $employeeId,
                'gaji_karyawan' => $gajiKaryawan,
                'untung_kotor' => $totalPembayaran - $danaKeluar - $gajiKaryawan,
                'untung_bersih' => $totalPembayaran - $danaKeluar - $gajiKaryawan,
                'untung_bersih_tanpa_karyawan' => $totalPembayaran - $danaKeluar,
                'selisih_uang_penjualan' => 0,
                'catatan' => 'Otomatis dibuat dari Laporan Pulang #'.$laporan->id,
            ]);

            // Create SaleItems dari Laporan Pulang Items
            if ($request->has('items')) {
                foreach ($request->items as $item) {
                    if (isset($item['product_id']) && $item['qty_terjual'] > 0) {
                        $product = Product::find($item['product_id']);
                        if ($product) {
                            $qtyTerjual = (int) ($item['qty_terjual'] ?? 0);
                            $subtotal = $product->harga * $qtyTerjual;

                            SaleItem::create([
                                'sale_id' => $sale->id,
                                'product_id' => $item['product_id'],
                                'qty' => $qtyTerjual,
                                'harga_satuan' => $product->harga,
                                'subtotal' => $subtotal,
                            ]);
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
        // Karyawan hanya bisa melihat laporan miliknya sendiri
        if (auth()->check() && auth()->user()->role === 'karyawan') {
            $authEmployee = Employee::where('user_id', auth()->id())->first();
            if ($authEmployee && $laporanPulang->employee_id !== $authEmployee->id) {
                abort(403, 'Anda tidak memiliki akses ke laporan ini.');
            }
        }

        $laporanPulang->load(['shift', 'user', 'employee', 'items.product']);

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
