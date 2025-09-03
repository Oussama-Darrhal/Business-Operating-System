<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use App\Models\RolePermission;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Get all roles for the authenticated user's SME.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $smeId = $user->sme_id;

            if (!$smeId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to access roles',
                ], 400);
            }

            $roles = Role::where('sme_id', $smeId)
                ->with(['rolePermissions.permission'])
                ->withCount('users')
                ->orderBy('is_custom', 'asc')
                ->orderBy('name', 'asc')
                ->get()
                ->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'description' => $role->description,
                        'color' => $role->color,
                        'is_custom' => $role->is_custom,
                        'user_count' => $role->users_count,
                        'permissions' => $role->getFormattedPermissions(),
                        'created_at' => $role->created_at->format('Y-m-d'),
                        'updated_at' => $role->updated_at->format('Y-m-d'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $roles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch roles',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available modules and permission types.
     */
    public function getModules(): JsonResponse
    {
        try {
            $modules = Permission::getModulesByCategory();
            $permissionTypes = Permission::getAvailablePermissionTypes();

            return response()->json([
                'success' => true,
                'data' => [
                    'modules' => $modules,
                    'permission_types' => $permissionTypes,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch modules',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new role.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $smeId = $user->sme_id;

            if (!$smeId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to create roles',
                ], 400);
            }

            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('roles')->where('sme_id', $smeId),
                ],
                'description' => 'nullable|string|max:1000',
                'color' => 'required|string|in:blue,purple,green,orange,red,gray',
                'permissions' => 'required|array',
                'permissions.*' => 'array',
                'permissions.*.*' => 'string|in:view,create,edit,delete',
            ]);

            $role = Role::create([
                'sme_id' => $smeId,
                'name' => $request->name,
                'description' => $request->description,
                'color' => $request->color,
                'is_custom' => true,
            ]);

            // Sync permissions
            $role->syncPermissions($request->permissions);

            // Load the role with its permissions
            $role->load(['rolePermissions.permission']);

            // Log role creation
            ActivityLogService::logRoleAction('role.created', $role->id, [
                'role_name' => $role->name,
                'role_description' => $role->description,
                'permissions_count' => count($request->permissions),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'color' => $role->color,
                    'is_custom' => $role->is_custom,
                    'user_count' => 0,
                    'permissions' => $role->getFormattedPermissions(),
                    'created_at' => $role->created_at->format('Y-m-d'),
                    'updated_at' => $role->updated_at->format('Y-m-d'),
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific role.
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();
            $smeId = $user->sme_id;

            $role = Role::where('sme_id', $smeId)
                ->where('id', $id)
                ->with(['rolePermissions.permission'])
                ->withCount('users')
                ->first();

            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'color' => $role->color,
                    'is_custom' => $role->is_custom,
                    'user_count' => $role->users_count,
                    'permissions' => $role->getFormattedPermissions(),
                    'created_at' => $role->created_at->format('Y-m-d'),
                    'updated_at' => $role->updated_at->format('Y-m-d'),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a role.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();
            $smeId = $user->sme_id;

            $role = Role::where('sme_id', $smeId)
                ->where('id', $id)
                ->first();

            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role not found',
                ], 404);
            }

            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('roles')->where('sme_id', $smeId)->ignore($role->id),
                ],
                'description' => 'nullable|string|max:1000',
                'color' => 'required|string|in:blue,purple,green,orange,red,gray',
                'permissions' => 'required|array',
                'permissions.*' => 'array',
                'permissions.*.*' => 'string|in:view,create,edit,delete',
            ]);

            $role->update([
                'name' => $request->name,
                'description' => $request->description,
                'color' => $request->color,
            ]);

            // Sync permissions
            $role->syncPermissions($request->permissions);

            // Load the role with its permissions
            $role->load(['rolePermissions.permission']);

            // Log role update
            ActivityLogService::logRoleAction('role.updated', $role->id, [
                'role_name' => $role->name,
                'role_description' => $role->description,
                'permissions_count' => count($request->permissions),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'color' => $role->color,
                    'is_custom' => $role->is_custom,
                    'user_count' => $role->users()->count(),
                    'permissions' => $role->getFormattedPermissions(),
                    'created_at' => $role->created_at->format('Y-m-d'),
                    'updated_at' => $role->updated_at->format('Y-m-d'),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a role.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();
            $smeId = $user->sme_id;

            $role = Role::where('sme_id', $smeId)
                ->where('id', $id)
                ->first();

            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role not found',
                ], 404);
            }

            // Prevent deletion of system roles
            if (!$role->is_custom) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete system roles',
                ], 400);
            }

            // Check if role has assigned users
            if ($role->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete role with assigned users. Please reassign users first.',
                ], 400);
            }

            // Log role deletion before deleting
            ActivityLogService::logRoleAction('role.deleted', $role->id, [
                'role_name' => $role->name,
                'role_description' => $role->description,
                'deleted_by' => $user->id,
            ]);

            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk delete roles.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $smeId = $user->sme_id;

            $request->validate([
                'role_ids' => 'required|array',
                'role_ids.*' => 'integer|exists:roles,id',
            ]);

            $roles = Role::where('sme_id', $smeId)
                ->whereIn('id', $request->role_ids)
                ->where('is_custom', true) // Only allow deletion of custom roles
                ->get();

            $deletedCount = 0;
            $errors = [];

            foreach ($roles as $role) {
                if ($role->users()->count() > 0) {
                    $errors[] = "Role '{$role->name}' has assigned users and cannot be deleted";
                } else {
                    $role->delete();
                    $deletedCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} role(s)",
                'deleted_count' => $deletedCount,
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete roles',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
