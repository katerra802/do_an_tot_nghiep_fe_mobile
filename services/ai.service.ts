import { Alert } from 'react-native';
import { AIDetectionResponse } from '../types';
import { aiApi } from './api.config';

/**
 * Service để tương tác với AI Model API (Python FastAPI)
 */
export const aiService = {
    /**
     * Gửi ảnh để AI phát hiện bệnh
     * @param imageUri - Ảnh URI từ camera (file://...)
     * @returns Promise với kết quả detection
     */
    detectDisease: async (imageUri: string): Promise<AIDetectionResponse> => {
        try {
            // React Native FormData requires file object with uri, type, and name
            const formData = new FormData();

            formData.append('file', {
                uri: imageUri, // File URI from camera (file://...)
                type: 'image/jpeg',
                name: 'photo.jpg',
            } as any);

            const response = await aiApi.post('/predict/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {

            throw error;
        }
    },

    /**
     * Tạo WebSocket connection cho real-time detection
     * @param onMessage - Callback khi nhận được message từ AI
     * @param onError - Callback khi có lỗi
     * @param onClose - Callback khi connection đóng
     * @returns WebSocket instance
     */
    createStreamConnection: (
        onMessage: (data: AIDetectionResponse) => void,
        onError?: (error: Event) => void,
        onClose?: (event: CloseEvent) => void
    ): WebSocket => {
        // Chuyển từ http sang ws protocol
        const wsUrl = aiApi.defaults.baseURL?.replace('http', 'ws') + '/predict-stream';
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch {
                Alert.alert('Lỗi', 'Dữ liệu nhận từ AI không hợp lệ');
            }
        };

        ws.onerror = (error) => {
            Alert.alert('Lỗi', 'Lỗi kết nối WebSocket với AI');
            if (onError) onError(error);
        };

        ws.onclose = (event) => {
            if (onClose) onClose(event);
        };

        return ws;
    },

    /**
     * Gửi frame qua WebSocket
     * @param ws - WebSocket instance
     * @param imageBase64 - Ảnh dưới dạng base64 data URL
     */
    sendFrame: (ws: WebSocket, imageBase64: string) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(imageBase64);
        } else {
            Alert.alert('Lỗi', `Không thể gửi frame, WebSocket không mở (trạng thái: ${ws.readyState})`);
        }
    },

    /**
     * Đóng WebSocket connection
     * @param ws - WebSocket instance
     */
    closeStream: (ws: WebSocket) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    },

    /**
     * Kiểm tra health của AI service
     */
    checkHealth: async (): Promise<boolean> => {
        try {
            const response = await aiApi.get('/');
            return response.data.status === 'ok';
        } catch {
            Alert.alert('Lỗi', 'Kiểm tra trạng thái AI service thất bại');
            return false;
        }
    },
};
