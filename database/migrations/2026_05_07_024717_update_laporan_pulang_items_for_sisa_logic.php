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
        // Rename qty_terjual to qty_sisa in laporan_pulang_items
        Schema::table('laporan_pulang_items', function (Blueprint $table) {
            $table->renameColumn('qty_terjual', 'qty_sisa');
        });

        // Add status column to laporan_pulang table
        Schema::table('laporan_pulang', function (Blueprint $table) {
            $table->enum('status', ['draft', 'submitted_by_admin', 'completed'])->default('draft')->after('catatan_stok');
        });

        // Add admin_id column to track who created the initial report
        Schema::table('laporan_pulang', function (Blueprint $table) {
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null')->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove admin_id column
        Schema::table('laporan_pulang', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->dropColumn('admin_id');
        });

        // Remove status column
        Schema::table('laporan_pulang', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        // Rename qty_sisa back to qty_terjual
        Schema::table('laporan_pulang_items', function (Blueprint $table) {
            $table->renameColumn('qty_sisa', 'qty_terjual');
        });
    }
};
