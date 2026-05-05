<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
            ]
        );

        // ExcelDataSeeder di-comment untuk fresh install tanpa data Excel
        // $this->call([
        //     ExcelDataSeeder::class
        // ]);
    }
}
