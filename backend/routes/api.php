<?php

use App\Http\Controllers\AuthController;
use App\Http\Middleware\TenantScopeMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public authentication routes (no authentication required)
Route::post('/register-sme', [AuthController::class, 'registerSme']);
Route::post('/login', [AuthController::class, 'login']);

// OAuth routes (no authentication required)
Route::post('/oauth/google/login', [AuthController::class, 'googleLogin']);
Route::post('/oauth/google/register', [AuthController::class, 'googleRegister']);


// Protected routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    // Basic authenticated user endpoint
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);

    // Multi-tenant protected routes (automatically scoped to user's SME)
    Route::middleware([TenantScopeMiddleware::class])->group(function () {
        // Future SME-specific endpoints will go here
        // Example: complaints, inventory, etc.
    });
});
