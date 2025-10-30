import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Layout from '../components/Layout';
import { PermissionGuard } from '../components/PermissionGuard';
import { activityLogsApi, ActivityLog, ActivityLogFilters, FilterOptions } from '../services/activityLogsApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    actions: [],
    entity_types: [],
    users: [],
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0,
  });
  const [filters, setFilters] = useState<ActivityLogFilters>({});
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load logs when filters or page changes
  useEffect(() => {
    loadLogs();
  }, [filters, pagination.current_page]);

  const loadFilterOptions = async () => {
    try {
      const options = await activityLogsApi.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await activityLogsApi.getLogs(filters, pagination.current_page);
      setLogs(response.logs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ActivityLogFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await activityLogsApi.downloadCsv(filters);
    } catch (error) {
      console.error('Failed to export logs:', error);
    } finally {
      setExporting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const clearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const LogDetailModal: React.FC<{ log: ActivityLog }> = ({ log }) => (
    <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white">
            {getSeverityIcon(log.severity_level)}
            {log.action_display_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Date & Time</label>
              <p className="text-white font-medium">{formatDate(log.created_at)}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Severity</label>
              <Badge
                variant={log.severity_level === 'high' ? 'destructive' : 'secondary'}
                className="font-medium"
              >
                {log.severity_level}
              </Badge>
            </div>
          </div>

          {log.user && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">User</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-gray-600">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{log.user.name}</p>
                  <p className="text-gray-400 text-sm">{log.user.email}</p>
                </div>
              </div>
            </div>
          )}

          {log.entity_type && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Entity</label>
              <p className="text-white font-medium">
                <span className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-300 px-3 py-1 rounded-md border border-gray-600">
                  {log.entity_type} #{log.entity_id}
                </span>
              </p>
            </div>
          )}

          {log.ip_address && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">IP Address</label>
              <p className="text-white font-mono font-medium bg-gray-800 px-3 py-2 rounded-md border border-gray-600">
                {log.ip_address}
              </p>
            </div>
          )}

          {log.user_agent && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">User Agent</label>
              <p className="text-gray-300 break-all bg-gray-800 p-3 rounded-md border border-gray-600 text-sm">
                {log.user_agent}
              </p>
            </div>
          )}

          {log.details && Object.keys(log.details).length > 0 && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Details</label>
              <pre className="text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto border border-gray-600 text-gray-300">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Layout currentPage="activity-logs" breadcrumb={['System & Admin', 'Activity Logs']}>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
              <p className="text-gray-300 mt-1">
                Monitor system activities and user actions across your organization
              </p>
            </div>

            <div className="flex items-center gap-2">
              <PermissionGuard moduleId="activity-logs" permission="view">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
                >
                  <Download className="h-4 w-4" />
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-white">Filters</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Search</label>
                    <Input
                      placeholder="Search logs..."
                      value={filters.search || ''}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Action</label>
                    <Select value={filters.action || ''} onValueChange={(value) => handleFilterChange('action', value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="All actions" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="">All actions</SelectItem>
                        {filterOptions.actions.map((action) => (
                          <SelectItem key={action.value} value={action.value} className="text-white hover:bg-gray-700">
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">User</label>
                    <Select value={filters.user_id?.toString() || ''} onValueChange={(value) => handleFilterChange('user_id', value ? parseInt(value) : undefined)}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="All users" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="">All users</SelectItem>
                        {filterOptions.users.map((user) => (
                          <SelectItem key={user.value} value={user.value.toString()} className="text-white hover:bg-gray-700">
                            {user.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Entity Type</label>
                    <Select value={filters.entity_type || ''} onValueChange={(value) => handleFilterChange('entity_type', value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="All entities" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="">All entities</SelectItem>
                        {filterOptions.entity_types.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-700">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Start Date</label>
                    <Input
                      type="date"
                      value={filters.start_date || ''}
                      onChange={(e) => handleFilterChange('start_date', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">End Date</label>
                    <Input
                      type="date"
                      value={filters.end_date || ''}
                      onChange={(e) => handleFilterChange('end_date', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2 flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logs Table */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="text-xl font-semibold text-white">Activity Logs</span>
                <span className="text-sm font-normal text-gray-400">
                  Showing {pagination.from}-{pagination.to} of {pagination.total} logs
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-4 w-4 bg-gray-700" />
                      <Skeleton className="h-4 flex-1 bg-gray-700" />
                      <Skeleton className="h-4 w-24 bg-gray-700" />
                      <Skeleton className="h-4 w-32 bg-gray-700" />
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No activity logs found</h3>
                  <p className="text-gray-400">Try adjusting your filters or check back later.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">Action</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">User</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">Entity</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">IP Address</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">Date & Time</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {getSeverityIcon(log.severity_level)}
                              <span className="font-medium text-white">{log.action_display_name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {log.user ? (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-gray-600">
                                  <User className="h-4 w-4 text-blue-400" />
                                </div>
                                <span className="text-white">{log.user.name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 font-medium">System</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {log.entity_type ? (
                              <span className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
                                {log.entity_type} #{log.entity_id}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-mono text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
                              {log.ip_address || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-300">{formatDate(log.created_at)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-600">
                  <div className="text-sm text-gray-400">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} results
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <span className="text-sm text-gray-400 font-medium">
                      Page {pagination.current_page} of {pagination.last_page}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && <LogDetailModal log={selectedLog} />}
    </Layout>
  );
};

export default ActivityLogsPage;
