<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SMEController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
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
    Route::get('/user/permissions', [AuthController::class, 'getUserPermissions']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);

    // SME management routes (user can access even without SME connection)
    Route::prefix('sme')->group(function () {
        Route::get('/profile', [SMEController::class, 'getProfile']);
        Route::put('/profile', [SMEController::class, 'updateProfile']);
        Route::get('/available', [SMEController::class, 'getAvailableSMEs']);
        Route::post('/connect', [SMEController::class, 'connectToSME']);
        Route::post('/create', [SMEController::class, 'createSME']);
    });

    // Multi-tenant protected routes (automatically scoped to user's SME)
    Route::middleware([TenantScopeMiddleware::class])->group(function () {
        // Role management routes
        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index']);
            Route::post('/', [RoleController::class, 'store']);
            Route::get('/modules', [RoleController::class, 'getModules']);
            Route::get('/{id}', [RoleController::class, 'show']);
            Route::put('/{id}', [RoleController::class, 'update']);
            Route::delete('/{id}', [RoleController::class, 'destroy']);
            Route::delete('/', [RoleController::class, 'bulkDestroy']);
        });

        // User management routes
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::post('/', [UserController::class, 'store']);
            Route::get('/roles', [UserController::class, 'getRoles']);
            Route::get('/{id}', [UserController::class, 'show']);
            Route::put('/{id}', [UserController::class, 'update']);
            Route::delete('/{id}', [UserController::class, 'destroy']);
            Route::delete('/', [UserController::class, 'bulkDestroy']);
        });

        // Activity logs routes
        Route::prefix('activity-logs')->group(function () {
            Route::get('/', [App\Http\Controllers\ActivityLogController::class, 'index']);
            Route::get('/filter-options', [App\Http\Controllers\ActivityLogController::class, 'filterOptions']);
            Route::get('/statistics', [App\Http\Controllers\ActivityLogController::class, 'statistics']);
            Route::get('/{id}', [App\Http\Controllers\ActivityLogController::class, 'show']);
            Route::post('/export', [App\Http\Controllers\ActivityLogController::class, 'export']);
            Route::get('/download/{filename}', [App\Http\Controllers\ActivityLogController::class, 'download']);
        });

        // Settings routes
        Route::prefix('settings')->group(function () {
            Route::get('/', [App\Http\Controllers\SettingsController::class, 'index']);
            Route::put('/', [App\Http\Controllers\SettingsController::class, 'update']);
            Route::get('/timezones', [App\Http\Controllers\SettingsController::class, 'timezones']);
            Route::get('/currencies', [App\Http\Controllers\SettingsController::class, 'currencies']);
            Route::get('/languages', [App\Http\Controllers\SettingsController::class, 'languages']);
            Route::post('/cleanup-logs', [App\Http\Controllers\SettingsController::class, 'cleanupLogs']);
        });

        // Future SME-specific endpoints will go here
        // Example: complaints, inventory, etc.
    });
});
