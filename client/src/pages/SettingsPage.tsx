import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  Save, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import Layout from '../components/Layout';
import { PermissionGuard } from '../components/PermissionGuard';
import { settingsApi, SystemSettings, OptionItem } from '../services/settingsApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [timezones, setTimezones] = useState<OptionItem[]>([]);
  const [currencies, setCurrencies] = useState<OptionItem[]>([]);
  const [languages, setLanguages] = useState<OptionItem[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
    loadOptions();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [timezonesData, currenciesData, languagesData] = await Promise.all([
        settingsApi.getTimezones(),
        settingsApi.getCurrencies(),
        settingsApi.getLanguages(),
      ]);
      setTimezones(timezonesData);
      setCurrencies(currenciesData);
      setLanguages(languagesData);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsApi.updateSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleCleanupLogs = async () => {
    setCleaning(true);
    try {
      const result = await settingsApi.cleanupLogs();
      setMessage({ 
        type: 'success', 
        text: `Successfully cleaned up ${result.deleted_count} old activity logs` 
      });
    } catch (error) {
      console.error('Failed to cleanup logs:', error);
      setMessage({ type: 'error', text: 'Failed to cleanup logs' });
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return (
      <Layout currentPage="settings" breadcrumb={['System & Admin', 'Settings']}>
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="space-y-4 lg:space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!settings) {
    return (
      <Layout currentPage="settings" breadcrumb={['System & Admin', 'Settings']}>
        <div className="p-3 sm:p-4 lg:p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Failed to load settings. Please try again.</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="settings" breadcrumb={['System & Admin', 'Settings']}>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">System Settings</h1>
              <p className="text-gray-300 mt-1">
                Configure system preferences and security settings
              </p>
            </div>

            <PermissionGuard moduleId="settings" permission="edit">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </PermissionGuard>
          </div>

          {/* Message */}
          {message && (
            <Alert className={message.type === 'error' ? 'border-red-500/20 bg-red-500/10' : message.type === 'success' ? 'border-green-500/20 bg-green-500/10' : 'border-blue-500/20 bg-blue-500/10'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : message.type === 'error' ? (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              ) : (
                <Info className="h-4 w-4 text-blue-400" />
              )}
              <AlertDescription className={message.type === 'error' ? 'text-red-300' : message.type === 'success' ? 'text-green-300' : 'text-blue-300'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Settings Tabs */}
          <Tabs defaultValue="activity-logs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
              <TabsTrigger value="activity-logs" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Database className="h-4 w-4" />
                Activity Logs
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Globe className="h-4 w-4" />
                General
              </TabsTrigger>
            </TabsList>

            {/* Activity Logs Tab */}
            <TabsContent value="activity-logs" className="space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                    <Database className="h-5 w-5" />
                    Activity Logs Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="retention-days" className="text-sm font-medium text-gray-300">Log Retention Period (Days)</Label>
                      <Input
                        id="retention-days"
                        type="number"
                        min="1"
                        max="3650"
                        value={settings.activity_logs_retention_days}
                        onChange={(e) => handleSettingChange('activity_logs_retention_days', parseInt(e.target.value))}
                        className="mt-2 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        Logs older than this period will be automatically deleted
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="audit-logging" className="text-sm font-medium text-gray-300">Enable Audit Logging</Label>
                        <p className="text-sm text-gray-400 mt-1">
                          Log all system activities for security and compliance
                        </p>
                      </div>
                      <Switch
                        id="audit-logging"
                        checked={settings.enable_audit_logging}
                        onCheckedChange={(checked) => handleSettingChange('enable_audit_logging', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sensitive-actions" className="text-sm font-medium text-gray-300">Log Sensitive Actions</Label>
                        <p className="text-sm text-gray-400 mt-1">
                          Log password changes, permission updates, and other sensitive operations
                        </p>
                      </div>
                      <Switch
                        id="sensitive-actions"
                        checked={settings.log_sensitive_actions}
                        onCheckedChange={(checked) => handleSettingChange('log_sensitive_actions', checked)}
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-600" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Manual Log Cleanup</h3>
                        <p className="text-sm text-gray-400">
                          Manually clean up old activity logs based on current retention settings
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleCleanupLogs}
                        disabled={cleaning}
                        className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                        {cleaning ? 'Cleaning...' : 'Clean Up Logs'}
                      </Button>
                    </div>
                    <Alert className="border-blue-500/20 bg-blue-500/10">
                      <Info className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-blue-300">
                        This will permanently delete activity logs older than {settings.activity_logs_retention_days} days.
                        This action cannot be undone.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="session-timeout" className="text-sm font-medium text-gray-300">Session Timeout (Minutes)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        min="15"
                        max="1440"
                        value={settings.session_timeout_minutes}
                        onChange={(e) => handleSettingChange('session_timeout_minutes', parseInt(e.target.value))}
                        className="mt-2 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        Users will be automatically logged out after this period of inactivity
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="two-factor" className="text-sm font-medium text-gray-300">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-400 mt-1">
                          Require 2FA for all user accounts
                        </p>
                      </div>
                      <Switch
                        id="two-factor"
                        checked={settings.enable_two_factor_auth}
                        onCheckedChange={(checked) => handleSettingChange('enable_two_factor_auth', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance-mode" className="text-sm font-medium text-gray-300">Maintenance Mode</Label>
                        <p className="text-sm text-gray-400 mt-1">
                          Temporarily disable system access for maintenance
                        </p>
                      </div>
                      <Switch
                        id="maintenance-mode"
                        checked={settings.maintenance_mode}
                        onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications" className="text-sm font-medium text-gray-300">Email Notifications</Label>
                        <p className="text-sm text-gray-400 mt-1">
                          Send system notifications via email
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={settings.enable_email_notifications}
                        onCheckedChange={(checked) => handleSettingChange('enable_email_notifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notifications" className="text-sm font-medium text-gray-300">SMS Notifications</Label>
                        <p className="text-sm text-gray-400 mt-1">
                          Send critical alerts via SMS
                        </p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={settings.enable_sms_notifications}
                        onCheckedChange={(checked) => handleSettingChange('enable_sms_notifications', checked)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="notification-email" className="text-sm font-medium text-gray-300">Notification Email Address</Label>
                      <Input
                        id="notification-email"
                        type="email"
                        value={settings.notification_email || ''}
                        onChange={(e) => handleSettingChange('notification_email', e.target.value)}
                        className="mt-2 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="admin@company.com"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        Primary email address for system notifications
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                    <Globe className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="timezone" className="text-sm font-medium text-gray-300">Timezone</Label>
                      <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                        <SelectTrigger className="mt-2 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value} className="text-white hover:bg-gray-700">
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currency" className="text-sm font-medium text-gray-300">Currency</Label>
                      <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                        <SelectTrigger className="mt-2 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value} className="text-white hover:bg-gray-700">
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language" className="text-sm font-medium text-gray-300">Language</Label>
                      <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                        <SelectTrigger className="mt-2 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value} className="text-white hover:bg-gray-700">
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date-format" className="text-sm font-medium text-gray-300">Date Format</Label>
                      <Select value={settings.date_format} onValueChange={(value) => handleSettingChange('date_format', value)}>
                        <SelectTrigger className="mt-2 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="Y-m-d" className="text-white hover:bg-gray-700">YYYY-MM-DD</SelectItem>
                          <SelectItem value="d/m/Y" className="text-white hover:bg-gray-700">DD/MM/YYYY</SelectItem>
                          <SelectItem value="m/d/Y" className="text-white hover:bg-gray-700">MM/DD/YYYY</SelectItem>
                          <SelectItem value="d-m-Y" className="text-white hover:bg-gray-700">DD-MM-YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="time-format" className="text-sm font-medium text-gray-300">Time Format</Label>
                      <Select value={settings.time_format} onValueChange={(value) => handleSettingChange('time_format', value)}>
                        <SelectTrigger className="mt-2 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="H:i" className="text-white hover:bg-gray-700">24-hour (HH:MM)</SelectItem>
                          <SelectItem value="12h" className="text-white hover:bg-gray-700">12-hour (AM/PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
