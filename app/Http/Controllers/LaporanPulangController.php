<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\LaporanPulang;
use App\Models\LaporanPulangItem;
use App\Models\Material;
use App\Models\Product;
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
            if ($request->has('items')) {
                foreach ($request->items as $item) {
                    if (isset($item['product_id']) && ($item['qty_terjual'] > 0 || $item['qty_bawa'] > 0)) {
                        $qtyTerjual = (int) ($item['qty_terjual'] ?? 0);
                        $qtyBawa = (int) ($item['qty_bawa'] ?? 0);

                        // Simpan item
                        LaporanPulangItem::create([
                            'laporan_pulang_id' => $laporan->id,
                            'product_id' => $item['product_id'],
                            'qty_terjual' => $qtyTerjual,
                            'qty_bawa' => $qtyBawa,
                        ]);

                        // Kembalikan sisa stok
                        $sisa = $qtyBawa - $qtyTerjual;
                        if ($sisa > 0) {
                            $product = Product::find($item['product_id']);
                            if ($product) {
                                $product->increment('stok', $sisa);
                            }
                        }
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
