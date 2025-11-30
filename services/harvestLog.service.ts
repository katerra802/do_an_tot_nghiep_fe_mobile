import { ApiResponse, HarvestLog } from '../types';
import { backendApi } from './api.config';

/**
 * Service để quản lý Harvest Logs (Nhật ký thu hoạch)
 */
export const harvestLogService = {
    /**
     * Lấy danh sách harvest logs theo employee_id
     * @param employeeId - ID của nhân viên
     * @returns Promise với danh sách harvest logs
     */
    getByEmployee: async (employeeId: number): Promise<ApiResponse<HarvestLog[]>> => {
        try {
            const response = await backendApi.get(`/harvest-logs/employee/${employeeId}`);

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
                error: error.response?.data?.message || 'Không thể lấy danh sách nhật ký thu hoạch',
            };
        }
    },

    /**
     * Tạo mới harvest log
     * @param harvestLog - Dữ liệu harvest log
     * @returns Promise với harvest log đã tạo
     */
    create: async (harvestLog: Omit<HarvestLog, 'id'>): Promise<ApiResponse<HarvestLog>> => {
        try {
            const response = await backendApi.post('/harvest-log', harvestLog);
            return {
                success: true,
                data: response.data,
                message: 'Tạo nhật ký thu hoạch thành công',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tạo nhật ký thu hoạch',
            };
        }
    },

    /**
     * Cập nhật harvest log
     * @param id - ID của harvest log
     * @param harvestLog - Dữ liệu cập nhật
     * @returns Promise với harvest log đã cập nhật
     */
    update: async (id: number, harvestLog: Partial<HarvestLog>): Promise<ApiResponse<HarvestLog>> => {
        try {
            const response = await backendApi.put(`/harvest-log/${id}`, harvestLog);
            return {
                success: true,
                data: response.data,
                message: 'Cập nhật nhật ký thu hoạch thành công',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể cập nhật nhật ký thu hoạch',
            };
        }
    },

    /**
     * Xóa harvest log
     * @param id - ID của harvest log
     * @returns Promise với kết quả
     */
    delete: async (id: number): Promise<ApiResponse<void>> => {
        try {
            await backendApi.delete(`/harvest-log/${id}`);
            // Backend trả về status 204 với .send() - axios coi là success
            return {
                success: true,
                message: 'Xóa nhật ký thu hoạch thành công',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể xóa nhật ký thu hoạch',
            };
        }
    },

    /**
     * Lấy chi tiết harvest log theo ID
     * @param id - ID của harvest log
     * @returns Promise với harvest log
     */
    getById: async (id: number): Promise<ApiResponse<HarvestLog>> => {
        try {
            const response = await backendApi.get(`/harvest-log/${id}`);
            // Backend trả về: { success: true, message: "...", data: harvestLog }
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
