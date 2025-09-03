import { 
  UserPlus,
  ShoppingCart,
  Brain,
  ArrowUp,
  ArrowDown,
  Activity,
  Users,
  Package
} from 'lucide-react';
import { DashboardButton } from '../components/ui/dashboard-button';
import Layout from '../components/Layout';
import { PermissionGuard } from '../components/PermissionGuard';
import { usePermission } from '../services/permissionService';

const DashboardPage = () => {
  const { getRole } = usePermission();
  const userRole = getRole();

  return (
    <Layout currentPage="dashboard" breadcrumb={['Dashboard']}>
      <div className="p-3 sm:p-4 lg:p-6">
          <div className="space-y-4 lg:space-y-6">
            {/* Role Indicator */}
            {userRole && (
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: userRole.color }}
                  ></div>
                  <span className="text-white font-medium">
                    Current Role: {userRole.name}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {userRole.description}
                  </span>
                </div>
                {userRole.is_custom && (
                  <span className="text-yellow-400 text-xs font-medium px-2 py-1 bg-yellow-400/10 rounded">
                    CUSTOM
                  </span>
                )}
              </div>
            )}
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {/* Today's Money */}
              <PermissionGuard moduleId="analytics" permission="view">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Today's Money</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-xl font-bold">$53,000</h3>
                      <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                        <ArrowUp className="h-3 w-3" />
                        +55%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Activity className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                </div>
              </PermissionGuard>

              {/* Today's Users */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Today's Users</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-xl font-bold">2,300</h3>
                      <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                        <ArrowUp className="h-3 w-3" />
                        +3%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* New Clients */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">New Clients</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-xl font-bold">+3,052</h3>
                      <span className="text-red-400 text-sm font-medium flex items-center gap-1">
                        <ArrowDown className="h-3 w-3" />
                        -14%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <UserPlus className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Total Sales */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Sales</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-xl font-bold">$173,000</h3>
                      <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                        <ArrowUp className="h-3 w-3" />
                        +8%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <ShoppingCart className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Welcome & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* Welcome Section */}
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-4 lg:p-6 border border-blue-700/30 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-gray-300 text-sm mb-2">Welcome back,</p>
                  <h2 className="text-white text-2xl font-bold mb-4">Mark Johnson</h2>
                  <p className="text-gray-300 text-sm mb-4">
                    Glad to see you again!<br />
                    Ask me anything.
                  </p>
                  <PermissionGuard moduleId="ai-analysis" permission="view">
                    <DashboardButton 
                      variant="record"
                      size="default"
                      className="text-sm font-medium"
                    >
                      Tap to record →
                    </DashboardButton>
                  </PermissionGuard>
                </div>
                {/* Brain visualization placeholder */}
                <div className="absolute right-2 lg:right-4 top-4 bottom-4 w-32 lg:w-48 opacity-60">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full flex items-center justify-center">
                    <Brain className="h-12 lg:h-20 w-12 lg:w-20 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Satisfaction Rate */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                <h3 className="text-white text-lg font-semibold mb-4">Satisfaction Rate</h3>
                <p className="text-gray-400 text-sm mb-6">From all projects</p>
                
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-24 h-24">
                    <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#374151"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${95 * 2.51} 251`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">95%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">0%</span>
                  <span className="text-gray-400">100%</span>
                </div>
              </div>
            </div>

            {/* Third Row - Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* Referral Tracking */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                <h3 className="text-white text-lg font-semibold mb-4">Referral Tracking</h3>
                
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 text-green-400 text-sm mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Referrals</span>
                  </div>
                  <h4 className="text-white text-2xl font-bold">9.3</h4>
                  <p className="text-gray-400 text-sm">Total Score</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Safety</span>
                    <span className="text-white">9.3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Verified</span>
                    <span className="text-green-400">100%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Efficiency</span>
                    <span className="text-white">8.9</span>
                  </div>
                </div>
              </div>

              {/* Sales overview */}
              <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-lg font-semibold">Sales overview</h3>
                  <p className="text-green-400 text-sm">(+5) more in 2021</p>
                </div>
                
                {/* Chart placeholder */}
                <div className="h-48 flex items-end space-x-2 justify-center">
                  {[
                    { height: '60%', month: 'Jan' },
                    { height: '40%', month: 'Feb' },
                    { height: '70%', month: 'Mar' },
                    { height: '50%', month: 'Apr' },
                    { height: '80%', month: 'May' },
                    { height: '65%', month: 'Jun' },
                    { height: '90%', month: 'Jul' },
                    { height: '55%', month: 'Aug' },
                    { height: '75%', month: 'Sep' },
                    { height: '45%', month: 'Oct' },
                    { height: '85%', month: 'Nov' },
                    { height: '70%', month: 'Dec' }
                  ].map((bar, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t"
                        style={{ height: bar.height }}
                      ></div>
                      <span className="text-gray-400 text-xs mt-2">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fourth Row - Active Users and Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* Active Users */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                <h3 className="text-white text-lg font-semibold mb-4">Active Users</h3>
                <p className="text-green-400 text-sm mb-6">(+23) than last week</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">Users</span>
                    </div>
                    <span className="text-white font-semibold">32,984</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">Clicks</span>
                    </div>
                    <span className="text-white font-semibold">2.42m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">Sales</span>
                    </div>
                    <span className="text-white font-semibold">2,400$</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">Items</span>
                    </div>
                    <span className="text-white font-semibold">320</span>
                  </div>
                </div>

                {/* Bar chart placeholder */}
                <div className="mt-6 flex items-end justify-center space-x-2 h-16">
                  {[80, 60, 90, 40, 100, 70, 85, 55, 95].map((height, index) => (
                    <div
                      key={index}
                      className="w-2 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-lg font-semibold">Projects</h3>
                  <DashboardButton 
                    variant="icon"
                    size="icon"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </DashboardButton>
                </div>
                <p className="text-green-400 text-sm mb-6">30 done this month</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">COMPANIES</span>
                    <span className="text-gray-400 text-sm">MEMBERS</span>
                    <span className="text-gray-400 text-sm">BUDGET</span>
                    <span className="text-gray-400 text-sm">COMPLETION</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">C</span>
                      </div>
                      <span className="text-white text-sm">Chakra Soft UI Version</span>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-gray-800"></div>
                      <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
                      <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-gray-800"></div>
                    </div>
                    <span className="text-white text-sm">$14,000</span>
                    <span className="text-white text-sm">60%</span>
                  </div>
                </div>
              </div>

              {/* Orders overview */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-lg font-semibold">Orders overview</h3>
                  <DashboardButton 
                    variant="icon"
                    size="icon"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </DashboardButton>
                </div>
                <p className="text-green-400 text-sm mb-6">+30% this month</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white text-sm font-medium">$2400, Design changes</h5>
                      <p className="text-gray-400 text-xs">22 DEC 7:20 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white text-sm font-medium">New order #1832412</h5>
                      <p className="text-gray-400 text-xs">21 DEC 11 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white text-sm font-medium">Server payments for April</h5>
                      <p className="text-gray-400 text-xs">21 DEC 9:34 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white text-sm font-medium">New card added for order #4395133</h5>
                      <p className="text-gray-400 text-xs">20 DEC 2:20 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white text-sm font-medium">Unlock packages for development</h5>
                      <p className="text-gray-400 text-xs">18 DEC 4:54 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      <h5 className="text-white text-sm font-medium">New order #9583120</h5>
                      <p className="text-gray-400 text-xs">17 DEC</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permission Demo Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-4">Quick Actions (Role-Based)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                
                <PermissionGuard moduleId="users" permission="create">
                  <button className="flex flex-col items-center gap-2 p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors">
                    <Users className="h-6 w-6 text-blue-400" />
                    <span className="text-sm text-white">Add User</span>
                  </button>
                </PermissionGuard>

                <PermissionGuard moduleId="products" permission="create">
                  <button className="flex flex-col items-center gap-2 p-4 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors">
                    <Package className="h-6 w-6 text-green-400" />
                    <span className="text-sm text-white">Add Product</span>
                  </button>
                </PermissionGuard>

                <PermissionGuard moduleId="roles" permission="edit">
                  <button className="flex flex-col items-center gap-2 p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors">
                    <UserPlus className="h-6 w-6 text-purple-400" />
                    <span className="text-sm text-white">Manage Roles</span>
                  </button>
                </PermissionGuard>

                <PermissionGuard moduleId="analytics" permission="view">
                  <button className="flex flex-col items-center gap-2 p-4 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-colors">
                    <Activity className="h-6 w-6 text-orange-400" />
                    <span className="text-sm text-white">View Reports</span>
                  </button>
                </PermissionGuard>

              </div>
              
              {/* Permission Summary */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  Available actions based on your role: <span className="text-white font-medium">{userRole?.name}</span>
                </p>
              </div>
            </div>
          </div>
      </div>
      </Layout>
  );
};

export default DashboardPage; 