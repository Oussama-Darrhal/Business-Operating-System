<?php

namespace App\Http\Controllers;

use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get system settings for the authenticated user's SME.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user->sme_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to access settings',
                ], 400);
            }

            // Get settings from cache or database
            $settings = $this->getSettings($user->sme_id);

            return response()->json([
                'success' => true,
                'data' => $settings,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch settings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update system settings.
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user->sme_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to update settings',
                ], 400);
            }

            $validator = Validator::make($request->all(), [
                'activity_logs_retention_days' => 'nullable|integer|min:1|max:3650', // Max 10 years
                'session_timeout_minutes' => 'nullable|integer|min:15|max:1440', // 15 min to 24 hours
                'enable_two_factor_auth' => 'nullable|boolean',
                'enable_email_notifications' => 'nullable|boolean',
                'enable_sms_notifications' => 'nullable|boolean',
                'notification_email' => 'nullable|email',
                'timezone' => 'nullable|string|max:50',
                'date_format' => 'nullable|string|in:Y-m-d,d/m/Y,m/d/Y,d-m-Y',
                'time_format' => 'nullable|string|in:H:i,12h',
                'currency' => 'nullable|string|max:10',
                'language' => 'nullable|string|max:10',
                'maintenance_mode' => 'nullable|boolean',
                'enable_audit_logging' => 'nullable|boolean',
                'log_sensitive_actions' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray(),
                ], 422);
            }

            $settings = $request->only([
                'activity_logs_retention_days',
                'session_timeout_minutes',
                'enable_two_factor_auth',
                'enable_email_notifications',
                'enable_sms_notifications',
                'notification_email',
                'timezone',
                'date_format',
                'time_format',
                'currency',
                'language',
                'maintenance_mode',
                'enable_audit_logging',
                'log_sensitive_actions',
            ]);

            // Update settings
            $this->updateSettings($user->sme_id, $settings);

            // Log settings update
            ActivityLogService::logSystemAction('system.settings_updated', [
                'updated_by' => $user->id,
                'updated_settings' => array_keys($settings),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $this->getSettings($user->sme_id),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available timezone options.
     */
    public function timezones(): JsonResponse
    {
        try {
            $timezones = [
                ['value' => 'UTC', 'label' => 'UTC (Coordinated Universal Time)'],
                ['value' => 'America/New_York', 'label' => 'Eastern Time (ET)'],
                ['value' => 'America/Chicago', 'label' => 'Central Time (CT)'],
                ['value' => 'America/Denver', 'label' => 'Mountain Time (MT)'],
                ['value' => 'America/Los_Angeles', 'label' => 'Pacific Time (PT)'],
                ['value' => 'Europe/London', 'label' => 'London (GMT/BST)'],
                ['value' => 'Europe/Paris', 'label' => 'Paris (CET/CEST)'],
                ['value' => 'Europe/Berlin', 'label' => 'Berlin (CET/CEST)'],
                ['value' => 'Asia/Tokyo', 'label' => 'Tokyo (JST)'],
                ['value' => 'Asia/Shanghai', 'label' => 'Shanghai (CST)'],
                ['value' => 'Asia/Dubai', 'label' => 'Dubai (GST)'],
                ['value' => 'Australia/Sydney', 'label' => 'Sydney (AEST/AEDT)'],
            ];

            return response()->json([
                'success' => true,
                'data' => $timezones,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch timezones',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available currency options.
     */
    public function currencies(): JsonResponse
    {
        try {
            $currencies = [
                ['value' => 'USD', 'label' => 'US Dollar ($)'],
                ['value' => 'EUR', 'label' => 'Euro (€)'],
                ['value' => 'GBP', 'label' => 'British Pound (£)'],
                ['value' => 'JPY', 'label' => 'Japanese Yen (¥)'],
                ['value' => 'CAD', 'label' => 'Canadian Dollar (C$)'],
                ['value' => 'AUD', 'label' => 'Australian Dollar (A$)'],
                ['value' => 'CHF', 'label' => 'Swiss Franc (CHF)'],
                ['value' => 'CNY', 'label' => 'Chinese Yuan (¥)'],
                ['value' => 'INR', 'label' => 'Indian Rupee (₹)'],
                ['value' => 'BRL', 'label' => 'Brazilian Real (R$)'],
            ];

            return response()->json([
                'success' => true,
                'data' => $currencies,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch currencies',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available language options.
     */
    public function languages(): JsonResponse
    {
        try {
            $languages = [
                ['value' => 'en', 'label' => 'English'],
                ['value' => 'es', 'label' => 'Español'],
                ['value' => 'fr', 'label' => 'Français'],
                ['value' => 'de', 'label' => 'Deutsch'],
                ['value' => 'it', 'label' => 'Italiano'],
                ['value' => 'pt', 'label' => 'Português'],
                ['value' => 'ru', 'label' => 'Русский'],
                ['value' => 'ja', 'label' => '日本語'],
                ['value' => 'zh', 'label' => '中文'],
                ['value' => 'ar', 'label' => 'العربية'],
            ];

            return response()->json([
                'success' => true,
                'data' => $languages,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch languages',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clean up old activity logs based on retention settings.
     */
    public function cleanupLogs(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user->sme_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to perform cleanup',
                ], 400);
            }

            $settings = $this->getSettings($user->sme_id);
            $retentionDays = $settings['activity_logs_retention_days'] ?? 90;

            $deletedCount = ActivityLogService::cleanupOldLogs($retentionDays);

            // Log cleanup action
            ActivityLogService::logSystemAction('system.logs_cleanup', [
                'deleted_count' => $deletedCount,
                'retention_days' => $retentionDays,
                'performed_by' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully cleaned up {$deletedCount} old activity logs",
                'data' => [
                    'deleted_count' => $deletedCount,
                    'retention_days' => $retentionDays,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cleanup logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get settings for a specific SME.
     */
    private function getSettings(int $smeId): array
    {
        $cacheKey = "sme_settings_{$smeId}";

        return Cache::remember($cacheKey, 3600, function () use ($smeId) {
            // In a real implementation, you might store settings in a database table
            // For now, we'll return default settings
            return [
                'activity_logs_retention_days' => 90,
                'session_timeout_minutes' => 120,
                'enable_two_factor_auth' => false,
                'enable_email_notifications' => true,
                'enable_sms_notifications' => false,
                'notification_email' => null,
                'timezone' => 'UTC',
                'date_format' => 'Y-m-d',
                'time_format' => 'H:i',
                'currency' => 'USD',
                'language' => 'en',
                'maintenance_mode' => false,
                'enable_audit_logging' => true,
                'log_sensitive_actions' => true,
            ];
        });
    }

    /**
     * Update settings for a specific SME.
     */
    private function updateSettings(int $smeId, array $settings): void
    {
        $cacheKey = "sme_settings_{$smeId}";

        // In a real implementation, you would save to database
        // For now, we'll just update the cache
        $currentSettings = $this->getSettings($smeId);
        $updatedSettings = array_merge($currentSettings, $settings);

        Cache::put($cacheKey, $updatedSettings, 3600);
    }
}



