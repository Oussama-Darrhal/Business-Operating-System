<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'module_name',
        'module_description',
        'category',
    ];

    protected $primaryKey = 'module_id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Get the roles that have this permission.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permissions', 'module_id', 'role_id', 'module_id', 'id')
                    ->withPivot('permissions')
                    ->withTimestamps();
    }

    /**
     * Get the role permissions for this module.
     */
    public function rolePermissions(): HasMany
    {
        return $this->hasMany(RolePermission::class, 'module_id', 'module_id');
    }

    /**
     * Get available permission types.
     */
    public static function getAvailablePermissionTypes(): array
    {
        return ['view', 'create', 'edit', 'delete'];
    }

    /**
     * Get all modules grouped by category.
     */
    public static function getModulesByCategory(): array
    {
        return self::all()
            ->groupBy('category')
            ->map(function ($modules) {
                return $modules->map(function ($module) {
                    return [
                        'id' => $module->module_id,
                        'name' => $module->module_name,
                        'description' => $module->module_description,
                        'category' => $module->category,
                    ];
                });
            })
            ->toArray();
    }
}
