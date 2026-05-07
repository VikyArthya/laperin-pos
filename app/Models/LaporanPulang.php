<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanPulang extends Model
{
    protected $table = 'laporan_pulang';

    protected $fillable = [
        'tanggal',
        'shift_id',
        'user_id',
        'admin_id',
        'employee_id',
        'cash',
        'qris',
        'sf',
        'total_pembayaran',
        'dana_keluar',
        'catatan_dana_keluar',
        'ma_50',
        'catatan_stok',
        'stock_refill_items',
        'status',
    ];

    protected $casts = [
        'stock_refill_items' => 'array',
        'status' => 'string',
        'tanggal' => 'date:Y-m-d', // Explicit format untuk avoid timezone issues
    ];

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function items()
    {
        return $this->hasMany(LaporanPulangItem::class);
    }

    public function scopeAvailableForEmployees($query)
    {
        return $query->where('status', 'submitted_by_admin');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isSubmittedByAdmin()
    {
        return $this->status === 'submitted_by_admin';
    }
}
