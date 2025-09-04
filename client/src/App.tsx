import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import UsersManagementPage from './pages/UsersManagementPage';
import RoleManagementPage from './pages/RoleManagementPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import CustomerReviewsPage from './pages/CustomerReviewsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import ResponseManagementPage from './pages/ResponseManagementPage';
import ReviewsComplaintsOverviewPage from './pages/ReviewsComplaintsOverviewPage';
import { ProtectedRoute as PermissionProtectedRoute } from './components/ProtectedRoute';
import { ReactNode } from 'react';

// Simple auth-only route component for routes that don't need specific permissions
const AuthOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-500"></div>
          <p className="text-gray-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route component - redirects authenticated users
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-500"></div>
          <p className="text-gray-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App w-full h-screen overflow-hidden">
          <Routes>
            {/* Public routes - redirect to dashboard if authenticated */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes - require authentication and specific permissions */}
            <Route 
              path="/dashboard" 
              element={
                <PermissionProtectedRoute moduleId="dashboard" permission="view">
                  <DashboardPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/company-profile" 
              element={
                <PermissionProtectedRoute moduleId="company-profile" permission="view">
                  <CompanyProfilePage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/users-management" 
              element={
                <PermissionProtectedRoute moduleId="users" permission="view">
                  <UsersManagementPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/role-management" 
              element={
                <PermissionProtectedRoute moduleId="roles" permission="view">
                  <RoleManagementPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/activity-logs" 
              element={
                <PermissionProtectedRoute moduleId="activity-logs" permission="view">
                  <ActivityLogsPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PermissionProtectedRoute moduleId="settings" permission="view">
                  <SettingsPage />
                </PermissionProtectedRoute>
              } 
            />
            
            {/* Additional potential routes that need protection */}
            <Route 
              path="/users" 
              element={<Navigate to="/users-management" replace />} 
            />
            <Route 
              path="/roles" 
              element={<Navigate to="/role-management" replace />} 
            />
            <Route 
              path="/profile" 
              element={<Navigate to="/company-profile" replace />} 
            />
            <Route 
              path="/reviews" 
              element={<Navigate to="/reviews-complaints-overview" replace />} 
            />
            <Route 
              path="/feedback" 
              element={<Navigate to="/reviews-complaints-overview" replace />} 
            />
            
            {/* Protected routes for modules that don't have pages yet */}
            <Route 
              path="/products" 
              element={
                <PermissionProtectedRoute moduleId="products" permission="view">
                  <NotFoundPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route
              path="/inventory"
              element={
                <PermissionProtectedRoute moduleId="products" permission="view">
                  <NotFoundPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/stock" 
              element={
                <PermissionProtectedRoute moduleId="stock" permission="view">
                  <NotFoundPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/categories" 
              element={
                <PermissionProtectedRoute moduleId="categories" permission="view">
                  <NotFoundPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/warehouses" 
              element={
                <PermissionProtectedRoute moduleId="warehouses" permission="view">
                  <NotFoundPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <PermissionProtectedRoute moduleId="analytics" permission="view">
                  <NotFoundPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/reviews-complaints-overview" 
              element={
                <PermissionProtectedRoute moduleId="reviews" permission="view">
                  <ReviewsComplaintsOverviewPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/customer-reviews" 
              element={
                <PermissionProtectedRoute moduleId="reviews" permission="view">
                  <CustomerReviewsPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/complaints" 
              element={
                <PermissionProtectedRoute moduleId="complaints" permission="view">
                  <ComplaintsPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/ai-analysis" 
              element={
                <PermissionProtectedRoute moduleId="ai-analysis" permission="view">
                  <AIAnalysisPage />
                </PermissionProtectedRoute>
              }
            />
            <Route 
              path="/response-management" 
              element={
                <PermissionProtectedRoute moduleId="response-management" permission="view">
                  <ResponseManagementPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PermissionProtectedRoute moduleId="settings" permission="view">
                  <NotFoundPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route 
              path="/activity-logs" 
              element={
                <PermissionProtectedRoute moduleId="activity-logs" permission="view">
                  <NotFoundPage />
                </PermissionProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 - Must be last and requires authentication to see personalized content */}
            <Route 
              path="*" 
              element={
                <AuthOnlyRoute>
                  <NotFoundPage />
                </AuthOnlyRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
