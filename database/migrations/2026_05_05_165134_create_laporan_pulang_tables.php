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
        // Main table for laporan pulang
        Schema::create('laporan_pulang', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('shift_id')->constrained('shifts')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('employee_id')->nullable()->constrained('employees')->onDelete('set null');

            // Payment methods
            $table->integer('cash')->default(0);
            $table->integer('qris')->default(0);
            $table->integer('sf')->default(0);
            $table->integer('total_pembayaran')->default(0);
            $table->string('ma_50')->nullable(); // Ma 50 (special field)

            // Stock notes
            $table->text('catatan_stok')->nullable();

            $table->timestamps();
        });

        // Items table for laporan pulang
        Schema::create('laporan_pulang_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laporan_pulang_id')->constrained('laporan_pulang')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('qty_terjual')->default(0);
            $table->integer('qty_bawa')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_pulang_items');
        Schema::dropIfExists('laporan_pulang');
    }
};
