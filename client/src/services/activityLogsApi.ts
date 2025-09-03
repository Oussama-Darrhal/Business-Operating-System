import { api } from '../utils/api';

export interface ActivityLog {
  id: number;
  action: string;
  action_display_name: string;
  entity_type: string | null;
  entity_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
  severity_level: 'high' | 'medium' | 'low';
  severity_color: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  sme: {
    id: number;
    name: string;
  } | null;
}

export interface ActivityLogFilters {
  user_id?: number;
  action?: string;
  entity_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  per_page?: number;
}

export interface ActivityLogResponse {
  logs: ActivityLog[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface ActivityLogStatistics {
  total_logs: number;
  unique_users: number;
  action_breakdown: Record<string, number>;
  daily_activity: Record<string, number>;
  period_days: number;
}

export interface FilterOptions {
  actions: Array<{ value: string; label: string }>;
  entity_types: Array<{ value: string; label: string }>;
  users: Array<{ value: number; label: string }>;
}

export interface ExportResponse {
  download_url: string;
  filename: string;
}

class ActivityLogsApi {
  /**
   * Get activity logs with filtering and pagination
   */
  async getLogs(filters: ActivityLogFilters = {}, page: number = 1): Promise<ActivityLogResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/activity-logs?${params}`);
    return response.data.data;
  }

  /**
   * Get a specific activity log by ID
   */
  async getLog(id: number): Promise<ActivityLog> {
    const response = await api.get(`/api/activity-logs/${id}`);
    return response.data.data;
  }

  /**
   * Get filter options for activity logs
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await api.get('/api/activity-logs/filter-options');
    return response.data.data;
  }

  /**
   * Get activity statistics
   */
  async getStatistics(days: number = 30): Promise<ActivityLogStatistics> {
    const response = await api.get(`/api/activity-logs/statistics?days=${days}`);
    return response.data.data;
  }

  /**
   * Export activity logs to CSV
   */
  async exportLogs(filters: ActivityLogFilters = {}): Promise<ExportResponse> {
    const response = await api.post('/api/activity-logs/export', filters);
    return response.data.data;
  }

  /**
   * Download exported CSV file
   */
  async downloadExport(filename: string): Promise<Blob> {
    const response = await api.get(`/api/activity-logs/download/${filename}`);
    return response.data.data;
  }

  /**
   * Helper method to trigger CSV download
   */
  async downloadCsv(filters: ActivityLogFilters = {}): Promise<void> {
    try {
      const exportData = await this.exportLogs(filters);
      
      // Download the file
      const blob = await this.downloadExport(exportData.filename);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CSV:', error);
      throw error;
    }
  }
}

export const activityLogsApi = new ActivityLogsApi();

