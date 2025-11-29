import { ApiResponse, CareLog, PlotOption } from '../types';
import { backendApi } from './api.config';

/**
 * Service để quản lý Care Logs (Nhật ký chăm sóc)
 */
export const careLogService = {
    /**
     * Lấy danh sách lô đất còn lại cần chăm sóc
     * @returns Promise với danh sách plot options
     */
    getRemainingPlots: async (): Promise<ApiResponse<PlotOption[]>> => {
        try {
            const response = await backendApi.get('/care-log/remaning-plots');

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
                error: error.response?.data?.message || 'Không thể lấy danh sách lô đất',
            };
        }
    },
    /**
     * Lấy danh sách care logs theo employee_id
     * @param employeeId - ID của nhân viên
     * @returns Promise với danh sách care logs
     */
    getByEmployee: async (employeeId: number): Promise<ApiResponse<CareLog[]>> => {
        try {
            const response = await backendApi.get(`/care-log/employee/${employeeId}`);

            // Backend trả về: { success: true, message: "", results: length, data: [...] }
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
                error: error.response?.data?.message || 'Không thể lấy danh sách nhật ký chăm sóc',
            };
        }
    },

    /**
     * Tạo mới care log
     * @param careLog - Dữ liệu care log
     * @returns Promise với care log đã tạo
     */
    create: async (careLog: Omit<CareLog, 'id'>): Promise<ApiResponse<CareLog>> => {
        try {
            const response = await backendApi.post('/care-log', careLog);
            return {
                success: true,
                data: response.data,
                message: 'Tạo nhật ký chăm sóc thành công',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tạo nhật ký chăm sóc',
            };
        }
    },
};
