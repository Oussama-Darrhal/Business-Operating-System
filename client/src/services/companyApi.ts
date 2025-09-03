// API service for company profile operations
import { api } from '../utils/api';

export interface CompanyProfileData {
  id?: string;
  companyName: string;
  industry: string;
  description: string;
  foundedYear: string;
  companySize: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  timezone: string;
  currency: string;
  businessHours: string;
  taxId: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyApiResponse {
  success: boolean;
  data?: CompanyProfileData;
  message?: string;
  errors?: Record<string, string>;
}

class CompanyApiService {
  private baseUrl = '/api/company';

  // Get company profile
  async getProfile(): Promise<CompanyApiResponse> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.get(`${this.baseUrl}/profile`);
      // return response.data;

      // Mock data for now
      await this.simulateDelay(800);
      return {
        success: true,
        data: {
          id: '1',
          companyName: 'TechCorp Solutions',
          industry: 'technology',
          description: 'A leading technology company specializing in innovative software solutions and digital transformation services for small and medium enterprises.',
          foundedYear: '2020',
          companySize: '10-50',
          email: 'contact@techcorp.com',
          phone: '+1 (555) 123-4567',
          website: 'www.techcorp.com',
          address: '123 Innovation Drive, Suite 100',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'United States',
          timezone: 'America/Los_Angeles',
          currency: 'USD',
          businessHours: 'Monday - Friday: 9:00 AM - 5:00 PM PST',
          taxId: '12-3456789',
          logoUrl: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        }
      };
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return {
        success: false,
        message: 'Failed to load company profile'
      };
    }
  }

  // Update company profile
  async updateProfile(data: Partial<CompanyProfileData>): Promise<CompanyApiResponse> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.put(`${this.baseUrl}/profile`, data);
      // return response.data;

      // Mock API call
      await this.simulateDelay(1200);
      
      // Simulate validation errors (uncomment to test)
      // if (!data.companyName) {
      //   return {
      //     success: false,
      //     errors: { companyName: 'Company name is required' }
      //   };
      // }

      return {
        success: true,
        data: { ...data } as CompanyProfileData,
        message: 'Company profile updated successfully'
      };
    } catch (error) {
      console.error('Error updating company profile:', error);
      return {
        success: false,
        message: 'Failed to update company profile'
      };
    }
  }

  // Upload company logo
  async uploadLogo(file: File): Promise<CompanyApiResponse> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const formData = new FormData();
      // formData.append('logo', file);
      // const response = await api.post(`${this.baseUrl}/logo`, formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });
      // return response.data;

      // Mock upload
      await this.simulateDelay(2000);
      
      // Simulate file validation
      if (file.size > 2 * 1024 * 1024) {
        return {
          success: false,
          message: 'File size must be less than 2MB'
        };
      }

      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          message: 'Please upload an image file'
        };
      }

      const mockLogoUrl = URL.createObjectURL(file);
      return {
        success: true,
        data: { logoUrl: mockLogoUrl } as CompanyProfileData,
        message: 'Logo uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading logo:', error);
      return {
        success: false,
        message: 'Failed to upload logo'
      };
    }
  }

  // Remove company logo
  async removeLogo(): Promise<CompanyApiResponse> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.delete(`${this.baseUrl}/logo`);
      // return response.data;

      await this.simulateDelay(500);
      return {
        success: true,
        message: 'Logo removed successfully'
      };
    } catch (error) {
      console.error('Error removing logo:', error);
      return {
        success: false,
        message: 'Failed to remove logo'
      };
    }
  }

  // Utility function to simulate API delays
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const companyApi = new CompanyApiService();
