import { Service, ServiceConfig, ServiceCategory } from '../types';
import { request } from './request';

/**
 * Service API Service
 */
export const serviceService = {
  /**
   * Get all services
   */
  async getAllServices(filters?: {
    category?: ServiceCategory;
    isActive?: boolean;
  }): Promise<Service[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());

    const response = await request<{ data: Service[]; pagination: any }>(
      `/services?${params.toString()}`,
      { method: 'GET' }
    );
    return response.data!.data;
  },

  /**
   * Get service by ID
   */
  async getServiceById(serviceId: string): Promise<Service> {
    const response = await request<Service>(
      `/services/${serviceId}`,
      { method: 'GET' }
    );
    return response.data!;
  },

  /**
   * Get active rules for a service
   */
  async getActiveRules(serviceId: string, type?: 'EARN' | 'BURN'): Promise<{
    earnRule: ServiceConfig | null;
    burnRule: ServiceConfig | null;
  }> {
    const params = new URLSearchParams();
    if (type) {
      params.append('type', type);
    }

    const queryString = params.toString();
    const url = `/services/${serviceId}/rules${queryString ? `?${queryString}` : ''}`;

    if (type) {
      // Return single rule for specific type
      const response = await request<ServiceConfig | null>(url, { method: 'GET' });
      const rule = response.data || null;
      return type === 'EARN'
        ? { earnRule: rule, burnRule: null }
        : { earnRule: null, burnRule: rule };
    } else {
      // Return both rules
      const response = await request<{
        earnRule: ServiceConfig | null;
        burnRule: ServiceConfig | null;
      }>(url, { method: 'GET' });
      return response.data!;
    }
  },
};

