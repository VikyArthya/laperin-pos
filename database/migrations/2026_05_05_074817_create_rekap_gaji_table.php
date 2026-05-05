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
        Schema::create('rekap_gaji', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->nullable(false)->comment('Tanggal rekap');
            $table->integer('omset_harian')->nullable(false)->default(0)->comment('Omset harian');
            $table->integer('gaji_dasar')->nullable(false)->default(0)->comment('Gaji dasar perhitungan 20%');
            $table->integer('gaji_persen')->nullable(false)->default(0)->comment('Komisi tambahan 1jt omset');
            $table->integer('gaji_total')->nullable(false)->default(0)->comment('Total gaji (dasar + persen)');
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->index(['tanggal']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekap_gaji');
    }
};
