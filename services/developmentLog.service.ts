import { ApiResponse, DevelopmentLog } from '../types';
import { backendApi } from './api.config';

/**
 * Service để quản lý Development Logs (Nhật ký phát triển)
 */
export const developmentLogService = {
    /**
     * Lấy danh sách development logs theo employee_id
     * @param employeeId - ID của nhân viên
     * @returns Promise với danh sách development logs
     */
    getByEmployee: async (employeeId: number): Promise<ApiResponse<DevelopmentLog[]>> => {
        try {
            const response = await backendApi.get(`/development-log/employee/${employeeId}`);

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
                error: error.response?.data?.message || 'Không thể lấy danh sách nhật ký phát triển',
            };
        }
    },

    /**
     * Tạo mới development log
     * @param developmentLog - Dữ liệu development log
     * @returns Promise với development log đã tạo
     */
    create: async (developmentLog: Omit<DevelopmentLog, 'id'>): Promise<ApiResponse<DevelopmentLog>> => {
        try {
            const response = await backendApi.post('/development-log', developmentLog);
            return {
                success: true,
                data: response.data,
                message: 'Tạo nhật ký phát triển thành công',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tạo nhật ký phát triển',
            };
        }
    },
};
