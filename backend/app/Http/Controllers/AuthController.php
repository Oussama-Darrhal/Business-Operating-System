<?php

namespace App\Http\Controllers;

use App\Models\SME;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Google\Client as GoogleClient;

class AuthController extends Controller
{
    /**
     * Register a new SME with an admin user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function registerSme(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'sme_name' => 'required|string|max:255|unique:smes,name',
                'user_name' => 'required|string|max:255',
                'email' => 'required|string|email:rfc|max:255|unique:users,email|unique:smes,email',
                'password' => 'required|string|min:8|confirmed',
                'business_type' => 'nullable|string|max:100',
                'phone' => 'nullable|string|max:20',
                'city' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
            ], [
                // Custom error messages
                'sme_name.required' => 'Business name is required.',
                'sme_name.unique' => 'A business with this name already exists.',
                'user_name.required' => 'Admin user name is required.',
                'email.required' => 'Email address is required.',
                'email.email' => 'Please provide a valid email address.',
                'email.unique' => 'An account with this email already exists.',
                'password.required' => 'Password is required.',
                'password.min' => 'Password must be at least 8 characters long.',
                'password.confirmed' => 'Password confirmation does not match.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed. Please check your input.',
                    'errors' => $validator->errors()->toArray()
                ], 422);
            }

            // Use database transaction for data consistency
            $result = DB::transaction(function () use ($request) {
                // Create SME
                $sme = SME::create([
                    'name' => trim($request->sme_name),
                    'email' => strtolower(trim($request->email)),
                    'business_type' => $request->business_type ? trim($request->business_type) : null,
                    'phone' => $request->phone ? trim($request->phone) : null,
                    'city' => $request->city ? trim($request->city) : null,
                    'country' => $request->country ? trim($request->country) : null,
                    'status' => 'active',
                ]);

                // Create admin user for the SME
                $user = User::create([
                    'sme_id' => $sme->id,
                    'name' => trim($request->user_name),
                    'email' => strtolower(trim($request->email)),
                    'password' => Hash::make($request->password),
                    'role' => 'admin',
                    'status' => 'active',
                ]);

                return ['sme' => $sme, 'user' => $user];
            });

            // Generate Sanctum token
            $token = $result['user']->createToken('auth_token', ['*'], now()->addDays(30))->plainTextToken;

            // Update last login
            $result['user']->update(['last_login_at' => now()]);

            // Log successful registration
            Log::info('New SME registration', [
                'sme_id' => $result['sme']->id,
                'user_id' => $result['user']->id,
                'email' => $result['user']->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'SME account created successfully! Welcome to BOS.',
                'user' => [
                    'id' => $result['user']->id,
                    'name' => $result['user']->name,
                    'email' => $result['user']->email,
                    'role' => $result['user']->role,
                    'status' => $result['user']->status,
                    'sme_id' => $result['user']->sme_id,
                    'sme_name' => $result['sme']->name,
                    'last_login_at' => $result['user']->last_login_at,
                ],
                'token' => $token,
            ], 201);

        } catch (\Exception $e) {
            Log::error('SME registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password', 'password_confirmation'])
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Registration failed due to a server error. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Log in a user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'email' => 'required|string|email',
                'password' => 'required|string',
            ], [
                'email.required' => 'Email address is required.',
                'email.email' => 'Please provide a valid email address.',
                'password.required' => 'Password is required.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed. Please check your input.',
                    'errors' => $validator->errors()->toArray()
                ], 422);
            }

            // Normalize email
            $email = strtolower(trim($request->email));

            // Attempt to find user by email
            $user = User::where('email', $email)->with('sme')->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                // Log failed login attempt
                Log::warning('Failed login attempt', [
                    'email' => $email,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password. Please check your credentials and try again.'
                ], 401);
            }

            // Check if user is active
            if ($user->status !== 'active') {
                Log::warning('Login attempt with inactive user', [
                    'user_id' => $user->id,
                    'email' => $email,
                    'status' => $user->status,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Your account is currently inactive. Please contact support for assistance.'
                ], 403);
            }

            // Check if SME is active
            if (!$user->sme || $user->sme->status !== 'active') {
                Log::warning('Login attempt with inactive SME', [
                    'user_id' => $user->id,
                    'sme_id' => $user->sme_id,
                    'sme_status' => $user->sme->status,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Your business account is currently inactive. Please contact support for assistance.'
                ], 403);
            }

            // Revoke old tokens (optional - for better security)
            $user->tokens()->delete();

            // Generate new Sanctum token
            $token = $user->createToken('auth_token', ['*'], now()->addDays(30))->plainTextToken;

            // Update last login
            $user->update(['last_login_at' => now()]);

            // Log successful login
            Log::info('Successful login', [
                'user_id' => $user->id,
                'sme_id' => $user->sme_id,
                'email' => $email,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful. Welcome back!',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'sme_id' => $user->sme_id,
                    'sme_name' => $user->sme->name,
                    'last_login_at' => $user->last_login_at,
                ],
                'token' => $token,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Login failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $request->email ?? 'unknown',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Login failed due to a server error. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Log out the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();

            // Revoke the current token
            $request->user()->currentAccessToken()->delete();

            // Log successful logout
            Log::info('User logged out', [
                'user_id' => $user->id,
                'sme_id' => $user->sme_id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logout successful. Thank you for using BOS!'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Logout failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $request->user()->id ?? 'unknown',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Logout failed due to a server error.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get the authenticated user's profile.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        try {
            $user = $request->user()->load('sme');

            // Update last seen timestamp
            $user->update(['last_login_at' => now()]);

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'sme_id' => $user->sme_id,
                    'sme_name' => $user->sme->name,
                    'last_login_at' => $user->last_login_at,
                    'created_at' => $user->created_at,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve user profile', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $request->user()->id ?? 'unknown',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user profile.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Refresh the user's authentication token.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function refreshToken(Request $request)
    {
        try {
            $user = $request->user();

            // Revoke the current token
            $request->user()->currentAccessToken()->delete();

            // Generate new token
            $token = $user->createToken('auth_token', ['*'], now()->addDays(30))->plainTextToken;

            Log::info('Token refreshed', [
                'user_id' => $user->id,
                'sme_id' => $user->sme_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully.',
                'token' => $token,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Token refresh failed', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id ?? 'unknown',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh token.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Verify Google OAuth token and extract user information
     *
     * @param string $credential
     * @return array|null
     */
    private function verifyGoogleToken($credential)
    {
        try {
            $client = new GoogleClient();
            $client->setClientId(config('services.google.client_id'));

            $payload = $client->verifyIdToken($credential);

            if ($payload) {
                return [
                    'google_id' => $payload['sub'],
                    'email' => $payload['email'],
                    'name' => $payload['name'],
                    'given_name' => $payload['given_name'] ?? '',
                    'family_name' => $payload['family_name'] ?? '',
                    'picture' => $payload['picture'] ?? '',
                    'email_verified' => $payload['email_verified'] ?? false,
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Google token verification failed', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Login user with Google OAuth
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function googleLogin(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'credential' => 'required|string',
                'user_info' => 'required|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Google authentication data.',
                    'errors' => $validator->errors()->toArray()
                ], 422);
            }

            // Verify Google token
            $googleUser = $this->verifyGoogleToken($request->credential);

            if (!$googleUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Google token. Please try again.'
                ], 401);
            }

