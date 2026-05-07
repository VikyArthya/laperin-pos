<?php

use App\Http\Controllers\SaleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/dashboard');
})->name('home');

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LaporanPulangController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\UserController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [SaleController::class, 'dashboard'])->name('dashboard');

    // Laporan Pulang Routes
    Route::get('laporan-pulang', [LaporanPulangController::class, 'index'])->name('laporan-pulang.index');
    Route::get('laporan-pulang/create', [LaporanPulangController::class, 'create'])->name('laporan-pulang.create');
    Route::post('laporan-pulang', [LaporanPulangController::class, 'store'])->name('laporan-pulang.store');
    Route::get('laporan-pulang/{laporanPulang}', [LaporanPulangController::class, 'show'])->name('laporan-pulang.show');
    Route::get('laporan-pulang/{laporanPulang}/edit', [LaporanPulangController::class, 'edit'])->name('laporan-pulang.edit');
    Route::put('laporan-pulang/{laporanPulang}', [LaporanPulangController::class, 'update'])->name('laporan-pulang.update');
    Route::delete('laporan-pulang/{laporanPulang}', [LaporanPulangController::class, 'destroy'])->name('laporan-pulang.destroy');

    // Admin Only Routes
    Route::middleware(['admin'])->group(function () {
        Route::get('sales/export', [SaleController::class, 'export'])->name('sales.export');
        Route::resource('sales', SaleController::class);
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        Route::resource('categories', CategoryController::class);
        Route::resource('products', ProductController::class)->except(['create', 'show', 'edit']);
        Route::resource('shifts', ShiftController::class)->except(['create', 'show', 'edit']);
        Route::resource('materials', MaterialController::class)->except(['create', 'show', 'edit']);
        Route::resource('employees', EmployeeController::class)->except(['create', 'show', 'edit']);
        Route::get('payroll', [PayrollController::class, 'index'])->name('payroll.index');

        // Stock adjustment routes
        Route::post('products/{product}/add-stock', [ProductController::class, 'addStock'])->name('products.add-stock');
        Route::post('products/{product}/reduce-stock', [ProductController::class, 'reduceStock'])->name('products.reduce-stock');
    });
});

require __DIR__.'/settings.php';
