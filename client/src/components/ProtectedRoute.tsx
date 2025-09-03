import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { usePermission } from '../services/permissionService';
import { Loader2, AlertTriangle, Home } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  moduleId: string;
  permission?: 'view' | 'create' | 'edit' | 'delete';
  permissions?: string[];
  requireAll?: boolean;
  fallbackPath?: string;
}

interface UnauthorizedPageProps {
  moduleId: string;
  permission?: string;
  permissions?: string[];
  onGoBack?: () => void;
}

const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ 
  moduleId, 
  permission, 
  permissions, 
  onGoBack 
}) => {
  const { getRole } = usePermission();
  const userRole = getRole();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 border border-gray-700 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-white font-medium mb-2">Required Access:</h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">
              <span className="text-gray-400">Module:</span> {moduleId}
            </p>
            {permission && (
              <p className="text-gray-300">
                <span className="text-gray-400">Permission:</span> {permission}
              </p>
            )}
            {permissions && permissions.length > 0 && (
              <p className="text-gray-300">
                <span className="text-gray-400">Permissions:</span> {permissions.join(', ')}
              </p>
            )}
          </div>
        </div>

        {userRole && (
          <div className="bg-blue-500/10 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-white font-medium mb-2">Your Current Role:</h3>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: userRole.color }}
              ></div>
              <span className="text-white font-medium">{userRole.name}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{userRole.description}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </button>
        </div>

        <p className="text-gray-500 text-xs mt-4">
          Contact your administrator if you believe you should have access to this page.
        </p>
      </div>
    </div>
  );
};

/**
 * ProtectedRoute component that checks permissions before allowing access to routes
 * 
 * Usage:
 * <ProtectedRoute moduleId="users" permission="view">
 *   <UsersPage />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  moduleId,
  permission,
  permissions,
  requireAll = false,
  fallbackPath = '/dashboard'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    canAccessModule 
  } = usePermission();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkPermissions = () => {
      if (!isAuthenticated) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      let accessGranted = false;

      try {
        if (permission) {
          // Check single permission
          accessGranted = hasPermission(moduleId, permission);
        } else if (permissions && permissions.length > 0) {
          // Check multiple permissions
          if (requireAll) {
            accessGranted = hasAllPermissions(moduleId, permissions);
          } else {
            accessGranted = hasAnyPermission(moduleId, permissions);
          }
        } else {
          // Default to checking module access (view permission)
          accessGranted = canAccessModule(moduleId);
        }

        setHasAccess(accessGranted);
      } catch (error) {
        console.error('Error checking route permissions:', error);
        setHasAccess(false);
      }

      setIsChecking(false);
    };

    // Small delay to ensure permission service is initialized
    const timer = setTimeout(checkPermissions, 100);
    return () => clearTimeout(timer);
  }, [
    isAuthenticated, 
    moduleId, 
    permission, 
    permissions, 
    requireAll,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule
  ]);

  // Show loading while checking authentication or permissions
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show unauthorized page if no access
  if (!hasAccess) {
    return (
      <UnauthorizedPage
        moduleId={moduleId}
        permission={permission}
        permissions={permissions}
      />
    );
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;




