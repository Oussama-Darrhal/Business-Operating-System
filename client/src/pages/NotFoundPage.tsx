import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { usePermission } from '../services/permissionService';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAccessibleModules } = usePermission();

  const accessibleModules = getAccessibleModules();
  
  // Map module IDs to user-friendly names and paths
  const moduleRoutes: { [key: string]: { name: string; path: string } } = {
    'dashboard': { name: 'Dashboard', path: '/dashboard' },
    'users': { name: 'Users Management', path: '/users-management' },
    'roles': { name: 'Role Management', path: '/role-management' },
    'company-profile': { name: 'Company Profile', path: '/company-profile' },
    'products': { name: 'Products', path: '/products' },
    'analytics': { name: 'Analytics', path: '/analytics' },
    'reviews': { name: 'Reviews', path: '/reviews' },
    'settings': { name: 'Settings', path: '/settings' },
  };

  const availableRoutes = accessibleModules
    .map(moduleId => moduleRoutes[moduleId])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Header */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-gray-700 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-2">Page Not Found</h2>
          <p className="text-gray-400 text-lg">
            The page you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>

        {/* Available Pages */}
        {availableRoutes.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-blue-400" />
              <h3 className="text-white font-semibold">Pages you can access:</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableRoutes.map((route, index) => (
                <button
                  key={index}
                  onClick={() => navigate(route.path)}
                  className="text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-600/30 hover:border-blue-500/30"
                >
                  <span className="text-blue-400 hover:text-blue-300 font-medium">
                    {route.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              Return Home
            </button>
          </div>
          
          <p className="text-gray-500 text-sm">
            If you believe this page should exist, contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;




