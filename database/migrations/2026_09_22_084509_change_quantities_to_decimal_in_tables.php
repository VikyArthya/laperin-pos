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
        Schema::table('laporan_pulang_items', function (Blueprint $table) {
            $table->decimal('qty_bawa', 10, 2)->default(0)->change();
            $table->decimal('qty_sisa', 10, 2)->default(0)->change();
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->decimal('qty', 10, 2)->default(0)->change();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->decimal('stok', 10, 2)->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->integer('stok')->default(0)->change();
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->integer('qty')->default(0)->change();
        });

        Schema::table('laporan_pulang_items', function (Blueprint $table) {
            $table->integer('qty_sisa')->default(0)->change();
            $table->integer('qty_bawa')->default(0)->change();
        });
    }
};
