<?php

use App\Http\Controllers\SaleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PayrollController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [SaleController::class, 'dashboard'])->name('dashboard');
    Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('sales/create', [SaleController::class, 'create'])->name('sales.create');
    Route::post('sales', [SaleController::class, 'store'])->name('sales.store');
    Route::get('sales/{sale}', [SaleController::class, 'show'])->name('sales.show');

    // Admin Only Routes
    Route::middleware(['admin'])->group(function () {
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        Route::resource('products', ProductController::class)->except(['create', 'show', 'edit']);
        Route::resource('shifts', ShiftController::class)->except(['create', 'show', 'edit']);
        Route::resource('materials', MaterialController::class)->except(['create', 'show', 'edit']);
        Route::resource('employees', EmployeeController::class)->except(['create', 'show', 'edit']);
        Route::get('payroll', [PayrollController::class, 'index'])->name('payroll.index');

        // Stock adjustment routes
        Route::post('materials/{material}/add-stock', [MaterialController::class, 'addStock'])->name('materials.add-stock');
        Route::post('materials/{material}/reduce-stock', [MaterialController::class, 'reduceStock'])->name('materials.reduce-stock');
        Route::post('products/{product}/add-stock', [ProductController::class, 'addStock'])->name('products.add-stock');
        Route::post('products/{product}/reduce-stock', [ProductController::class, 'reduceStock'])->name('products.reduce-stock');
    });
});

require __DIR__.'/settings.php';
