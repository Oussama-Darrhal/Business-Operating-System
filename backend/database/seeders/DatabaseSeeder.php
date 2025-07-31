<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Review Sources
        $reviewSources = [
            ['name' => 'Google Reviews', 'is_active' => true],
            ['name' => 'Facebook Reviews', 'is_active' => true],
            ['name' => 'Yelp', 'is_active' => true],
            ['name' => 'Amazon Reviews', 'is_active' => true],
            ['name' => 'Trustpilot', 'is_active' => true],
            ['name' => 'Manual Entry', 'is_active' => true],
            ['name' => 'Email Feedback', 'is_active' => true],
            ['name' => 'In-App Feedback', 'is_active' => true],
        ];

        foreach ($reviewSources as $source) {
            DB::table('review_sources')->insertOrIgnore([
                'name' => $source['name'],
                'is_active' => $source['is_active'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed Global Product Categories
        $categories = [
            ['name' => 'Electronics', 'description' => 'Electronic devices and accessories', 'level' => 0],
            ['name' => 'Clothing & Fashion', 'description' => 'Apparel and fashion items', 'level' => 0],
            ['name' => 'Food & Beverages', 'description' => 'Consumable food and drink products', 'level' => 0],
            ['name' => 'Health & Beauty', 'description' => 'Health and personal care products', 'level' => 0],
            ['name' => 'Home & Garden', 'description' => 'Household and outdoor items', 'level' => 0],
            ['name' => 'Sports & Recreation', 'description' => 'Sports equipment and recreational items', 'level' => 0],
            ['name' => 'Automotive', 'description' => 'Vehicle parts and accessories', 'level' => 0],
            ['name' => 'Books & Media', 'description' => 'Publications and media content', 'level' => 0],
        ];

        foreach ($categories as $category) {
            DB::table('global_product_categories')->insertOrIgnore([
                'name' => $category['name'],
                'description' => $category['description'],
                'level' => $category['level'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
