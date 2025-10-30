<?php

namespace App\Http\Controllers;

use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ActivityLogController extends Controller
{
    /**
     * Get activity logs with filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // if (!$user->sme_id) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'User must be connected to an SME to access activity logs',
            //     ], 400);
            // }

            // Validate filters
            $request->validate([
                'user_id' => 'nullable|integer|exists:users,id',
                'action' => 'nullable|string|max:100',
                'entity_type' => 'nullable|string|max:100',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'search' => 'nullable|string|max:255',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            $filters = $request->only([
                'user_id', 'action', 'entity_type', 'start_date', 'end_date', 'search'
            ]);

            // Always filter by current SME
            $filters['sme_id'] = $user->sme_id;

            $perPage = $request->get('per_page', 20);

            $logs = ActivityLogService::getLogs($filters, $perPage);

            // Transform the data for frontend consumption
            $transformedLogs = $logs->getCollection()->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'action_display_name' => $log->action_display_name,
                    'entity_type' => $log->entity_type,
                    'entity_id' => $log->entity_id,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'details' => $log->details,
                    'severity_level' => $log->severity_level,
                    'severity_color' => $log->severity_color,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ] : null,
                    'sme' => $log->sme ? [
                        'id' => $log->sme->id,
                        'name' => $log->sme->name,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'logs' => $transformedLogs,
                    'pagination' => [
                        'current_page' => $logs->currentPage(),
                        'last_page' => $logs->lastPage(),
                        'per_page' => $logs->perPage(),
                        'total' => $logs->total(),
                        'from' => $logs->firstItem(),
                        'to' => $logs->lastItem(),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific activity log by ID.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user->sme_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to access activity logs',
                ], 400);
            }

            $log = \App\Models\ActivityLog::with(['user', 'sme'])
                ->where('sme_id', $user->sme_id)
                ->find($id);

            if (!$log) {
                return response()->json([
                    'success' => false,
                    'message' => 'Activity log not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'action_display_name' => $log->action_display_name,
                    'entity_type' => $log->entity_type,
                    'entity_id' => $log->entity_id,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'details' => $log->details,
                    'severity_level' => $log->severity_level,
                    'severity_color' => $log->severity_color,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ] : null,
                    'sme' => $log->sme ? [
                        'id' => $log->sme->id,
                        'name' => $log->sme->name,
                    ] : null,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity log',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export activity logs to CSV.
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user->sme_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to export activity logs',
                ], 400);
            }

            // Validate filters
            $request->validate([
                'user_id' => 'nullable|integer|exists:users,id',
                'action' => 'nullable|string|max:100',
                'entity_type' => 'nullable|string|max:100',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'search' => 'nullable|string|max:255',
            ]);

            $filters = $request->only([
                'user_id', 'action', 'entity_type', 'start_date', 'end_date', 'search'
            ]);

            // Always filter by current SME
            $filters['sme_id'] = $user->sme_id;

            $filepath = ActivityLogService::exportToCsv($filters);

            // Generate download URL
            $filename = basename($filepath);
            $downloadUrl = url('/api/activity-logs/download/' . $filename);

            return response()->json([
                'success' => true,
                'message' => 'Export completed successfully',
                'data' => [
                    'download_url' => $downloadUrl,
                    'filename' => $filename,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export activity logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download exported CSV file.
     */
    public function download(string $filename)
    {
        try {
            $filepath = storage_path('app/exports/' . $filename);

            if (!file_exists($filepath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Export file not found',
                ], 404);
            }

            return response()->download($filepath, $filename, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download export file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get activity statistics for dashboard.
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user->sme_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to access activity statistics',
                ], 400);
            }

            $request->validate([
                'days' => 'nullable|integer|min:1|max:365',
            ]);

            $days = $request->get('days', 30);
            $stats = ActivityLogService::getStatistics($user->sme_id, $days);

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available filter options for activity logs.
     */
    public function filterOptions(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user->sme_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be connected to an SME to access filter options',
                ], 400);
            }

            // Get unique actions
            $actions = \App\Models\ActivityLog::forSme($user->sme_id)
                ->distinct('action')
                ->pluck('action')
                ->map(function ($action) {
                    return [
                        'value' => $action,
                        'label' => ucwords(str_replace(['_', '.'], ' ', $action)),
                    ];
                })
                ->sortBy('label')
                ->values();

            // Get unique entity types
            $entityTypes = \App\Models\ActivityLog::forSme($user->sme_id)
                ->whereNotNull('entity_type')
                ->distinct('entity_type')
                ->pluck('entity_type')
                ->map(function ($type) {
                    return [
                        'value' => $type,
                        'label' => ucwords(str_replace('_', ' ', $type)),
                    ];
                })
                ->sortBy('label')
                ->values();

            // Get users who have performed actions
            $users = \App\Models\ActivityLog::forSme($user->sme_id)
                ->whereNotNull('user_id')
                ->with('user:id,name,email')
                ->get()
                ->pluck('user')
                ->unique('id')
                ->map(function ($user) {
                    return [
                        'value' => $user->id,
                        'label' => $user->name . ' (' . $user->email . ')',
                    ];
                })
                ->sortBy('label')
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'actions' => $actions,
                    'entity_types' => $entityTypes,
                    'users' => $users,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch filter options',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}



