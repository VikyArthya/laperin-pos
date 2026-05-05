<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\Shift;
use App\Models\Employee;
use App\Models\EmployeeSalary;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function dashboard()
    {
        // Data untuk dashboard
        $recentSales = Sale::with('shift')
            ->orderBy('tanggal', 'desc')
            ->take(5)
            ->get();
            
        $totalOmset = Sale::sum('omset_penjualan');
        $totalUntung = Sale::sum('untung_bersih');
        
        $currentMonthSales = Sale::whereMonth('tanggal', date('m'))->sum('omset_penjualan');
        
        return Inertia::render('dashboard', [
            'recentSales' => $recentSales,
            'stats' => [
                'totalOmset' => $totalOmset,
                'totalUntung' => $totalUntung,
                'currentMonthSales' => $currentMonthSales,
                'totalData' => Sale::count()
            ]
        ]);
    }

    public function index(Request $request)
    {
        $query = Sale::with('shift')->orderBy('tanggal', 'desc');

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
                'count' => $statsQuery->count()
            ]
        ]);
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

    public function store(Request $request)
    {
        $data = $request->validate([
            'tanggal' => 'required|date',
            'shift_id' => 'required|exists:shifts,id',
            'modal_awal' => 'required|numeric',
            'cash' => 'required|numeric',
            'qris' => 'required|numeric',
            'sf_out' => 'required|numeric',
            'sf_in' => 'required|numeric',
            'sf_selisih' => 'required|numeric',
            'omset_penjualan' => 'required|numeric',
            'omset_bubuk' => 'required|numeric',
            'omset_topping' => 'required|numeric',
            'biaya_packaging' => 'required|numeric',
            'is_karyawan_hadir' => 'boolean',
            'employee_id' => 'nullable|exists:employees,id',
            'gaji_karyawan' => 'required|numeric',
            'untung_kotor' => 'required|numeric',
            'untung_bersih' => 'required|numeric',
            'untung_bersih_tanpa_karyawan' => 'required|numeric',
            'selisih_uang_penjualan' => 'required|numeric',
            'catatan' => 'nullable|string',
            'items' => 'array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:0',
        ]);

        DB::transaction(function() use ($data) {
            $sale = Sale::create([
                'tanggal' => $data['tanggal'],
                'shift_id' => $data['shift_id'],
                'modal_awal' => $data['modal_awal'],
                'cash' => $data['cash'],
                'qris' => $data['qris'],
                'sf_out' => $data['sf_out'],
                'sf_in' => $data['sf_in'],
                'sf_selisih' => $data['sf_selisih'],
                'omset_penjualan' => $data['omset_penjualan'],
                'omset_bubuk' => $data['omset_bubuk'],
                'omset_topping' => $data['omset_topping'],
                'biaya_packaging' => $data['biaya_packaging'],
                'is_karyawan_hadir' => $data['is_karyawan_hadir'] ?? false,
                'gaji_karyawan' => $data['gaji_karyawan'],
                'untung_kotor' => $data['untung_kotor'],
                'untung_bersih' => $data['untung_bersih'],
                'untung_bersih_tanpa_karyawan' => $data['untung_bersih_tanpa_karyawan'],
                'selisih_uang_penjualan' => $data['selisih_uang_penjualan'],
                'catatan' => $data['catatan'],
            ]);

            if (isset($data['items'])) {
                foreach ($data['items'] as $item) {
                    if ($item['qty'] > 0) {
                        $product = Product::find($item['product_id']);
                        SaleItem::create([
                            'sale_id' => $sale->id,
                            'product_id' => $item['product_id'],
                            'qty' => $item['qty'],
                            'harga_satuan' => $product->harga,
                            'subtotal' => $product->harga * $item['qty']
                        ]);
                    }
                }
            }

            if (($data['is_karyawan_hadir'] ?? false) && !empty($data['employee_id']) && $data['gaji_karyawan'] > 0) {
                EmployeeSalary::create([
                    'employee_id' => $data['employee_id'],
                    'tanggal' => $data['tanggal'],
                    'nominal_gaji' => $data['gaji_karyawan']
                ]);
            }
        });

        return redirect()->route('sales.index');
    }
}
