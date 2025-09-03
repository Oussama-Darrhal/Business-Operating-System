<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class BasicRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing roles and their permissions
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \DB::table('role_permissions')->truncate();
        \DB::table('roles')->truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $allModules = Permission::pluck('module_id')->toArray();

        // Super Admin Role - Full access to everything
        $superAdminRole = Role::create([
            'sme_id' => null,
            'name' => 'Super Admin',
            'description' => 'Full system access with all permissions',
            'color' => 'purple',
            'is_custom' => false,
        ]);

        // Give Super Admin full permissions to all modules
        $superAdminPermissions = [];
        foreach ($allModules as $moduleId) {
            $superAdminPermissions[$moduleId] = ['view', 'create', 'edit', 'delete'];
        }
        $superAdminRole->syncPermissions($superAdminPermissions);

        // Manager Role - Management level access
        $managerRole = Role::create([
            'sme_id' => null,
            'name' => 'Manager',
            'description' => 'Management level access with most permissions',
            'color' => 'blue',
            'is_custom' => false,
        ]);

        $managerPermissions = [
            'dashboard' => ['view'],
            'analytics' => ['view'],
            'reviews' => ['view', 'edit'],
            'complaints' => ['view', 'create', 'edit'],
            'ai-analysis' => ['view'],
            'response-management' => ['view', 'create', 'edit'],
            'products' => ['view', 'create', 'edit'],
            'stock' => ['view', 'edit'],
            'categories' => ['view', 'create', 'edit'],
            'warehouses' => ['view'],
            'users' => ['view'],
            'company-profile' => ['view', 'edit'],
            'activity-logs' => ['view'],
        ];
        $managerRole->syncPermissions($managerPermissions);

        // Employee Role - Standard employee access
        $employeeRole = Role::create([
            'sme_id' => null,
            'name' => 'Employee',
            'description' => 'Standard employee access with basic permissions',
            'color' => 'green',
            'is_custom' => false,
        ]);

        $employeePermissions = [
            'dashboard' => ['view'],
            'reviews' => ['view'],
            'complaints' => ['view', 'create'],
            'response-management' => ['view', 'create'],
            'products' => ['view'],
            'stock' => ['view'],
            'categories' => ['view'],
        ];
        $employeeRole->syncPermissions($employeePermissions);

        // Viewer Role - Read-only access
        $viewerRole = Role::create([
            'sme_id' => null,
            'name' => 'Viewer',
            'description' => 'Read-only access to basic modules',
            'color' => 'gray',
            'is_custom' => false,
        ]);

        $viewerPermissions = [
            'dashboard' => ['view'],
            'reviews' => ['view'],
            'products' => ['view'],
        ];
        $viewerRole->syncPermissions($viewerPermissions);
    }
}
