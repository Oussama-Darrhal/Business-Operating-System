<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TenantScopeMiddleware
{
    /**
     * Handle an incoming request.
     *
     * This middleware ensures that all data queries are automatically
     * scoped to the authenticated user's SME (tenant).
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (Auth::check()) {
            $user = Auth::user();

            // Ensure the user has an sme_id
            if ($user && $user->sme_id) {
                // Apply global scope to User model for this request
                User::addGlobalScope('tenant', function ($builder) use ($user) {
                    $builder->where('sme_id', $user->sme_id);
                });

                // Store the current tenant ID in the request for use in controllers
                $request->merge(['tenant_id' => $user->sme_id]);
            }
        }

        return $next($request);
    }
}
