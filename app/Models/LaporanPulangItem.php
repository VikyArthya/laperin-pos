<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanPulangItem extends Model
{
    protected $table = 'laporan_pulang_items';

    protected $guarded = ['id'];

    protected $casts = [
        'qty_sisa' => 'float',
        'qty_bawa' => 'float',
    ];

    public function laporanPulang()
    {
        return $this->belongsTo(LaporanPulang::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
