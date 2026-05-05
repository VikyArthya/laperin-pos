<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeSalary;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function dashboard()
    {
        $baseQuery = Sale::query();
        if (auth()->check() && auth()->user()->role === 'karyawan') {
            $baseQuery->where('user_id', auth()->id());
        }

        $totalOmset = (clone $baseQuery)->sum('omset_penjualan');
        $totalUntung = (clone $baseQuery)->sum('untung_bersih');

        $currentMonthSales = (clone $baseQuery)->whereMonth('tanggal', date('m'))
            ->whereYear('tanggal', date('Y'))
            ->sum('omset_penjualan');

        $monthlySalesRaw = (clone $baseQuery)->selectRaw('MONTH(tanggal) as month, SUM(omset_penjualan) as omset, SUM(untung_bersih) as untung')
            ->whereYear('tanggal', date('Y'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $yearlySalesRaw = (clone $baseQuery)->selectRaw('YEAR(tanggal) as year, SUM(omset_penjualan) as omset, SUM(untung_bersih) as untung')
            ->groupBy('year')
            ->orderBy('year')
            ->take(5)
            ->get();

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        $monthlySales = [];
        for ($i = 1; $i <= 12; $i++) {
            $data = $monthlySalesRaw->firstWhere('month', $i);
            $monthlySales[] = [
                'name' => $months[$i - 1],
                'omset' => $data ? (int) $data->omset : 0,
                'untung' => $data ? (int) $data->untung : 0,
            ];
        }

        $yearlySales = $yearlySalesRaw->map(function ($item) {
            return [
                'name' => (string) $item->year,
                'omset' => (int) $item->omset,
                'untung' => (int) $item->untung,
            ];
        })->values()->toArray();

        $itemQuery = SaleItem::selectRaw('product_id, SUM(qty) as total_qty')
            ->with('product:id,nama_produk');

        if (auth()->check() && auth()->user()->role === 'karyawan') {
            $itemQuery->whereHas('sale', function ($q) {
                $q->where('user_id', auth()->id());
            });
        }

        $topProductsRaw = $itemQuery->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        $topProducts = $topProductsRaw->map(function ($item) {
            return [
                'name' => $item->product ? $item->product->nama_produk : 'Produk Dihapus',
                'value' => (int) $item->total_qty,
            ];
        })->values()->toArray();

        return Inertia::render('dashboard', [
            'chartData' => [
                'monthly' => $monthlySales,
                'yearly' => $yearlySales,
                'topProducts' => $topProducts,
            ],
            'stats' => [
                'totalOmset' => $totalOmset,
                'totalUntung' => $totalUntung,
                'currentMonthSales' => $currentMonthSales,
                'totalData' => Sale::selectRaw('DATE(tanggal) as tgl')->groupBy('tgl')->get()->count(),
            ],
            'auth' => [
                'user' => auth()->user() ? [
                    'id' => auth()->id(),
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'role' => auth()->user()->role,
                ] : null,
            ],
        ]);
    }

    public function index(Request $request)
    {
        $query = Sale::with('shift')->orderBy('created_at', 'desc');

        if (auth()->check() && auth()->user()->role === 'karyawan') {
            $query->where('user_id', auth()->id());
        }

        if ($request->filled('month')) {
            $parts = explode('-', $request->month);
            if (count($parts) == 2) {
                $query->whereYear('tanggal', $parts[0])
                    ->whereMonth('tanggal', $parts[1]);
            }
        }

        if ($request->filled('shift_id')) {
            $query->where('shift_id', $request->shift_id);
        }

        // Clone query for analytics stats before pagination
        $statsQuery = clone $query;
        $totalOmset = $statsQuery->sum('omset_penjualan');
        $totalUntung = $statsQuery->sum('untung_bersih');

        $sales = $query->paginate(20)->withQueryString();
        $shifts = Shift::orderBy('nama_shift')->get();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'shifts' => $shifts,
            'filters' => $request->only(['month', 'shift_id']),
            'summary' => [
                'totalOmset' => $totalOmset,
                'totalUntung' => $totalUntung,
                'count' => $statsQuery->count(),
            ],
        ]);
    }

    public function create()
    {
        $shifts = Shift::orderBy('nama_shift')->get();
        $products = Product::orderBy('kategori')->get();
        $employees = Employee::orderBy('nama')->get();

        // Get current logged in employee for karyawan role
        $authEmployee = null;
        if (auth()->user()->role === 'karyawan') {
            $authEmployee = Employee::where('user_id', auth()->id())->first();
        }

        return Inertia::render('Sales/Create', [
            'shifts' => $shifts,
            'products' => $products,
            'employees' => $employees,
            'authEmployee' => $authEmployee,
        ]);
    }

    public function show(Sale $sale)
    {
        $sale->load(['shift', 'saleItems.product', 'user']);

        return Inertia::render('Sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tanggal' => 'required|date',
            'shift_id' => 'required|exists:shifts,id',
            'modal_awal' => 'required|numeric',
            'dana_keluar' => 'required|numeric',
            'dana_masuk' => 'required|numeric',
            'selisih_dana' => 'required|numeric',
            'omset_penjualan' => 'required|numeric',
            'is_karyawan_hadir' => 'boolean',
            'employee_id' => 'nullable|exists:employees,id',
            'gaji_karyawan' => 'required|numeric',
            'catatan' => 'nullable|string',
            'items' => 'array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($data) {
            // Validasi stok cukup
            if (isset($data['items'])) {
                foreach ($data['items'] as $item) {
                    if ($item['qty'] > 0) {
                        $product = Product::find($item['product_id']);
                        $currentStock = $product->stok ?? 0;

                        if ($item['qty'] > $currentStock) {
                            throw ValidationException::withMessages([
                                'items' => "Stok {$product->nama_produk} tidak mencukupi. Stok tersedia: {$currentStock}, diminta: {$item['qty']}",
                            ]);
                        }
                    }
                }
            }

            // Auto-set employee_id untuk role karyawan
            $employeeId = $data['employee_id'] ?? null;
            if (auth()->user()->role === 'karyawan') {
                $authEmployee = Employee::where('user_id', auth()->id())->first();
                if ($authEmployee) {
                    $employeeId = $authEmployee->id;
                }
            }

            $modalAwal   = (int) $data['modal_awal'];
            $danaMasuk   = (int) $data['dana_masuk'];
            $danaKeluar  = (int) $data['dana_keluar'];
            $gajiKaryawan = (int) $data['gaji_karyawan'];

            // Total Omset = Modal Awal + Dana Masuk - Dana Keluar
            $totalOmset = $modalAwal + $danaMasuk - $danaKeluar;
            // Untung Bersih = Dana Masuk - Modal Awal - Gaji Karyawan
            $untungBersih = $danaMasuk - $modalAwal - $gajiKaryawan;
            // Untung Bersih Tanpa Karyawan = Dana Masuk - Modal Awal
            $untungBersihTanpaKaryawan = $danaMasuk - $modalAwal;

            $sale = Sale::create([
                'user_id' => auth()->id(),
                'tanggal' => $data['tanggal'],
                'shift_id' => $data['shift_id'],
                'modal_awal' => $modalAwal,
                'cash' => 0,
                'qris' => 0,
                'dana_keluar' => $danaKeluar,
                'dana_masuk' => $danaMasuk,
                'selisih_dana' => $data['selisih_dana'],
                'omset_penjualan' => $totalOmset,
                'omset_bubuk' => 0,
                'omset_topping' => 0,
                'biaya_packaging' => 0,
                'is_karyawan_hadir' => $data['is_karyawan_hadir'] ?? false,
                'employee_id' => $employeeId,
                'gaji_karyawan' => $gajiKaryawan,
                'untung_kotor' => $untungBersihTanpaKaryawan,
                'untung_bersih' => $untungBersih,
                'untung_bersih_tanpa_karyawan' => $untungBersihTanpaKaryawan,
                'selisih_uang_penjualan' => 0,
                'catatan' => $data['catatan'],
            ]);

            if (isset($data['items'])) {
                foreach ($data['items'] as $item) {
                    if ($item['qty'] > 0) {
                        $product = Product::find($item['product_id']);

                        // Kurangi stok produk
                        $product->decrement('stok', $item['qty']);

                        SaleItem::create([
                            'sale_id' => $sale->id,
                            'product_id' => $item['product_id'],
                            'qty' => $item['qty'],
                            'harga_satuan' => $product->harga,
                            'subtotal' => $product->harga * $item['qty'],
                        ]);
                    }
                }
            }

            if (($data['is_karyawan_hadir'] ?? false) && ! empty($data['employee_id']) && $data['gaji_karyawan'] > 0) {
                EmployeeSalary::create([
                    'employee_id' => $data['employee_id'],
                    'tanggal' => $data['tanggal'],
                    'nominal_gaji' => $data['gaji_karyawan'],
                ]);
            }
        });

        return redirect()->route('sales.index');
    }
}
