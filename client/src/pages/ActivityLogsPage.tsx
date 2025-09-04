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
      <DialogContent className="max-w-4xl max-h-[85vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-600 shadow-2xl" showCloseButton={false}>
        <DialogHeader className="pb-6 border-b border-gray-700 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedLog(null)}
            className="absolute top-2 right-2 h-10 w-10 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
          <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white pr-16">
            <div className="flex items-center gap-3">
              {getSeverityIcon(log.severity_level)}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {log.action_display_name}
              </span>
            </div>
            <div className="ml-auto">
              <Badge
                variant={log.severity_level === 'high' ? 'destructive' : 'secondary'}
                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider ${
                  log.severity_level === 'high' 
                    ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                    : log.severity_level === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                    : 'bg-green-500/20 text-green-400 border-green-500/40'
                }`}
              >
                {log.severity_level} Severity
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-8 overflow-y-auto max-h-[60vh] pr-2">
          {/* Date & Time Section */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Date & Time</h3>
            </div>
            <p className="text-xl text-white font-mono bg-gray-700 px-4 py-2 rounded-md">
              {formatDate(log.created_at)}
            </p>
          </div>

          {log.user && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">User</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full flex items-center justify-center border-2 border-blue-500/40 shadow-lg">
                  <User className="h-8 w-8 text-blue-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl text-white font-semibold">{log.user.name}</p>
                  <p className="text-blue-300 font-mono text-sm bg-gray-700 px-3 py-1 rounded-md">
                    {log.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {log.entity_type && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-white">Entity</h3>
              </div>
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg p-4">
                <p className="text-white font-medium text-lg">
                  <span className="text-emerald-300 font-semibold">{log.entity_type}</span>
                  <span className="text-gray-300 mx-2">•</span>
                  <span className="text-emerald-200 font-mono">#{log.entity_id}</span>
                </p>
              </div>
            </div>
          )}

          {log.ip_address && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-white">IP Address</h3>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-200 font-mono font-bold text-lg tracking-wider">
                  {log.ip_address}
                </p>
              </div>
            </div>
          )}

          {log.user_agent && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-white">User Agent</h3>
              </div>
              <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
                <p className="text-violet-200 text-sm leading-relaxed break-words">
                  {log.user_agent}
                </p>
              </div>
            </div>
          )}

          {log.details && Object.keys(log.details).length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-white">Details</h3>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                <pre className="text-sm text-rose-200 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
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
                Monitor system activities and user actions across your organization. Track who did what, when, and where for security and compliance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <PermissionGuard moduleId="activity-logs" permission="view">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
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
            <div className="mb-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 mb-2">💡 Filter Tips:</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• <strong>Search:</strong> Find specific actions, users, or details across all logs</li>
                <li>• <strong>Action Type:</strong> Filter by what was done (login, create, update, delete, etc.)</li>
                <li>• <strong>User:</strong> See actions performed by a specific person</li>
                <li>• <strong>Entity Type:</strong> Focus on what was affected (users, orders, products, etc.)</li>
                <li>• <strong>Date Range:</strong> Narrow down to specific time periods</li>
              </ul>
            </div>
          )}
          
          {/* Filters Card */}
          {showFilters && (
            <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-purple-400" />
                    Filters
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                    className="h-8 w-8 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-300">
                      Search
                      <span className="text-xs text-gray-500 ml-1">(searches action names, user names, and details)</span>
                    </label>
                    <Input
                      placeholder="Search logs..."
                      value={filters.search || ''}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-300">
                      Action Type
                      <span className="text-xs text-gray-500 ml-1">(what was done - login, create, update, delete, etc.)</span>
                    </label>
                    <Select value={filters.action || 'all'} onValueChange={(value) => handleFilterChange('action', value === 'all' ? undefined : value)}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="All actions" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All actions</SelectItem>
                        {filterOptions.actions.map((action) => (
                          <SelectItem key={action.value} value={action.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-300">
                      User
                      <span className="text-xs text-gray-500 ml-1">(who performed the action)</span>
                    </label>
                    <Select value={filters.user_id?.toString() || 'all'} onValueChange={(value) => handleFilterChange('user_id', value === 'all' ? undefined : parseInt(value))}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="All users" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All users</SelectItem>
                        {filterOptions.users.map((user) => (
                          <SelectItem key={user.value} value={user.value.toString()} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                            {user.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-300">
                      Entity Type
                      <span className="text-xs text-gray-500 ml-1">(what was affected - user, order, product, etc.)</span>
                    </label>
                    <Select value={filters.entity_type || 'all'} onValueChange={(value) => handleFilterChange('entity_type', value === 'all' ? undefined : value)}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="All entities" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All entities</SelectItem>
                        {filterOptions.entity_types.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-300">
                      Start Date
                      <span className="text-xs text-gray-500 ml-1">(logs from this date onwards)</span>
                    </label>
                    <Input
                      type="date"
                      value={filters.start_date || ''}
                      onChange={(e) => handleFilterChange('start_date', e.target.value)}
                      className="w-full bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-300">
                      End Date
                      <span className="text-xs text-gray-500 ml-1">(logs up to this date)</span>
                    </label>
                    <Input
                      type="date"
                      value={filters.end_date || ''}
                      onChange={(e) => handleFilterChange('end_date', e.target.value)}
                      className="w-full bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2 flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex items-center gap-2 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
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
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">
                          Action
                          <div className="text-xs font-normal text-gray-500 mt-1">What was done</div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">
                          User
                          <div className="text-xs font-normal text-gray-500 mt-1">Who did it</div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">
                          Entity
                          <div className="text-xs font-normal text-gray-500 mt-1">What was affected</div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">
                          IP Address
                          <div className="text-xs font-normal text-gray-500 mt-1">Where it came from</div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">
                          Date & Time
                          <div className="text-xs font-normal text-gray-500 mt-1">When it happened</div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-300">
                          Actions
                          <div className="text-xs font-normal text-gray-500 mt-1">View details</div>
                        </th>
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