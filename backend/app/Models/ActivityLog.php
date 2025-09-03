<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'sme_id',
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'details',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    /**
     * Get the SME that owns the activity log.
     */
    public function sme(): BelongsTo
    {
        return $this->belongsTo(SME::class);
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the target entity (polymorphic relationship).
     */
    public function entity()
    {
        if ($this->entity_type && $this->entity_id) {
            return $this->morphTo();
        }
        return null;
    }

    /**
     * Scope to filter by SME.
     */
    public function scopeForSme($query, $smeId)
    {
        return $query->where('sme_id', $smeId);
    }

    /**
     * Scope to filter by user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to filter by action.
     */
    public function scopeForAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by entity type.
     */
    public function scopeForEntityType($query, $entityType)
    {
        return $query->where('entity_type', $entityType);
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get formatted action display name.
     */
    public function getActionDisplayNameAttribute(): string
    {
        $actionMap = [
            // Authentication actions
            'auth.login' => 'User Login',
            'auth.logout' => 'User Logout',
            'auth.login_failed' => 'Failed Login Attempt',

            // User management actions
            'user.created' => 'User Created',
            'user.updated' => 'User Updated',
            'user.deleted' => 'User Deleted',
            'user.role_changed' => 'User Role Changed',
            'user.status_changed' => 'User Status Changed',

            // Role management actions
            'role.created' => 'Role Created',
            'role.updated' => 'Role Updated',
            'role.deleted' => 'Role Deleted',
            'role.permissions_updated' => 'Role Permissions Updated',

            // SME actions
            'sme.created' => 'SME Created',
            'sme.updated' => 'SME Updated',
            'sme.switched' => 'SME Switched',

            // Permission actions
            'permission.denied' => 'Permission Denied',
            'permission.granted' => 'Permission Granted',

            // System actions
            'system.settings_updated' => 'System Settings Updated',
            'system.maintenance_mode' => 'Maintenance Mode Toggled',
        ];

        return $actionMap[$this->action] ?? ucwords(str_replace(['_', '.'], ' ', $this->action));
    }

    /**
     * Get severity level for the action.
     */
    public function getSeverityLevelAttribute(): string
    {
        $highSeverity = ['user.deleted', 'role.deleted', 'sme.deleted', 'permission.denied'];
        $mediumSeverity = ['user.created', 'user.updated', 'role.created', 'role.updated', 'auth.login_failed'];

        if (in_array($this->action, $highSeverity)) {
            return 'high';
        } elseif (in_array($this->action, $mediumSeverity)) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Get severity color for UI display.
     */
    public function getSeverityColorAttribute(): string
    {
        return match($this->severity_level) {
            'high' => 'red',
            'medium' => 'yellow',
            'low' => 'green',
            default => 'gray'
        };
    }
}