            // Check if user exists by email
            $user = User::where('email', $googleUser['email'])->with('sme')->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No account found with this Google email. Please sign up first or use a different login method.',
                    'requires_registration' => true
                ], 404);
            }

            // Check if user and SME are active
            if ($user->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is currently inactive. Please contact support.'
                ], 403);
            }

            if ($user->sme->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your business account is currently inactive. Please contact support.'
                ], 403);
            }

            // Update user with Google information if not already set
            $updateData = [];
            if (!$user->google_id) {
                $updateData['google_id'] = $googleUser['google_id'];
                $updateData['auth_provider'] = 'google';
            }
            if (!$user->avatar && $googleUser['picture']) {
                $updateData['avatar'] = $googleUser['picture'];
            }

            if (!empty($updateData)) {
                $user->update($updateData);
            }

            // Revoke old tokens
            $user->tokens()->delete();

            // Generate new Sanctum token
            $token = $user->createToken('google_auth_token', ['*'], now()->addDays(30))->plainTextToken;

            // Update last login
            $user->update(['last_login_at' => now()]);

            Log::info('Successful Google login', [
                'user_id' => $user->id,
                'sme_id' => $user->sme_id,
                'email' => $user->email,
                'google_id' => $googleUser['google_id'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Google login successful. Welcome back!',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'sme_id' => $user->sme_id,
                    'sme_name' => $user->sme->name,
                    'avatar' => $user->avatar,
                    'auth_provider' => 'google',
                    'last_login_at' => $user->last_login_at,
                ],
                'token' => $token,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Google login failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Google login failed due to a server error. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Register new SME with Google OAuth
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function googleRegister(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'credential' => 'required|string',
                'user_info' => 'required|array',
                'sme_name' => 'nullable|string|max:255',
                'business_type' => 'nullable|string|max:100',
                'phone' => 'nullable|string|max:20',
                'city' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Google registration data.',
                    'errors' => $validator->errors()->toArray()
                ], 422);
            }

            // Verify Google token
            $googleUser = $this->verifyGoogleToken($request->credential);

            if (!$googleUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Google token. Please try again.'
                ], 401);
            }

            // Check if user already exists
            $existingUser = User::where('email', $googleUser['email'])->first();
            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'An account with this email already exists. Please sign in instead.',
                    'existing_user' => true
                ], 409);
            }

            // Start transaction
            DB::beginTransaction();

            try {
                // Use provided SME name or derive from user name
                $smeName = $request->sme_name ?: ($googleUser['name'] . "'s Business");

                // Ensure SME name is unique
                $baseName = $smeName;
                $counter = 1;
                while (SME::where('name', $smeName)->exists()) {
                    $smeName = $baseName . ' ' . $counter;
                    $counter++;
                }

                // Create the SME
                $sme = SME::create([
                    'name' => $smeName,
                    'email' => $googleUser['email'],
                    'business_type' => $request->business_type,
                    'phone' => $request->phone,
                    'city' => $request->city,
                    'country' => $request->country,
                    'status' => 'active',
                ]);

                // Create the admin user
                $user = User::create([
                    'sme_id' => $sme->id,
                    'name' => $googleUser['name'],
                    'email' => $googleUser['email'],
                    'email_verified_at' => $googleUser['email_verified'] ? now() : null,
                    'password' => Hash::make(uniqid()), // Random password for OAuth users
                    'role' => 'admin',
                    'status' => 'active',
                    'google_id' => $googleUser['google_id'],
                    'auth_provider' => 'google',
                    'avatar' => $googleUser['picture'],
                ]);

                // Generate Sanctum token
                $token = $user->createToken('google_auth_token', ['*'], now()->addDays(30))->plainTextToken;

                // Commit transaction
                DB::commit();

                Log::info('Successful Google registration', [
                    'user_id' => $user->id,
                    'sme_id' => $sme->id,
                    'email' => $googleUser['email'],
                    'google_id' => $googleUser['google_id'],
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Google registration successful. Welcome to our platform!',
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'status' => $user->status,
                        'sme_id' => $sme->id,
                        'sme_name' => $sme->name,
                        'avatar' => $user->avatar,
                        'auth_provider' => 'google',
                        'last_login_at' => null,
                    ],
                    'token' => $token,
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Google registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $googleUser['email'] ?? 'unknown',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Google registration failed due to a server error. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
