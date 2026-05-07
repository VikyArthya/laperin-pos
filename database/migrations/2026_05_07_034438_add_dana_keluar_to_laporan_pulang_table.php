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
            $table->integer('dana_keluar')->default(0)->after('total_pembayaran');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan_pulang', function (Blueprint $table) {
            $table->dropColumn('dana_keluar');
        });
    }
};
