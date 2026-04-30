<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\SaleController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\MaterialController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [SaleController::class, 'dashboard'])->name('dashboard');
    Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
    Route::resource('products', ProductController::class)->except(['create', 'show', 'edit']);
    Route::resource('shifts', ShiftController::class)->except(['create', 'show', 'edit']);
    Route::resource('materials', MaterialController::class)->except(['create', 'show', 'edit']);
});

require __DIR__.'/settings.php';
