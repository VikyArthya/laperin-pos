<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'stok' => 'float',
        'harga_beli' => 'integer',
        'harga' => 'integer',
    ];

    protected $fillable = [
        'nama_produk',
        'kategori', // Untuk backward compatibility
        'category_id',
        'harga_beli',
        'harga',
        'stok',
    ];

    // Accessor untuk mendapatkan nama kategori (backward compatible)
    public function getKategoriAttribute()
    {
        if ($this->category_id && $this->category) {
            return $this->category->nama_kategori;
        }

        return $this->attributes['kategori'] ?? null;
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
