<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanPulang extends Model
{
    protected $table = 'laporan_pulang';

    protected $guarded = ['id'];

    protected $casts = [
        'tanggal' => 'date',
        'stock_refill_items' => 'array',
    ];

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function items()
    {
        return $this->hasMany(LaporanPulangItem::class);
    }
}
