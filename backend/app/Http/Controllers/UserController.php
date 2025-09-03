<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get all users for the authenticated user's SME.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $smeId = $user->sme_id;

            if (!$smeId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to access users',
                ], 400);
            }

            $users = User::where('sme_id', $smeId)
                ->with(['userRole'])
                ->orderBy('name', 'asc')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'status' => $user->status ?? 'active',
                        'role_id' => $user->role_id,
                        'role_name' => $user->userRole?->name ?? 'No Role',
                        'role_color' => $user->userRole?->color ?? 'gray',
                        'last_login_at' => $user->last_login_at?->diffForHumans() ?? 'Never',
                        'created_at' => $user->created_at->format('Y-m-d'),
                        'updated_at' => $user->updated_at->format('Y-m-d'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new user.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $authUser = $request->user();
            $smeId = $authUser->sme_id;

            if (!$smeId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to create users',
                ], 400);
            }

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'nullable|string|max:20',
                'password' => 'required|string|min:8|confirmed',
                'role_id' => [
                    'required',
                    'integer',
                    Rule::exists('roles', 'id')->where('sme_id', $smeId),
                ],
                'status' => 'required|string|in:active,inactive,pending',
            ]);

            $user = User::create([
                'sme_id' => $smeId,
                'role_id' => $request->role_id,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'status' => $request->status,
            ]);

            // Load the user with its role
            $user->load('userRole');

            // Log user creation
            ActivityLogService::logUserAction('user.created', $user->id, [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'role_id' => $user->role_id,
                'status' => $user->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'role_id' => $user->role_id,
                    'role_name' => $user->userRole?->name ?? 'No Role',
                    'role_color' => $user->userRole?->color ?? 'gray',
                    'last_login_at' => 'Never',
                    'created_at' => $user->created_at->format('Y-m-d'),
                    'updated_at' => $user->updated_at->format('Y-m-d'),
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
                'message' => 'Failed to create user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific user.
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $authUser = $request->user();
            $smeId = $authUser->sme_id;

            $user = User::where('sme_id', $smeId)
                ->where('id', $id)
                ->with(['userRole'])
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'role_id' => $user->role_id,
                    'role_name' => $user->userRole?->name ?? 'No Role',
                    'role_color' => $user->userRole?->color ?? 'gray',
                    'last_login_at' => $user->last_login_at?->diffForHumans() ?? 'Never',
                    'created_at' => $user->created_at->format('Y-m-d'),
                    'updated_at' => $user->updated_at->format('Y-m-d'),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a user.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $authUser = $request->user();
            $smeId = $authUser->sme_id;

            $user = User::where('sme_id', $smeId)
                ->where('id', $id)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => [
                    'required',
                    'email',
                    Rule::unique('users', 'email')->ignore($user->id),
                ],
                'phone' => 'nullable|string|max:20',
                'password' => 'nullable|string|min:8|confirmed',
                'role_id' => [
                    'required',
                    'integer',
                    Rule::exists('roles', 'id')->where('sme_id', $smeId),
                ],
                'status' => 'required|string|in:active,inactive,pending',
            ]);

            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'role_id' => $request->role_id,
                'status' => $request->status,
            ];

            // Only update password if provided
            if ($request->password) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            // Load the user with its role
            $user->load('userRole');

            // Log user update
            ActivityLogService::logUserAction('user.updated', $user->id, [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'role_id' => $user->role_id,
                'status' => $user->status,
                'password_changed' => $request->password ? true : false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'role_id' => $user->role_id,
                    'role_name' => $user->userRole?->name ?? 'No Role',
                    'role_color' => $user->userRole?->color ?? 'gray',
                    'last_login_at' => $user->last_login_at?->diffForHumans() ?? 'Never',
                    'created_at' => $user->created_at->format('Y-m-d'),
                    'updated_at' => $user->updated_at->format('Y-m-d'),
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
                'message' => 'Failed to update user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a user.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $authUser = $request->user();
            $smeId = $authUser->sme_id;

            $user = User::where('sme_id', $smeId)
                ->where('id', $id)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            // Prevent self-deletion
            if ($user->id === $authUser->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete your own account',
                ], 400);
            }

            // Log user deletion before deleting
            ActivityLogService::logUserAction('user.deleted', $user->id, [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'deleted_by' => $authUser->id,
            ]);

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk delete users.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        try {
            $authUser = $request->user();
            $smeId = $authUser->sme_id;

            $request->validate([
                'user_ids' => 'required|array',
                'user_ids.*' => 'integer|exists:users,id',
            ]);

            $users = User::where('sme_id', $smeId)
                ->whereIn('id', $request->user_ids)
                ->where('id', '!=', $authUser->id) // Exclude self
                ->get();

            $deletedCount = $users->count();

            foreach ($users as $user) {
                $user->delete();
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} user(s)",
                'deleted_count' => $deletedCount,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available roles for user assignment.
     */
    public function getRoles(Request $request): JsonResponse
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
                ->orderBy('is_custom', 'asc')
                ->orderBy('name', 'asc')
                ->get(['id', 'name', 'description', 'color', 'is_custom']);

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
}
