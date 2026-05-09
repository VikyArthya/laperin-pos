<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change products.stok to decimal
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('stok', 8, 2)->change();
        });

        // Change laporan_pulang_items.qty_sisa and qty_bawa to decimal
        Schema::table('laporan_pulang_items', function (Blueprint $table) {
            $table->decimal('qty_sisa', 8, 2)->change();
            $table->decimal('qty_bawa', 8, 2)->change();
        });

        // Change sale_items.qty to decimal
        Schema::table('sale_items', function (Blueprint $table) {
            $table->decimal('qty', 8, 2)->change();
        });

        // Change materials.stok to decimal
        Schema::table('materials', function (Blueprint $table) {
            $table->decimal('stok', 8, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert products.stok to integer
        Schema::table('products', function (Blueprint $table) {
            $table->integer('stok')->change();
        });

        // Revert laporan_pulang_items.qty_sisa and qty_bawa to integer
        Schema::table('laporan_pulang_items', function (Blueprint $table) {
            $table->integer('qty_sisa')->change();
            $table->integer('qty_bawa')->change();
        });

        // Revert sale_items.qty to integer
        Schema::table('sale_items', function (Blueprint $table) {
            $table->integer('qty')->change();
        });

        // Revert materials.stok to integer
        Schema::table('materials', function (Blueprint $table) {
            $table->integer('stok')->change();
        });
    }
};
