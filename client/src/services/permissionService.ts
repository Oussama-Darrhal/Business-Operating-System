import { authenticatedApiCall } from '../utils/api';

export interface Permission {
  module_id: string;
  module_name: string;
  permissions: string[];
}

export interface UserPermissions {
  [moduleId: string]: Permission;
}

export interface UserRole {
  id: number;
  name: string;
  description: string;
  color: string;
  is_custom: boolean;
}

export interface PermissionResponse {
  success: boolean;
  permissions: Permission[];
  role: UserRole;
}

class PermissionService {
  private static instance: PermissionService;
  private permissions: UserPermissions = {};
  private role: UserRole | null = null;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Initialize permissions from user data or fetch from API
   */
  public async initialize(userPermissions?: Permission[], userRole?: UserRole): Promise<void> {
    try {
      if (userPermissions && userRole) {
        // Use provided permissions (from login/user data)
        console.log('Initializing permissions from user data:', { userPermissions, userRole });
        this.setPermissions(userPermissions, userRole);
      } else {
        // Fetch from API
        console.log('Fetching permissions from API...');
        await this.fetchPermissions();
      }
      this.initialized = true;
      console.log('Permission service initialized successfully:', this.getPermissionSummary());
    } catch (error) {
      console.error('Failed to initialize permissions:', error);
      this.initialized = false;
    }
  }

  /**
   * Fetch permissions from API
   */
  private async fetchPermissions(): Promise<void> {
    const response = await authenticatedApiCall('/api/user/permissions');
    
    if (response.success) {
      // The AuthController returns permissions and role directly in the response
      const permissionData = response.data || response;
      this.setPermissions(permissionData.permissions, permissionData.role);
    } else {
      throw new Error('Failed to fetch permissions');
    }
  }

  /**
   * Set permissions and role
   */
  private setPermissions(permissions: Permission[], role: UserRole): void {
    this.permissions = {};
    permissions.forEach(permission => {
      this.permissions[permission.module_id] = permission;
    });
    this.role = role;
  }

  /**
   * Check if user has specific permission for a module
   */
  public hasPermission(moduleId: string, permission: 'view' | 'create' | 'edit' | 'delete'): boolean {
    if (!this.initialized) {
      console.warn('PermissionService not initialized. Call initialize() first.');
      return false;
    }

    const modulePermissions = this.permissions[moduleId];
    if (!modulePermissions) {
      return false;
    }

    return modulePermissions.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions for a module
   */
  public hasAnyPermission(moduleId: string, permissions: string[]): boolean {
    return permissions.some(permission => 
      this.hasPermission(moduleId, permission as 'view' | 'create' | 'edit' | 'delete')
    );
  }

  /**
   * Check if user has all of the specified permissions for a module
   */
  public hasAllPermissions(moduleId: string, permissions: string[]): boolean {
    return permissions.every(permission => 
      this.hasPermission(moduleId, permission as 'view' | 'create' | 'edit' | 'delete')
    );
  }

  /**
   * Get all permissions for a specific module
   */
  public getModulePermissions(moduleId: string): string[] {
    const modulePermissions = this.permissions[moduleId];
    return modulePermissions ? modulePermissions.permissions : [];
  }

  /**
   * Get all permissions
   */
  public getAllPermissions(): UserPermissions {
    return { ...this.permissions };
  }

  /**
   * Get user role
   */
  public getRole(): UserRole | null {
    return this.role;
  }

  /**
   * Check if user has access to a module (at least view permission)
   */
  public canAccessModule(moduleId: string): boolean {
    return this.hasPermission(moduleId, 'view');
  }

  /**
   * Get accessible modules (modules user can view)
   */
  public getAccessibleModules(): string[] {
    return Object.keys(this.permissions).filter(moduleId => 
      this.canAccessModule(moduleId)
    );
  }

  /**
   * Check if user can perform action based on role and permissions
   */
  public canPerformAction(moduleId: string, action: string): boolean {
    switch (action) {
      case 'view':
      case 'read':
        return this.hasPermission(moduleId, 'view');
      case 'create':
      case 'add':
        return this.hasPermission(moduleId, 'create');
      case 'edit':
      case 'update':
        return this.hasPermission(moduleId, 'edit');
      case 'delete':
      case 'remove':
        return this.hasPermission(moduleId, 'delete');
      default:
        return false;
    }
  }

  /**
   * Clear permissions (for logout)
   */
  public clear(): void {
    this.permissions = {};
    this.role = null;
    this.initialized = false;
  }

  /**
   * Refresh permissions from API
   */
  public async refresh(): Promise<void> {
    await this.fetchPermissions();
    this.initialized = true;
  }

  /**
   * Get permission summary for debugging
   */
  public getPermissionSummary(): any {
    return {
      initialized: this.initialized,
      role: this.role,
      moduleCount: Object.keys(this.permissions).length,
      accessibleModules: this.getAccessibleModules(),
    };
  }
}

// Export singleton instance
export const permissionService = PermissionService.getInstance();

// Make permission service available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).permissionService = permissionService;
}

// Export utility hooks for React components
export const usePermission = () => {
  return {
    hasPermission: (moduleId: string, permission: 'view' | 'create' | 'edit' | 'delete') => 
      permissionService.hasPermission(moduleId, permission),
    hasAnyPermission: (moduleId: string, permissions: string[]) => 
      permissionService.hasAnyPermission(moduleId, permissions),
    hasAllPermissions: (moduleId: string, permissions: string[]) => 
      permissionService.hasAllPermissions(moduleId, permissions),
    canAccessModule: (moduleId: string) => 
      permissionService.canAccessModule(moduleId),
    canPerformAction: (moduleId: string, action: string) => 
      permissionService.canPerformAction(moduleId, action),
    getRole: () => permissionService.getRole(),
    getModulePermissions: (moduleId: string) => 
      permissionService.getModulePermissions(moduleId),
  };
};
