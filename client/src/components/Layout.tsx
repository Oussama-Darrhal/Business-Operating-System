import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { usePermission } from '../services/permissionService';
import { PermissionGuard } from './PermissionGuard';
import { 
  Home, 
  Package, 
  Settings, 
  User,
  CreditCard,
  Globe,
  Activity,
  Users,
  Search,
  Bell,
  Brain,
  Award,
  Table,
  FileText,
  Shield
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  breadcrumb?: string[];
}

const Layout = ({ children, currentPage, breadcrumb }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { canAccessModule } = usePermission();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Main Business Modules Navigation
  const mainNavigationItems = [
    { 
      label: 'Dashboard', 
      icon: Home, 
      moduleId: 'dashboard',
      isActive: currentPage === 'dashboard',
      onClick: () => navigate('/dashboard')
    },
    { 
      label: 'Reviews & Complaints', 
      icon: Brain, 
      moduleId: 'reviews',
      disabled: false,
      onClick: () => navigate('/reviews-complaints-overview')
    },
    { 
      label: 'Inventory', 
      icon: Package, 
      moduleId: 'products',
      disabled: false 
    },
    { 
      label: 'Analytics', 
      icon: Activity, 
      moduleId: 'analytics',
      disabled: false 
    },
  ];

  // Sub-navigation items for each main category
  const inventorySubItems = [
    { label: 'Products', icon: Package, moduleId: 'products', disabled: false },
    { label: 'Stock Management', icon: Search, moduleId: 'stock', disabled: false },
    { label: 'Categories', icon: Table, moduleId: 'categories', disabled: false },
    { label: 'Warehouses', icon: Home, moduleId: 'warehouses', disabled: false },
  ];

  const reviewsSubItems = [
    { 
      label: 'Customer Reviews', 
      icon: Users, 
      moduleId: 'reviews', 
      disabled: false,
      onClick: () => navigate('/customer-reviews')
    },
    { 
      label: 'Complaints', 
      icon: Bell, 
      moduleId: 'complaints', 
      disabled: false,
      onClick: () => navigate('/complaints')
    },
    { 
      label: 'AI Analysis', 
      icon: Brain, 
      moduleId: 'ai-analysis', 
      disabled: false,
      onClick: () => navigate('/ai-analysis')
    },
    { 
      label: 'Response Management', 
      icon: Globe, 
      moduleId: 'response-management', 
      disabled: false,
      onClick: () => navigate('/response-management')
    },
  ];

  const analyticsSubItems = [
    { label: 'Business Metrics', icon: Activity, moduleId: 'analytics', disabled: false },
    { label: 'Performance Reports', icon: Award, moduleId: 'analytics', disabled: false },
    { label: 'Industry Benchmarks', icon: Globe, moduleId: 'analytics', disabled: false },
    { label: 'Financial Overview', icon: CreditCard, moduleId: 'analytics', disabled: false },
  ];

  const systemItems = [
    { 
      label: 'Users Management', 
      icon: Users, 
      moduleId: 'users',
      disabled: false, 
      isActive: currentPage === 'users-management',
      onClick: () => navigate('/users-management') 
    },
    { 
      label: 'Role Management', 
      icon: Shield, 
      moduleId: 'roles',
      disabled: false, 
      isActive: currentPage === 'role-management',
      onClick: () => navigate('/role-management') 
    },
    { 
      label: 'Company Profile', 
      icon: User, 
      moduleId: 'company-profile',
      disabled: false, 
      isActive: currentPage === 'company-profile',
      onClick: () => navigate('/company-profile') 
    },
    { 
      label: 'Settings', 
      icon: Settings, 
      moduleId: 'settings',
      disabled: false,
      isActive: currentPage === 'settings',
      onClick: () => navigate('/settings')
    },
    { 
      label: 'Activity Logs', 
      icon: FileText, 
      moduleId: 'activity-logs',
      disabled: false,
      isActive: currentPage === 'activity-logs',
      onClick: () => navigate('/activity-logs')
    },
  ];

  return (
    <div className="w-full h-full bg-[#0f172a] flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative z-50 lg:z-auto w-72 h-full bg-[#0f172a] border-r border-[#1e293b] flex flex-col transition-transform duration-300 ease-in-out lg:flex`}>
        {/* Sidebar Header */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">SME BOS</h1>
              <p className="text-xs text-gray-400">Business Operating System</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 px-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div>
              <div className="space-y-2">
                {mainNavigationItems.map((item) => (
                  <PermissionGuard key={item.label} moduleId={item.moduleId} permission="view">
                    <button
                      title={item.label}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                        item.isActive
                          ? 'bg-gray-600/20 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </PermissionGuard>
                ))}
              </div>
            </div>

            {/* Reviews & Complaints Module - Priority Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                CUSTOMER FEEDBACK
              </h3>
              <div className="space-y-1">
                {reviewsSubItems.map((item) => (
                  <PermissionGuard key={item.label} moduleId={item.moduleId} permission="view">
                    <button
                      title={item.label}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all duration-200 text-left"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </PermissionGuard>
                ))}
              </div>
            </div>

            {/* Inventory Module */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                INVENTORY MANAGEMENT
              </h3>
              <div className="space-y-1">
                {inventorySubItems.map((item) => (
                  <PermissionGuard key={item.label} moduleId={item.moduleId} permission="view">
                    <button
                      title={item.label}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all duration-200 text-left"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </PermissionGuard>
                ))}
              </div>
            </div>

            {/* Analytics Module */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                ANALYTICS & REPORTS
              </h3>
              <div className="space-y-1">
                {analyticsSubItems.map((item) => (
                  <PermissionGuard key={item.label} moduleId={item.moduleId} permission="view">
                    <button
                      title={item.label}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all duration-200 text-left"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </PermissionGuard>
                ))}
              </div>
            </div>

            {/* System & Administration */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                SYSTEM & ADMIN
              </h3>
              <div className="space-y-1">
                {systemItems.map((item) => (
                  <PermissionGuard key={item.label} moduleId={item.moduleId} permission="view">
                    <button
                      title={item.label}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                        item.isActive
                          ? 'bg-gray-600/20 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </PermissionGuard>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile & Help section */}
        <div className="p-6">
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
            <div className="text-center">
              <div className="mb-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium mx-auto">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <h4 className="text-white font-medium text-sm mb-1">{user?.email?.split('@')[0] || 'User'}</h4>
              <p className="text-gray-400 text-xs mb-3">SME Admin</p>
              <button 
                onClick={handleLogout}
                className="w-full bg-gray-700/50 text-gray-300 text-xs font-medium py-2 px-3 rounded-lg hover:bg-gray-700/70 hover:text-white transition-all duration-200"
              >
                SIGN OUT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-[#0f172a] border-b border-[#1e293b] px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Pages</span>
                {breadcrumb?.map((item, index) => (
                  <span key={index} className="flex items-center gap-2">
                    <span>/</span>
                    <span className={index === breadcrumb.length - 1 ? 'text-white' : ''}>{item}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <Search className="h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Type here..."
                  className="bg-transparent text-white placeholder-gray-400 text-sm border-none outline-none w-24 sm:w-auto"
                />
              </div>
              <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-white" />
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-white text-sm font-medium">{user?.email?.split('@')[0] || 'Sign In'}</span>
                <Settings className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-[#0f172a]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
