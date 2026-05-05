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
            $table->renameColumn('sf_in', 'dana_masuk');
            $table->renameColumn('sf_out', 'dana_keluar');
            $table->renameColumn('sf_selisih', 'selisih_dana');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->renameColumn('dana_masuk', 'sf_in');
            $table->renameColumn('dana_keluar', 'sf_out');
            $table->renameColumn('selisih_dana', 'sf_selisih');
        });
    }
};
