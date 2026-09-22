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
            $table->integer('modal_harian')->default(0)->after('total_pembayaran');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->integer('modal_harian')->default(0)->after('modal_awal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan_pulang', function (Blueprint $table) {
            $table->dropColumn('modal_harian');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('modal_harian');
        });
    }
};
