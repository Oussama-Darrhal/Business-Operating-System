import { api } from '../utils/api';

export interface SystemSettings {
  activity_logs_retention_days: number;
  session_timeout_minutes: number;
  enable_two_factor_auth: boolean;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  notification_email: string | null;
  timezone: string;
  date_format: string;
  time_format: string;
  currency: string;
  language: string;
  maintenance_mode: boolean;
  enable_audit_logging: boolean;
  log_sensitive_actions: boolean;
}

export interface OptionItem {
  value: string;
  label: string;
}

export interface CleanupResponse {
  deleted_count: number;
  retention_days: number;
}

class SettingsApi {
  /**
   * Get system settings
   */
  async getSettings(): Promise<SystemSettings> {
    const response = await api.get('/settings');
    return response.data.data;
  }

  /**
   * Update system settings
   */
  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const response = await api.put('/settings', settings);
    return response.data.data;
  }

  /**
   * Get available timezone options
   */
  async getTimezones(): Promise<OptionItem[]> {
    const response = await api.get('/settings/timezones');
    return response.data.data;
  }

  /**
   * Get available currency options
   */
  async getCurrencies(): Promise<OptionItem[]> {
    const response = await api.get('/settings/currencies');
    return response.data.data;
  }

  /**
   * Get available language options
   */
  async getLanguages(): Promise<OptionItem[]> {
    const response = await api.get('/settings/languages');
    return response.data.data;
  }

  /**
   * Clean up old activity logs
   */
  async cleanupLogs(): Promise<CleanupResponse> {
    const response = await api.post('/settings/cleanup-logs');
    return response.data.data;
  }
}

export const settingsApi = new SettingsApi();



