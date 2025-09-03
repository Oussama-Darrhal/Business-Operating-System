<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'sme_id',
        'role_id',
        'name',
        'email',
        'email_verified_at',
        'password',
        'status',
        'last_login_at',
        'google_id',
        'auth_provider',
        'avatar',
        'phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'status' => 'string',
        ];
    }

    /**
     * Get the SME that owns the user.
     */
    public function sme(): BelongsTo
    {
        return $this->belongsTo(SME::class);
    }

    /**
     * Get the role that belongs to the user.
     */
    public function userRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Check if user has specific permission for a module.
     */
    public function hasPermission(string $moduleId, string $permission): bool
    {
        if (!$this->userRole) {
            return false;
        }

        return $this->userRole->hasPermission($moduleId, $permission);
    }

    /**
     * Get all permissions for a module.
     */
    public function getModulePermissions(string $moduleId): array
    {
        if (!$this->userRole) {
            return [];
        }

        return $this->userRole->getModulePermissions($moduleId);
    }

    /**
     * Get user's role name.
     */
    public function getRoleName(): ?string
    {
        return $this->userRole?->name;
    }
}
