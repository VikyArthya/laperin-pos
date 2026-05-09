<?php

namespace App\Http\Controllers;

use App\Exports\SalesExport;
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
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SaleController extends Controller
{
    public function dashboard()
    {
        $baseQuery = Sale::query();

        // Karyawan hanya bisa melihat sales miliknya sendiri berdasarkan employee_id
        if (auth()->check() && auth()->user()->role === 'karyawan') {
            $authEmployee = Employee::where('user_id', auth()->id())->first();
            if ($authEmployee) {
                $baseQuery->where('employee_id', $authEmployee->id);
            } else {
                // Jika tidak ada employee terkait, return empty query
                $baseQuery->where('employee_id', 0);
            }
        }

        $totalOmset = (clone $baseQuery)->sum('omset_penjualan');
        $totalUntung = (clone $baseQuery)->selectRaw('SUM(untung_bersih + selisih_pembayaran) as total')->value('total') ?? 0;

        // Sembunyikan untung jika role karyawan
        if (auth()->check() && auth()->user()->role === 'karyawan') {
            $totalUntung = 0;
        }

        $currentMonthSales = (clone $baseQuery)->whereMonth('tanggal', date('m'))
            ->whereYear('tanggal', date('Y'))
            ->sum('omset_penjualan');

        $monthlySalesRaw = (clone $baseQuery)->selectRaw('MONTH(tanggal) as month, SUM(omset_penjualan) as omset, SUM(untung_bersih + selisih_pembayaran) as untung')
            ->whereYear('tanggal', date('Y'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $yearlySalesRaw = (clone $baseQuery)->selectRaw('YEAR(tanggal) as year, SUM(omset_penjualan) as omset, SUM(untung_bersih + selisih_pembayaran) as untung')
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
                'untung' => (auth()->user()->role === 'admin') ? ($data ? (int) $data->untung : 0) : 0,
            ];
        }

        $yearlySales = $yearlySalesRaw->map(function ($item) {
            return [
                'name' => (string) $item->year,
                'omset' => (int) $item->omset,
                'untung' => (auth()->user()->role === 'admin') ? (int) $item->untung : 0,
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
        $query = Sale::with(['shift', 'laporanPulang.items.product'])->orderBy('created_at', 'desc');

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
        $totalUntung = $statsQuery->selectRaw('SUM(untung_bersih + selisih_pembayaran) as total')->value('total') ?? 0;

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

    public function export(Request $request): BinaryFileResponse
    {
        $filters = $request->only(['month', 'shift_id']);

        $filename = 'laporan-penjualan-';
        if (! empty($filters['month'])) {
            $filename .= $filters['month'].'-';
        }
        if (! empty($filters['shift_id'])) {
            $filename .= 'shift-'.$filters['shift_id'].'-';
        }
        $filename .= now()->format('Y-m-d-His').'.xlsx';

        return Excel::download(new SalesExport($filters), $filename);
    }

    public function create()
    {
        $shifts = Shift::orderBy('nama_shift')->get();
        $products = Product::orderBy('kategori')->get();
        $employees = Employee::orderBy('nama')->get();

        return Inertia::render('Sales/Create', [
            'shifts' => $shifts,
            'products' => $products,
            'employees' => $employees,
        ]);
    }

    public function show(Sale $sale)
    {
        $sale->load(['shift', 'saleItems.product', 'user', 'laporanPulang.items.product']);

        return Inertia::render('Sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function edit(Sale $sale)
    {
        $sale->load(['saleItems.product']);
        $shifts = Shift::orderBy('nama_shift')->get();
        $products = Product::orderBy('kategori')->get();
        $employees = Employee::orderBy('nama')->get();

        return Inertia::render('Sales/Edit', [
            'sale' => $sale,
            'shifts' => $shifts,
            'products' => $products,
            'employees' => $employees,
        ]);
    }

    public function update(Request $request, Sale $sale)
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
            'is_admin_mode' => 'boolean',
            'employee_id' => 'nullable|exists:employees,id',
            'gaji_karyawan' => 'required|numeric',
            'catatan' => 'nullable|string',
            'cash' => 'nullable|numeric',
            'qris' => 'nullable|numeric',
            'sf' => 'nullable|numeric',
            'items' => 'array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($data, $sale) {
            // Restore old stock
            foreach ($sale->saleItems as $oldItem) {
                $product = Product::find($oldItem->product_id);
                if ($product) {
                    $product->increment('stok', $oldItem->qty);
                }
            }

            // Delete old items
            $sale->saleItems()->delete();

            // Update sale
            $modalAwal = (int) $data['modal_awal'];
            $danaMasuk = (int) $data['dana_masuk'];
            $danaKeluar = (int) $data['dana_keluar'];
            $gajiKaryawan = (int) $data['gaji_karyawan'];
            $cash = (int) ($data['cash'] ?? 0);
            $qris = (int) ($data['qris'] ?? 0);
            $sf = (int) ($data['sf'] ?? 0);
            $isAdminMode = (bool) ($data['is_admin_mode'] ?? false);

            // Untung Bersih = Omset Penjualan - Gaji Karyawan - Modal Awal
            // Jika Admin Mode, gaji karyawan tidak dikurangkan
            $potonganGaji = $isAdminMode ? 0 : $gajiKaryawan;
            $untungBersih = $danaMasuk - $potonganGaji - $modalAwal;
            $untungBersihTanpaKaryawan = $danaMasuk - $modalAwal;

            $sale->update([
                'tanggal' => $data['tanggal'],
                'shift_id' => $data['shift_id'],
                'modal_awal' => $modalAwal,
                'cash' => $cash,
                'qris' => $qris,
                'sf' => $sf,
                'dana_keluar' => $danaKeluar,
                'dana_masuk' => $danaMasuk,
                'selisih_dana' => $data['selisih_dana'],
                'omset_penjualan' => $danaMasuk,
                'is_karyawan_hadir' => $data['is_karyawan_hadir'] ?? false,
                'is_admin_mode' => $isAdminMode,
                'employee_id' => $data['employee_id'],
                'gaji_karyawan' => $gajiKaryawan,
                'untung_kotor' => $untungBersihTanpaKaryawan,
                'untung_bersih' => $untungBersih,
                'untung_bersih_tanpa_karyawan' => $untungBersihTanpaKaryawan,
                'catatan' => $data['catatan'],
            ]);

            // Add new items and reduce stock
            if (isset($data['items'])) {
                foreach ($data['items'] as $item) {
                    if ($item['qty'] > 0) {
                        $product = Product::find($item['product_id']);
                        if ($product) {
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
            }

            // Handle salary update
            EmployeeSalary::where('employee_id', $sale->getOriginal('employee_id'))
                ->where('tanggal', $sale->getOriginal('tanggal'))
                ->where('nominal_gaji', $sale->getOriginal('gaji_karyawan'))
                ->delete();

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

    public function destroy(Sale $sale)
    {
        DB::transaction(function () use ($sale) {
            // Restore stock
            foreach ($sale->saleItems as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->increment('stok', $item->qty);
                }
            }

            // Delete salary record
            EmployeeSalary::where('employee_id', $sale->employee_id)
                ->where('tanggal', $sale->tanggal)
                ->where('nominal_gaji', $sale->gaji_karyawan)
                ->delete();

            $sale->delete();
        });

        return redirect()->route('sales.index');
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
            'is_admin_mode' => 'boolean',
            'employee_id' => 'nullable|exists:employees,id',
            'gaji_karyawan' => 'required|numeric',
            'catatan' => 'nullable|string',
            'cash' => 'nullable|numeric',
            'qris' => 'nullable|numeric',
            'sf' => 'nullable|numeric',
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

            $modalAwal = (int) ($data['modal_awal'] ?? 0);
            $danaMasuk = (int) ($data['dana_masuk'] ?? 0);
            $danaKeluar = (int) ($data['dana_keluar'] ?? 0);
            $gajiKaryawan = (int) ($data['gaji_karyawan'] ?? 0);
            $cash = (int) ($data['cash'] ?? 0);
            $qris = (int) ($data['qris'] ?? 0);
            $sf = (int) ($data['sf'] ?? 0);
            $isAdminMode = (bool) ($data['is_admin_mode'] ?? false);

            // Total Omset = Dana Masuk
            $totalOmset = $danaMasuk;
            // Untung Bersih = Omset Penjualan - Gaji Karyawan - Modal Awal
            // Jika Admin Mode, gaji karyawan tidak dikurangkan
            $potonganGaji = $isAdminMode ? 0 : $gajiKaryawan;
            $untungBersih = $danaMasuk - $potonganGaji - $modalAwal;
            $untungBersihTanpaKaryawan = $danaMasuk - $modalAwal;

            $sale = Sale::create([
                'user_id' => auth()->id(),
                'tanggal' => $data['tanggal'],
                'shift_id' => $data['shift_id'],
                'modal_awal' => $modalAwal,
                'cash' => $cash,
                'qris' => $qris,
                'sf' => $sf,
                'dana_keluar' => $danaKeluar,
                'dana_masuk' => $danaMasuk,
                'selisih_dana' => $data['selisih_dana'],
                'omset_penjualan' => $totalOmset,
                'omset_bubuk' => 0,
                'omset_topping' => 0,
                'biaya_packaging' => 0,
                'is_karyawan_hadir' => $data['is_karyawan_hadir'] ?? false,
                'is_admin_mode' => $isAdminMode,
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
