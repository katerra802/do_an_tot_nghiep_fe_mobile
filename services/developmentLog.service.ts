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

    /**
     * Cập nhật development log
     * @param id - ID của development log
     * @param developmentLog - Dữ liệu cập nhật
     * @returns Promise với development log đã cập nhật
     */
    update: async (id: number, developmentLog: Partial<DevelopmentLog>): Promise<ApiResponse<DevelopmentLog>> => {
        try {
            const response = await backendApi.put(`/development-log/${id}`, developmentLog);
            return {
                success: true,
                data: response.data,
                message: 'Cập nhật nhật ký phát triển thành công',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể cập nhật nhật ký phát triển',
            };
        }
    },

    /**
     * Xóa development log
     * @param id - ID của development log
     * @returns Promise với kết quả
     */
    delete: async (id: number): Promise<ApiResponse<void>> => {
        try {
            await backendApi.delete(`/development-log/${id}`);
            // Backend trả về status 204 với .send() - axios coi là success
            return {
                success: true,
                message: 'Xóa nhật ký phát triển thành công',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể xóa nhật ký phát triển',
            };
        }
    },

    /**
     * Lấy chi tiết development log theo ID
     * @param id - ID của development log
     * @returns Promise với development log
     */
    getById: async (id: number): Promise<ApiResponse<DevelopmentLog>> => {
        try {
            const response = await backendApi.get(`/development-log/log/${id}`);
            // Backend trả về: { success: true, message: "...", data: developmentLog }
            if (response.data && response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                };
            }
            return {
                success: false,
                error: 'Invalid response format',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy thông tin nhật ký',
            };
        }
    },
};
