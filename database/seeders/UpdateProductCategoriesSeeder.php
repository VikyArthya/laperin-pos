<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class UpdateProductCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua kategori yang sudah ada
        $categories = Category::all()->keyBy('nama_kategori');

        $updatedCount = 0;

        // Update products yang sudah ada
        Product::whereNull('category_id')->chunk(100, function ($products) use ($categories, &$updatedCount) {
            foreach ($products as $product) {
                if (! empty($product->kategori) && isset($categories[$product->kategori])) {
                    $product->update([
                        'category_id' => $categories[$product->kategori]->id,
                    ]);
                    $updatedCount++;
                }
            }
        });

        $this->command->info("Updated {$updatedCount} products with category_id.");
    }
}
