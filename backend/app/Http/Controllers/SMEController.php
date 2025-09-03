<?php

namespace App\Http\Controllers;

use App\Models\SME;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SMEController extends Controller
{
    /**
     * Get the current user's SME profile
     */
    public function getProfile(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                    'data' => null
                ], 401);
            }

            // Check if user has an SME associated
            if (!$user->sme_id || !$user->sme) {
                return response()->json([
                    'success' => true,
                    'message' => 'No SME associated with user',
                    'data' => null,
                    'has_sme' => false
                ], 200);
            }

            $sme = $user->sme;

            return response()->json([
                'success' => true,
                'message' => 'SME profile retrieved successfully',
                'data' => [
                    'id' => $sme->id,
                    'companyName' => $sme->name,
                    'industry' => $sme->business_type,
                    'description' => $sme->description,
                    'foundedYear' => $sme->founded_year,
                    'companySize' => $sme->company_size,
                    'email' => $sme->email,
                    'phone' => $sme->phone,
                    'website' => $sme->website,
                    'address' => $sme->address,
                    'city' => $sme->city,
                    'state' => $sme->state,
                    'zipCode' => $sme->zip_code,
                    'country' => $sme->country,
                    'timezone' => $sme->timezone,
                    'currency' => $sme->currency,
                    'businessHours' => $sme->business_hours,
                    'taxId' => $sme->tax_id,
                    'logoUrl' => $sme->logo_url,
                    'subscription_plan' => $sme->subscription_plan,
                    'status' => $sme->status,
                    'created_at' => $sme->created_at,
                    'updated_at' => $sme->updated_at
                ],
                'has_sme' => true
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve SME profile',
                'data' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the current user's SME profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || !$user->sme_id || !$user->sme) {
                return response()->json([
                    'success' => false,
                    'message' => 'No SME associated with user',
                    'data' => null
                ], 400);
            }

            // Validation rules
            $validator = Validator::make($request->all(), [
                'companyName' => 'sometimes|required|string|max:255',
                'industry' => 'sometimes|required|string|max:100',
                'description' => 'sometimes|nullable|string',
                'foundedYear' => 'sometimes|nullable|integer|min:1800|max:' . date('Y'),
                'companySize' => 'sometimes|nullable|string|max:50',
                'email' => 'sometimes|required|email|max:255|unique:smes,email,' . $user->sme->id,
                'phone' => 'sometimes|nullable|string|max:20',
                'website' => 'sometimes|nullable|url|max:255',
                'address' => 'sometimes|nullable|string',
                'city' => 'sometimes|nullable|string|max:100',
                'state' => 'sometimes|nullable|string|max:100',
                'zipCode' => 'sometimes|nullable|string|max:20',
                'country' => 'sometimes|nullable|string|max:100',
                'timezone' => 'sometimes|nullable|string|max:50',
                'currency' => 'sometimes|nullable|string|max:10',
                'businessHours' => 'sometimes|nullable|string|max:255',
                'taxId' => 'sometimes|nullable|string|max:50',
                'logoUrl' => 'sometimes|nullable|url|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'data' => null
                ], 422);
            }

            $sme = $user->sme;
            $updateData = [];

            // Map frontend fields to backend fields
            if ($request->has('companyName')) {
                $updateData['name'] = $request->companyName;
            }
            if ($request->has('industry')) {
                $updateData['business_type'] = $request->industry;
            }
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            if ($request->has('foundedYear')) {
                $updateData['founded_year'] = $request->foundedYear;
            }
            if ($request->has('companySize')) {
                $updateData['company_size'] = $request->companySize;
            }
            if ($request->has('email')) {
                $updateData['email'] = $request->email;
            }
            if ($request->has('phone')) {
                $updateData['phone'] = $request->phone;
            }
            if ($request->has('website')) {
                $updateData['website'] = $request->website;
            }
            if ($request->has('address')) {
                $updateData['address'] = $request->address;
            }
            if ($request->has('city')) {
                $updateData['city'] = $request->city;
            }
            if ($request->has('state')) {
                $updateData['state'] = $request->state;
            }
            if ($request->has('zipCode')) {
                $updateData['zip_code'] = $request->zipCode;
            }
            if ($request->has('country')) {
                $updateData['country'] = $request->country;
            }
            if ($request->has('timezone')) {
                $updateData['timezone'] = $request->timezone;
            }
            if ($request->has('currency')) {
                $updateData['currency'] = $request->currency;
            }
            if ($request->has('businessHours')) {
                $updateData['business_hours'] = $request->businessHours;
            }
            if ($request->has('taxId')) {
                $updateData['tax_id'] = $request->taxId;
            }
            if ($request->has('logoUrl')) {
                $updateData['logo_url'] = $request->logoUrl;
            }

            // Update the SME
            $sme->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'SME profile updated successfully',
                'data' => [
                    'id' => $sme->id,
                    'companyName' => $sme->name,
                    'industry' => $sme->business_type,
                    'description' => $sme->description,
                    'foundedYear' => $sme->founded_year,
                    'companySize' => $sme->company_size,
                    'email' => $sme->email,
                    'phone' => $sme->phone,
                    'website' => $sme->website,
                    'address' => $sme->address,
                    'city' => $sme->city,
                    'state' => $sme->state,
                    'zipCode' => $sme->zip_code,
                    'country' => $sme->country,
                    'timezone' => $sme->timezone,
                    'currency' => $sme->currency,
                    'businessHours' => $sme->business_hours,
                    'taxId' => $sme->tax_id,
                    'logoUrl' => $sme->logo_url,
                    'subscription_plan' => $sme->subscription_plan,
                    'status' => $sme->status,
                    'updated_at' => $sme->updated_at
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update SME profile',
                'data' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of available SMEs for connection
     */
    public function getAvailableSMEs(): JsonResponse
    {
        try {
            // For now, return all SMEs (in production you might want to add pagination or filters)
            $smes = SME::where('status', 'active')
                ->select('id', 'name', 'business_type', 'email', 'city', 'country')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Available SMEs retrieved successfully',
                'data' => $smes
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available SMEs',
                'data' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Connect user to an existing SME
     */
    public function connectToSME(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                    'data' => null
                ], 401);
            }

            // Check if user already has an SME
            if ($user->sme_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is already connected to an SME',
                    'data' => null
                ], 400);
            }

            $validator = Validator::make($request->all(), [
                'sme_id' => 'required|integer|exists:smes,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'data' => null
                ], 422);
            }

            // Update user's sme_id
            $user->update(['sme_id' => $request->sme_id]);

            // Get the SME data
            $sme = SME::find($request->sme_id);

            return response()->json([
                'success' => true,
                'message' => 'Successfully connected to SME',
                'data' => [
                    'sme_id' => $sme->id,
                    'sme_name' => $sme->name,
                    'business_type' => $sme->business_type
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to SME',
                'data' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new SME (placeholder for future implementation)
     */
    public function createSME(Request $request): JsonResponse
    {
        // For now, just return a placeholder response
        return response()->json([
            'success' => false,
            'message' => 'SME creation functionality will be implemented later',
            'data' => null
        ], 501); // 501 Not Implemented
    }
}
