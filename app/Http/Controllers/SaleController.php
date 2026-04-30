<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Inertia\Inertia;
use Illuminate\Http\Request;

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
        
        // Coba hitung omset bulan ini vs bulan lalu untuk persentase (sederhana)
        // Karena ini demo, kita pasang data dummy persentase, atau kita ambil dari DB
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

    public function index()
    {
        // Ambil data sales beserta nama shift, urutkan dari yang terbaru, lalu pagination 10 data per halaman
        $sales = Sale::with('shift')
            ->orderBy('tanggal', 'desc')
            ->paginate(10);
            
        // Lempar data ke komponen React: "resources/js/Pages/Sales/Index.jsx"
        return Inertia::render('Sales/Index', [
            'sales' => $sales
        ]);
    }
}
