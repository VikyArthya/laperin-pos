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
            $table->boolean('is_admin_mode')->default(false)->after('is_karyawan_hadir');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan_pulang', function (Blueprint $table) {
            $table->dropColumn('is_admin_mode');
        });
    }
};
