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
        Schema::table('laporan_pulang', function (Blueprint $table) {
            $table->json('stock_refill_items')->nullable()->after('catatan_stok');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan_pulang', function (Blueprint $table) {
            $table->dropColumn('stock_refill_items');
        });
    }
};
