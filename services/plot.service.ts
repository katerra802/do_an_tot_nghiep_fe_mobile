import { Alert } from 'react-native';
import { PlotOptionsResponse } from '../types';
import { backendApi } from './api.config';

/**
 * Service để lấy danh sách lô đất
 */
export const plotService = {
    /**
     * Lấy danh sách tất cả lô đất (dạng options cho select)
     * @returns Promise với danh sách lô đất
     */
    getOptions: async (): Promise<PlotOptionsResponse | null> => {
        try {
            const response = await backendApi.get('/plots/options');

            // Backend trả về: { success: true, message: "", results: number, data: [...] }
            if (response.data.success && response.data.data) {
                return {
                    success: response.data.success,
                    message: response.data.message,
                    results: response.data.results,
                    data: response.data.data,
                };
            }

            return null;
        } catch {
            Alert.alert('Lỗi', 'Không thể lấy danh sách lô đất');
            return null;
        }
    },
};
