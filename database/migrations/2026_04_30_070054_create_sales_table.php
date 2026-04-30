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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('shift_id')->constrained('shifts')->cascadeOnDelete();
            
            $table->integer('modal_awal')->default(0);
            $table->integer('cash')->default(0);
            $table->integer('qris')->default(0);
            $table->integer('sf_out')->default(0);
            $table->integer('sf_in')->default(0);
            $table->integer('sf_selisih')->default(0);
            
            $table->integer('omset_penjualan')->default(0);
            $table->integer('omset_bubuk')->default(0);
            $table->integer('omset_topping')->default(0);
            $table->integer('biaya_packaging')->default(0);
            
            $table->boolean('is_karyawan_hadir')->default(false);
            $table->integer('gaji_karyawan')->default(0);
            
            $table->integer('untung_kotor')->default(0);
            $table->integer('untung_bersih')->default(0);
            $table->integer('untung_bersih_tanpa_karyawan')->default(0);
            $table->integer('selisih_uang_penjualan')->default(0);
            
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
