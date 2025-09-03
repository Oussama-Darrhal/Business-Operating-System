import { api } from '../utils/api';

// Types
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive' | 'pending';
    role_id?: string;
    role_name: string;
    role_color: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
}

export interface UserRole {
    id: string;
    name: string;
    description?: string;
    color: string;
    is_custom: boolean;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    role_id: number;
    status: 'active' | 'inactive' | 'pending';
}

export interface UpdateUserRequest {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    password_confirmation?: string;
    role_id: number;
    status: 'active' | 'inactive' | 'pending';
}

export interface UserApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

class UserApiService {
    private readonly baseUrl = '/api/users';

    /**
     * Get all users for the current SME
     */
    async getUsers(): Promise<UserApiResponse<User[]>> {
        try {
            const response = await api.get(this.baseUrl);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching users:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch users',
                data: [],
            };
        }
    }

    /**
     * Get available roles for user assignment
     */
    async getRoles(): Promise<UserApiResponse<UserRole[]>> {
        try {
            const response = await api.get(`${this.baseUrl}/roles`);
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
     * Get a specific user by ID
     */
    async getUser(id: string): Promise<UserApiResponse<User>> {
        try {
            const response = await api.get(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching user:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch user',
            };
        }
    }

    /**
     * Create a new user
     */
    async createUser(userData: CreateUserRequest): Promise<UserApiResponse<User>> {
        try {
            const response = await api.post(this.baseUrl, userData);
            return response.data;
        } catch (error: any) {
            console.error('Error creating user:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create user',
                errors: error.response?.data?.errors,
            };
        }
    }

    /**
     * Update an existing user
     */
    async updateUser(id: string, userData: UpdateUserRequest): Promise<UserApiResponse<User>> {
        try {
            const response = await api.put(`${this.baseUrl}/${id}`, userData);
            return response.data;
        } catch (error: any) {
            console.error('Error updating user:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update user',
                errors: error.response?.data?.errors,
            };
        }
    }

    /**
     * Delete a user
     */
    async deleteUser(id: string): Promise<UserApiResponse> {
        try {
            const response = await api.delete(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Error deleting user:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete user',
            };
        }
    }

    /**
     * Bulk delete users
     */
    async bulkDeleteUsers(userIds: string[]): Promise<UserApiResponse<{ deleted_count: number }>> {
        try {
            const response = await api.delete(this.baseUrl, {
                data: { user_ids: userIds }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error bulk deleting users:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete users',
            };
        }
    }
}

export const userApi = new UserApiService();
