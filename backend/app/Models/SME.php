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
        'description',
        'founded_year',
        'company_size',
        'email',
        'phone',
        'website',
        'address',
        'city',
        'state',
        'zip_code',
        'country',
        'timezone',
        'currency',
        'business_hours',
        'tax_id',
        'logo_url',
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
