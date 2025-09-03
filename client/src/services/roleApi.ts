import { api } from '../utils/api';

// Types
export interface Permission {
    module_id: string;
    module_name?: string;
    permissions: PermissionType[];
}

export type PermissionType = 'view' | 'create' | 'edit' | 'delete';

export interface Role {
    id: string;
    name: string;
    description: string;
    color: string;
    is_custom: boolean;
    user_count: number;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

export interface Module {
    id: string;
    name: string;
    description: string;
    category: string;
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
    color: string;
    permissions: Record<string, PermissionType[]>;
}

export interface UpdateRoleRequest extends CreateRoleRequest {
    id: string;
}

export interface RoleApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

class RoleApiService {
    private readonly baseUrl = '/api/roles';

    /**
     * Get all roles for the current SME
     */
    async getRoles(): Promise<RoleApiResponse<Role[]>> {
        try {
            const response = await api.get(this.baseUrl);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching roles:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch roles',
                data: [],
            };
        }
    }

    /**
     * Get available modules and permission types
     */
    async getModules(): Promise<RoleApiResponse<{ modules: Record<string, Module[]>; permission_types: PermissionType[] }>> {
        try {
            const response = await api.get(`${this.baseUrl}/modules`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching modules:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch modules',
            };
        }
    }

    /**
     * Get a specific role by ID
     */
    async getRole(id: string): Promise<RoleApiResponse<Role>> {
        try {
            const response = await api.get(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch role',
            };
        }
    }

    /**
     * Create a new role
     */
    async createRole(roleData: CreateRoleRequest): Promise<RoleApiResponse<Role>> {
        try {
            const response = await api.post(this.baseUrl, roleData);
            return response.data;
        } catch (error: any) {
            console.error('Error creating role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create role',
                errors: error.response?.data?.errors,
            };
        }
    }

    /**
     * Update an existing role
     */
    async updateRole(id: string, roleData: Omit<UpdateRoleRequest, 'id'>): Promise<RoleApiResponse<Role>> {
        try {
            const response = await api.put(`${this.baseUrl}/${id}`, roleData);
            return response.data;
        } catch (error: any) {
            console.error('Error updating role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update role',
                errors: error.response?.data?.errors,
            };
        }
    }

    /**
     * Delete a role
     */
    async deleteRole(id: string): Promise<RoleApiResponse> {
        try {
            const response = await api.delete(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Error deleting role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete role',
            };
        }
    }

    /**
     * Bulk delete roles
     */
    async bulkDeleteRoles(roleIds: string[]): Promise<RoleApiResponse<{ deleted_count: number; errors: string[] }>> {
        try {
            const response = await api.delete(this.baseUrl, {
                data: { role_ids: roleIds }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error bulk deleting roles:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete roles',
            };
        }
    }

    /**
     * Reassign users from one role to another
     */
    async reassignUsers(fromRoleId: string, toRoleId: string): Promise<RoleApiResponse<{ reassigned_count: number }>> {
        try {
            const response = await api.post(`${this.baseUrl}/reassign-users`, {
                from_role_id: fromRoleId,
                to_role_id: toRoleId
            });
            return response.data;
        } catch (error: any) {
            console.error('Error reassigning users:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to reassign users',
            };
        }
    }
}

export const roleApi = new RoleApiService();
