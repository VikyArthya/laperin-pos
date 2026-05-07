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
        Schema::table('sales', function (Blueprint $table) {
            $table->integer('selisih_pembayaran')->default(0)->after('selisih_uang_penjualan')->comment('Selisih antara total pembayaran dengan total harga terjual (positif = lebih bayar, negatif = kurang bayar)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('selisih_pembayaran');
        });
    }
};
