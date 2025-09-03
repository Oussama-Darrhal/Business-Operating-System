<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'role_id',
        'module_id',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    /**
     * Get the role that owns the permission.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the permission module.
     */
    public function permission(): BelongsTo
    {
        return $this->belongsTo(Permission::class, 'module_id', 'module_id');
    }

    /**
     * Check if this role permission includes a specific permission type.
     */
    public function hasPermissionType(string $permissionType): bool
    {
        return in_array($permissionType, $this->permissions ?? []);
    }

    /**
     * Add a permission type to this role permission.
     */
    public function addPermissionType(string $permissionType): void
    {
        $permissions = $this->permissions ?? [];
        if (!in_array($permissionType, $permissions)) {
            $permissions[] = $permissionType;
            $this->permissions = $permissions;
            $this->save();
        }
    }

    /**
     * Remove a permission type from this role permission.
     */
    public function removePermissionType(string $permissionType): void
    {
        $permissions = $this->permissions ?? [];
        $this->permissions = array_values(array_filter($permissions, function ($type) use ($permissionType) {
            return $type !== $permissionType;
        }));
        $this->save();
    }
}
