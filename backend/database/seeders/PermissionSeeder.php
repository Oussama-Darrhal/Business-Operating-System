<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            // Core Modules
            [
                'module_id' => 'dashboard',
                'module_name' => 'Dashboard',
                'module_description' => 'Main dashboard and overview',
                'category' => 'Core',
            ],
            [
                'module_id' => 'analytics',
                'module_name' => 'Analytics',
                'module_description' => 'Business analytics and reports',
                'category' => 'Core',
            ],

            // Customer Feedback Modules
            [
                'module_id' => 'reviews',
                'module_name' => 'Customer Reviews',
                'module_description' => 'View and manage customer reviews',
                'category' => 'Customer Feedback',
            ],
            [
                'module_id' => 'complaints',
                'module_name' => 'Complaints',
                'module_description' => 'Handle customer complaints',
                'category' => 'Customer Feedback',
            ],
            [
                'module_id' => 'ai-analysis',
                'module_name' => 'AI Analysis',
                'module_description' => 'AI-powered feedback analysis',
                'category' => 'Customer Feedback',
            ],
            [
                'module_id' => 'response-management',
                'module_name' => 'Response Management',
                'module_description' => 'Manage responses to feedback',
                'category' => 'Customer Feedback',
            ],

            // Inventory Management Modules
            [
                'module_id' => 'products',
                'module_name' => 'Products',
                'module_description' => 'Manage product catalog',
                'category' => 'Inventory',
            ],
            [
                'module_id' => 'stock',
                'module_name' => 'Stock Management',
                'module_description' => 'Monitor and manage inventory levels',
                'category' => 'Inventory',
            ],
            [
                'module_id' => 'categories',
                'module_name' => 'Categories',
                'module_description' => 'Organize product categories',
                'category' => 'Inventory',
            ],
            [
                'module_id' => 'warehouses',
                'module_name' => 'Warehouses',
                'module_description' => 'Manage warehouse locations',
                'category' => 'Inventory',
            ],

            // System & Admin Modules
            [
                'module_id' => 'users',
                'module_name' => 'Users Management',
                'module_description' => 'Manage team members and access',
                'category' => 'System & Admin',
            ],
            [
                'module_id' => 'roles',
                'module_name' => 'Role Management',
                'module_description' => 'Configure roles and permissions',
                'category' => 'System & Admin',
            ],
            [
                'module_id' => 'company-profile',
                'module_name' => 'Company Profile',
                'module_description' => 'Manage company information',
                'category' => 'System & Admin',
            ],
            [
                'module_id' => 'settings',
                'module_name' => 'Settings',
                'module_description' => 'System configuration and preferences',
                'category' => 'System & Admin',
            ],
            [
                'module_id' => 'activity-logs',
                'module_name' => 'Activity Logs',
                'module_description' => 'View system activity and audit trails',
                'category' => 'System & Admin',
            ],
        ];

        foreach ($modules as $module) {
            Permission::updateOrCreate(
                ['module_id' => $module['module_id']],
                $module
            );
        }
    }
}
