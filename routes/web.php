<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\SaleController;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\UserController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [SaleController::class, 'dashboard'])->name('dashboard');
    Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('sales/create', [SaleController::class, 'create'])->name('sales.create');
    Route::post('sales', [SaleController::class, 'store'])->name('sales.store');
    
    // Admin Only Routes
    Route::middleware(['admin'])->group(function () {
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        Route::resource('products', ProductController::class)->except(['create', 'show', 'edit']);
        Route::resource('shifts', ShiftController::class)->except(['create', 'show', 'edit']);
        Route::resource('materials', MaterialController::class)->except(['create', 'show', 'edit']);
        Route::resource('employees', EmployeeController::class)->except(['create', 'show', 'edit']);
    });
});

require __DIR__.'/settings.php';
