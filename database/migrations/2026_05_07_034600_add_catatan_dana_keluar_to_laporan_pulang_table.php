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
            $table->text('catatan_dana_keluar')->nullable()->after('dana_keluar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan_pulang', function (Blueprint $table) {
            $table->dropColumn('catatan_dana_keluar');
        });
    }
};
