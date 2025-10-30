<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    /**
     * Log an activity with automatic user and request context.
     */
    public static function log(
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $details = null,
        ?Request $request = null
    ): ActivityLog {
        $request = $request ?? request();
        $user = Auth::user();

        return ActivityLog::create([
            'sme_id' => $user?->sme_id,
            'user_id' => $user?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'details' => $details,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }

    /**
     * Log authentication events.
     */
    public static function logAuth(string $action, ?array $details = null): ActivityLog
    {
        return self::log($action, null, null, $details);
    }

    /**
     * Log user management events.
     */
    public static function logUserAction(string $action, int $userId, ?array $details = null): ActivityLog
    {
        return self::log($action, 'user', $userId, $details);
    }

    /**
     * Log role management events.
     */
    public static function logRoleAction(string $action, int $roleId, ?array $details = null): ActivityLog
    {
        return self::log($action, 'role', $roleId, $details);
    }

    /**
     * Log SME management events.
     */
    public static function logSmeAction(string $action, int $smeId, ?array $details = null): ActivityLog
    {
        return self::log($action, 'sme', $smeId, $details);
    }

    /**
     * Log permission-related events.
     */
    public static function logPermissionAction(string $action, ?array $details = null): ActivityLog
    {
        return self::log($action, 'permission', null, $details);
    }

    /**
     * Log system configuration events.
     */
    public static function logSystemAction(string $action, ?array $details = null): ActivityLog
    {
        return self::log($action, 'system', null, $details);
    }

    /**
     * Get activity logs with filtering and pagination.
     */
    public static function getLogs(array $filters = [], int $perPage = 20)
    {
        $query = ActivityLog::with(['user', 'sme'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (!empty($filters['sme_id'])) {
            $query->forSme($filters['sme_id']);
        }

        if (!empty($filters['user_id'])) {
            $query->forUser($filters['user_id']);
        }

        if (!empty($filters['action'])) {
            $query->forAction($filters['action']);
        }

        if (!empty($filters['entity_type'])) {
            $query->forEntityType($filters['entity_type']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->inDateRange($filters['start_date'], $filters['end_date']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('entity_type', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Export activity logs to CSV.
     */
    public static function exportToCsv(array $filters = []): string
    {
        $logs = self::getLogs($filters, 10000); // Get all logs for export

        $filename = 'activity_logs_' . date('Y-m-d_H-i-s') . '.csv';
        $filepath = storage_path('app/exports/' . $filename);

        // Ensure directory exists
        if (!file_exists(dirname($filepath))) {
            mkdir(dirname($filepath), 0755, true);
        }

        $handle = fopen($filepath, 'w');

        // Write CSV header
        fputcsv($handle, [
            'ID',
            'Date/Time',
            'Action',
            'User',
            'SME',
            'Entity Type',
            'Entity ID',
            'IP Address',
            'User Agent',
            'Details'
        ]);

        // Write data rows
        foreach ($logs as $log) {
            fputcsv($handle, [
                $log->id,
                $log->created_at->format('Y-m-d H:i:s'),
                $log->action_display_name,
                $log->user?->name ?? 'System',
                $log->sme?->name ?? 'N/A',
                $log->entity_type ?? 'N/A',
                $log->entity_id ?? 'N/A',
                $log->ip_address ?? 'N/A',
                $log->user_agent ?? 'N/A',
                json_encode($log->details ?? [])
            ]);
        }

        fclose($handle);

        return $filepath;
    }

    /**
     * Clean up old activity logs based on retention policy.
     */
    public static function cleanupOldLogs(int $retentionDays = 90): int
    {
        $cutoffDate = now()->subDays($retentionDays);

        return ActivityLog::where('created_at', '<', $cutoffDate)->delete();
    }

    /**
     * Get activity statistics for dashboard.
     */
    public static function getStatistics(int $smeId, int $days = 30): array
    {
        $startDate = now()->subDays($days);

        $totalLogs = ActivityLog::forSme($smeId)
            ->where('created_at', '>=', $startDate)
            ->count();

        $uniqueUsers = ActivityLog::forSme($smeId)
            ->where('created_at', '>=', $startDate)
            ->distinct('user_id')
            ->count('user_id');

        $actionBreakdown = ActivityLog::forSme($smeId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->action => $item->count];
            })
            ->toArray();

        $dailyActivity = ActivityLog::forSme($smeId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->date => $item->count];
            })
            ->toArray();

        return [
            'total_logs' => $totalLogs,
            'unique_users' => $uniqueUsers,
            'action_breakdown' => $actionBreakdown,
            'daily_activity' => $dailyActivity,
            'period_days' => $days
        ];
    }
}
