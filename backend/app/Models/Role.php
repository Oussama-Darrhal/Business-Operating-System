<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'sme_id',
        'name',
        'description',
        'color',
        'is_custom',
    ];

    protected $casts = [
        'is_custom' => 'boolean',
    ];

    protected $appends = ['user_count'];

    /**
     * Get the SME that owns the role.
     */
    public function sme(): BelongsTo
    {
        return $this->belongsTo(SME::class);
    }

    /**
     * Get the users with this role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the role permissions.
     */
    public function rolePermissions(): HasMany
    {
        return $this->hasMany(RolePermission::class);
    }

    /**
     * Get the permissions through role permissions.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'module_id', 'id', 'module_id')
                    ->withPivot('permissions')
                    ->withTimestamps();
    }

    /**
     * Get the user count attribute.
     */
    public function getUserCountAttribute(): int
    {
        return $this->users()->count();
    }

    /**
     * Get formatted permissions for the role.
     */
    public function getFormattedPermissions(): array
    {
        return $this->rolePermissions()
            ->with('permission')
            ->get()
            ->map(function ($rolePermission) {
                return [
                    'module_id' => $rolePermission->module_id,
                    'module_name' => $rolePermission->permission->module_name ?? $rolePermission->module_id,
                    'permissions' => $rolePermission->permissions,
                ];
            })
            ->toArray();
    }

    /**
     * Sync permissions for the role.
     */
    public function syncPermissions(array $permissions): void
    {
        // Delete existing permissions
        $this->rolePermissions()->delete();

        // Create new permissions
        foreach ($permissions as $moduleId => $permissionTypes) {
            if (!empty($permissionTypes)) {
                $this->rolePermissions()->create([
                    'module_id' => $moduleId,
                    'permissions' => $permissionTypes,
                ]);
            }
        }
    }

    /**
     * Check if role has specific permission for a module.
     */
    public function hasPermission(string $moduleId, string $permission): bool
    {
        $rolePermission = $this->rolePermissions()
            ->where('module_id', $moduleId)
            ->first();

        if (!$rolePermission) {
            return false;
        }

        return in_array($permission, $rolePermission->permissions);
    }

    /**
     * Get all permissions for a module.
     */
    public function getModulePermissions(string $moduleId): array
    {
        $rolePermission = $this->rolePermissions()
            ->where('module_id', $moduleId)
            ->first();

        return $rolePermission ? $rolePermission->permissions : [];
    }
}
