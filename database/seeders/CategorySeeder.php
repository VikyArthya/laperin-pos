<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'nama_kategori' => 'Menu Utama',
                'kode' => 'MENU',
                'deskripsi' => 'Kategori untuk menu utama produk',
                'is_active' => true,
            ],
            [
                'nama_kategori' => 'Topping',
                'kode' => 'TOP',
                'deskripsi' => 'Kategori untuk topping tambahan',
                'is_active' => true,
            ],
            [
                'nama_kategori' => 'Packaging',
                'kode' => 'PKG',
                'deskripsi' => 'Kategori untuk kemasan/packaging',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
