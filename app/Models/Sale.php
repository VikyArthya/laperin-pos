<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $guarded = ['id'];

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

    public function laporanPulang()
    {
        return $this->belongsTo(LaporanPulang::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }
}
