import { ApiResponse } from '../types';
import { backendApi } from './api.config';

/**
 * Supply Option (Vật tư)
 */
export interface SupplyOption {
    id: number;
    name: string;
}

export interface SupplyOptionsResponse {
    success: boolean;
    message: string;
    data: SupplyOption[];
}

/**
 * Service để quản lý Supplies (Vật tư)
 */
export const supplyService = {
    /**
     * Lấy danh sách tùy chọn vật tư
     * @returns Promise với danh sách supply options
     */
    getOptions: async (): Promise<ApiResponse<SupplyOption[]>> => {
        try {
            const response = await backendApi.get('/supplies/options');

            // Backend trả về: { success: true, message: "", data: [...] }
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message,
                };
            }

            return {
                success: false,
                error: 'Invalid response format',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy danh sách vật tư',
            };
        }
    },
};
