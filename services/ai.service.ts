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
            console.error('AI Detection Error:', error);
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
        console.log('[AI Service] 🔌 Creating WebSocket connection to:', wsUrl);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('[AI Service] ✅ WebSocket connected to AI service');
        };

        ws.onmessage = (event) => {
            try {
                console.log('[AI Service] 📨 Received message from server:', event.data.substring(0, 100));
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('[AI Service] ❌ Error parsing WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('[AI Service] ❌ WebSocket error:', error);
            if (onError) onError(error);
        };

        ws.onclose = (event) => {
            console.log(`[AI Service] 🔌 WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
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
            console.log(`[AI Service] 📤 Frame sent (${(imageBase64.length / 1024).toFixed(2)} KB)`);
        } else {
            console.warn(`[AI Service] ⚠️ Cannot send frame, WebSocket not open (state: ${ws.readyState})`);
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
        } catch (error) {
            console.error('AI Health Check Failed:', error);
            return false;
        }
    },
};
