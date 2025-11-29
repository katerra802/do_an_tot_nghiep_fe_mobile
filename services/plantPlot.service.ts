import { PlantPlotResponse } from '../types';
import { backendApi } from './api.config';

/**
 * Service để lấy danh sách cây trồng trong lô đất
 */
export const plantPlotService = {
    /**
     * Lấy danh sách cây trồng theo plot_id
     * @param plotId - ID của lô đất
     * @returns Promise với danh sách cây trồng
     */
    getByPlotId: async (plotId: number): Promise<PlantPlotResponse | null> => {
        try {
            const response = await backendApi.get(`/plant-plots/plot/${plotId}`);

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
        } catch (error: any) {
            console.error(`[PlantPlot Service] Error fetching plant plots for plot ${plotId}:`, error);
            return null;
        }
    },
};
