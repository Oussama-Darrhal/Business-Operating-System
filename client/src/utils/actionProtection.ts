import { permissionService } from '../services/permissionService';

/**
 * Action protection utilities for securing operations based on user permissions
 */

export interface ActionResult {
  allowed: boolean;
  message?: string;
}

export interface ActionOptions {
  moduleId: string;
  permission: 'view' | 'create' | 'edit' | 'delete';
  customMessage?: string;
  showAlert?: boolean;
  onDenied?: () => void;
}

/**
 * Check if user can perform a specific action
 */
export const canPerformAction = (
  moduleId: string, 
  permission: 'view' | 'create' | 'edit' | 'delete'
): ActionResult => {
  const allowed = permissionService.hasPermission(moduleId, permission);
  
  return {
    allowed,
    message: allowed 
      ? undefined 
      : `You do not have permission to ${permission} ${moduleId.replace('-', ' ')}.`
  };
};

/**
 * Higher-order function to protect action functions
 */
export const withActionProtection = <T extends (...args: any[]) => any>(
  action: T,
  options: ActionOptions
): ((...args: Parameters<T>) => ReturnType<T> | void) => {
  return (...args: Parameters<T>) => {
    const result = canPerformAction(options.moduleId, options.permission);
    
    if (!result.allowed) {
      const message = options.customMessage || result.message;
      
      if (options.showAlert !== false) {
        alert(message);
      }
      
      if (options.onDenied) {
        options.onDenied();
      }
      
      return;
    }
    
    return action(...args);
  };
};

/**
 * React hook for action protection
 */
export const useActionProtection = () => {
  const checkPermission = (moduleId: string, permission: 'view' | 'create' | 'edit' | 'delete') => {
    return canPerformAction(moduleId, permission);
  };

  const protectAction = <T extends (...args: any[]) => any>(
    action: T,
    options: ActionOptions
  ) => {
    return withActionProtection(action, options);
  };

  const requirePermission = (
    moduleId: string, 
    permission: 'view' | 'create' | 'edit' | 'delete',
    errorCallback?: (message: string) => void
  ): boolean => {
    const result = canPerformAction(moduleId, permission);
    
    if (!result.allowed && errorCallback && result.message) {
      errorCallback(result.message);
    }
    
    return result.allowed;
  };

  return {
    checkPermission,
    protectAction,
    requirePermission,
    canPerformAction
  };
};

/**
 * Async action protection wrapper
 */
export const withAsyncActionProtection = <T extends (...args: any[]) => Promise<any>>(
  action: T,
  options: ActionOptions
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | void>) => {
  return async (...args: Parameters<T>) => {
    const result = canPerformAction(options.moduleId, options.permission);
    
    if (!result.allowed) {
      const message = options.customMessage || result.message;
      
      if (options.showAlert !== false) {
        alert(message);
      }
      
      if (options.onDenied) {
        options.onDenied();
      }
      
      return;
    }
    
    return await action(...args);
  };
};

/**
 * Utility functions for common permission patterns
 */
export const permissionUtils = {
  /**
   * Check if user can create items in a module
   */
  canCreate: (moduleId: string) => canPerformAction(moduleId, 'create').allowed,
  
  /**
   * Check if user can edit items in a module
   */
  canEdit: (moduleId: string) => canPerformAction(moduleId, 'edit').allowed,
  
  /**
   * Check if user can delete items in a module
   */
  canDelete: (moduleId: string) => canPerformAction(moduleId, 'delete').allowed,
  
  /**
   * Check if user can view items in a module
   */
  canView: (moduleId: string) => canPerformAction(moduleId, 'view').allowed,
  
  /**
   * Check multiple permissions at once
   */
  canPerformAny: (moduleId: string, permissions: Array<'view' | 'create' | 'edit' | 'delete'>) => {
    return permissions.some(permission => canPerformAction(moduleId, permission).allowed);
  },
  
  /**
   * Check if user has all specified permissions
   */
  canPerformAll: (moduleId: string, permissions: Array<'view' | 'create' | 'edit' | 'delete'>) => {
    return permissions.every(permission => canPerformAction(moduleId, permission).allowed);
  },
  
  /**
   * Get user's permissions for a module
   */
  getModulePermissions: (moduleId: string) => {
    return {
      view: canPerformAction(moduleId, 'view').allowed,
      create: canPerformAction(moduleId, 'create').allowed,
      edit: canPerformAction(moduleId, 'edit').allowed,
      delete: canPerformAction(moduleId, 'delete').allowed,
    };
  }
};

/**
 * Decorator-style function for class methods (if using classes)
 */
export const RequirePermission = (moduleId: string, permission: 'view' | 'create' | 'edit' | 'delete') => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const result = canPerformAction(moduleId, permission);
      
      if (!result.allowed) {
        console.warn(`Access denied: ${result.message}`);
        return;
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
};

/**
 * Form validation with permission checking
 */
export const validateWithPermissions = (
  moduleId: string, 
  permission: 'create' | 'edit',
  validationFn?: () => boolean
): { isValid: boolean; error?: string } => {
  const result = canPerformAction(moduleId, permission);
  
  if (!result.allowed) {
    return {
      isValid: false,
      error: result.message
    };
  }
  
  if (validationFn && !validationFn()) {
    return {
      isValid: false,
      error: 'Form validation failed'
    };
  }
  
  return { isValid: true };
};

/**
 * Bulk action protection
 */
export const protectBulkAction = (
  moduleId: string,
  permission: 'delete' | 'edit',
  items: any[],
  customMessage?: string
): ActionResult => {
  if (items.length === 0) {
    return {
      allowed: false,
      message: 'No items selected for bulk action'
    };
  }
  
  const result = canPerformAction(moduleId, permission);
  
  if (!result.allowed) {
    return {
      allowed: false,
      message: customMessage || `You do not have permission to ${permission} multiple ${moduleId.replace('-', ' ')} items.`
    };
  }
  
  return { allowed: true };
};

export default {
  canPerformAction,
  withActionProtection,
  withAsyncActionProtection,
  useActionProtection,
  permissionUtils,
  RequirePermission,
  validateWithPermissions,
  protectBulkAction
};




