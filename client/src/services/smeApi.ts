// API service for SME operations
import { authenticatedApiCall } from '../utils/api';

export interface SMEData {
  id?: number;
  companyName: string;
  industry: string;
  description?: string;
  foundedYear?: string;
  companySize?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  businessHours?: string;
  taxId?: string;
  logoUrl?: string;
  subscription_plan?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AvailableSME {
  id: number;
  name: string;
  business_type: string;
  email: string;
  city: string;
  country: string;
}

export interface SMEApiResponse {
  success: boolean;
  data?: SMEData | AvailableSME[];
  message?: string;
  errors?: Record<string, string>;
  has_sme?: boolean;
}

class SMEApiService {
  /**
   * Get the current user's SME profile
   */
  async getProfile(): Promise<SMEApiResponse> {
    try {
      const response = await authenticatedApiCall<SMEData>('/api/sme/profile');
      return response;
    } catch (error) {
      console.error('Error fetching SME profile:', error);
      return {
        success: false,
        message: 'Failed to load SME profile'
      };
    }
  }

  /**
   * Update the current user's SME profile
   */
  async updateProfile(data: Partial<SMEData>): Promise<SMEApiResponse> {
    try {
      const response = await authenticatedApiCall<SMEData>('/api/sme/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('Error updating SME profile:', error);
      return {
        success: false,
        message: 'Failed to update SME profile'
      };
    }
  }

  /**
   * Get list of available SMEs for connection
   */
  async getAvailableSMEs(): Promise<SMEApiResponse> {
    try {
      const response = await authenticatedApiCall<AvailableSME[]>('/api/sme/available');
      return response;
    } catch (error) {
      console.error('Error fetching available SMEs:', error);
      return {
        success: false,
        message: 'Failed to load available SMEs'
      };
    }
  }

  /**
   * Connect user to an existing SME
   */
  async connectToSME(smeId: number): Promise<SMEApiResponse> {
    try {
      const response = await authenticatedApiCall('/api/sme/connect', {
        method: 'POST',
        body: JSON.stringify({ sme_id: smeId })
      });
      return response;
    } catch (error) {
      console.error('Error connecting to SME:', error);
      return {
        success: false,
        message: 'Failed to connect to SME'
      };
    }
  }

  /**
   * Create a new SME (placeholder for future implementation)
   */
  async createSME(data: Partial<SMEData>): Promise<SMEApiResponse> {
    try {
      const response = await authenticatedApiCall('/api/sme/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('Error creating SME:', error);
      return {
        success: false,
        message: 'Failed to create SME'
      };
    }
  }

  /**
   * Upload company logo (placeholder - will be implemented later)
   */
  async uploadLogo(file: File): Promise<SMEApiResponse> {
    // For now, return a placeholder response
    return {
      success: false,
      message: 'Logo upload functionality will be implemented later'
    };
  }

  /**
   * Remove company logo (placeholder - will be implemented later)
   */
  async removeLogo(): Promise<SMEApiResponse> {
    // For now, return a placeholder response
    return {
      success: false,
      message: 'Logo removal functionality will be implemented later'
    };
  }
}

export const smeApi = new SMEApiService();
