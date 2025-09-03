import React from 'react';
import { usePermission } from '../services/permissionService';

interface PermissionGuardProps {
  children: React.ReactNode;
  moduleId: string;
  permission?: 'view' | 'create' | 'edit' | 'delete';
  permissions?: string[];
  action?: string;
  requireAll?: boolean;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * PermissionGuard component that conditionally renders children based on user permissions
 * 
 * Usage examples:
 * 
 * // Check single permission
 * <PermissionGuard moduleId="users" permission="create">
 *   <Button>Add User</Button>
 * </PermissionGuard>
 * 
 * // Check multiple permissions (any)
 * <PermissionGuard moduleId="users" permissions={['create', 'edit']}>
 *   <Button>Manage Users</Button>
 * </PermissionGuard>
 * 
 * // Check multiple permissions (all required)
 * <PermissionGuard moduleId="users" permissions={['view', 'edit']} requireAll>
 *   <UserEditForm />
 * </PermissionGuard>
 * 
 * // Check by action
 * <PermissionGuard moduleId="products" action="create">
 *   <Button>Add Product</Button>
 * </PermissionGuard>
 * 
 * // With fallback content
 * <PermissionGuard 
 *   moduleId="settings" 
 *   permission="view"
 *   fallback={<div>Access denied</div>}
 * >
 *   <SettingsPanel />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  moduleId,
  permission,
  permissions,
  action,
  requireAll = false,
  fallback = null,
  className,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,
    canAccessModule,
  } = usePermission();

  let hasAccess = false;

  if (action) {
    // Check by action
    hasAccess = canPerformAction(moduleId, action);
  } else if (permission) {
    // Check single permission
    hasAccess = hasPermission(moduleId, permission);
  } else if (permissions && permissions.length > 0) {
    // Check multiple permissions
    if (requireAll) {
      hasAccess = hasAllPermissions(moduleId, permissions);
    } else {
      hasAccess = hasAnyPermission(moduleId, permissions);
    }
  } else {
    // Default to checking module access (view permission)
    hasAccess = canAccessModule(moduleId);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  if (className) {
    return <div className={className}>{children}</div>;
  }

  return <>{children}</>;
};

interface ConditionalRenderProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Simple conditional render component for permission-based logic
 */
export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  condition,
  children,
  fallback = null,
}) => {
  return condition ? <>{children}</> : <>{fallback}</>;
};

interface PermissionBasedNavProps {
  items: Array<{
    moduleId: string;
    permission?: 'view' | 'create' | 'edit' | 'delete';
    permissions?: string[];
    action?: string;
    requireAll?: boolean;
    component: React.ReactNode;
    key: string;
  }>;
  className?: string;
}

/**
 * Component for rendering permission-based navigation items
 */
export const PermissionBasedNav: React.FC<PermissionBasedNavProps> = ({
  items,
  className,
}) => {
  const accessibleItems = items.filter(item => {
    const guard = (
      <PermissionGuard
        moduleId={item.moduleId}
        permission={item.permission}
        permissions={item.permissions}
        action={item.action}
        requireAll={item.requireAll}
      >
        {item.component}
      </PermissionGuard>
    );

    // This is a simple check - in practice, you'd want to use the same logic as PermissionGuard
    const { canAccessModule, hasPermission, hasAnyPermission, hasAllPermissions, canPerformAction } = usePermission();
    
    let hasAccess = false;
    if (item.action) {
      hasAccess = canPerformAction(item.moduleId, item.action);
    } else if (item.permission) {
      hasAccess = hasPermission(item.moduleId, item.permission);
    } else if (item.permissions && item.permissions.length > 0) {
      if (item.requireAll) {
        hasAccess = hasAllPermissions(item.moduleId, item.permissions);
      } else {
        hasAccess = hasAnyPermission(item.moduleId, item.permissions);
      }
    } else {
      hasAccess = canAccessModule(item.moduleId);
    }

    return hasAccess;
  });

  return (
    <div className={className}>
      {accessibleItems.map(item => (
        <React.Fragment key={item.key}>
          {item.component}
        </React.Fragment>
      ))}
    </div>
  );
};

// Export default as PermissionGuard
export default PermissionGuard;




