<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SME extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'smes';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'business_type',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'timezone',
        'subscription_plan',
        'status',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'subscription_plan' => 'string',
        'status' => 'string',
    ];

    /**
     * Get the users for the SME.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
