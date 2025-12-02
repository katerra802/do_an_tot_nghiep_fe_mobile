import { Alert } from 'react-native';
import { DiseaseInfoResponse } from '../types';
import { backendApi } from './api.config';

/**
 * Service để lấy thông tin bệnh từ database
 */
export const diseaseService = {
    /**
     * Lấy thông tin bệnh theo label (từ AI detection)
     * @param label - Label của bệnh (ví dụ: "sauvebua", "khodomoi", etc.)
     * @returns Promise với thông tin bệnh
     */
    getByLabel: async (label: string): Promise<DiseaseInfoResponse | null> => {
        try {
            const response = await backendApi.get(`/diseases/label/${label}`);

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
            Alert.alert('Lỗi', `Không thể lấy thông tin bệnh với label "${label}"`);
            return null;
        }
    },

    /**
     * Lấy thông tin nhiều bệnh từ danh sách labels
     * @param labels - Mảng labels của các bệnh
     * @returns Promise với map label -> disease info
     */
    getMultipleByLabels: async (labels: string[]): Promise<Map<string, DiseaseInfoResponse>> => {
        const diseaseMap = new Map<string, DiseaseInfoResponse>();

        // Gọi API song song cho tất cả labels
        const promises = labels.map(async (label) => {
            const result = await diseaseService.getByLabel(label);
            if (result && result.data.length > 0) {
                diseaseMap.set(label, result);
            }
        });

        await Promise.all(promises);
        return diseaseMap;
    },
};
