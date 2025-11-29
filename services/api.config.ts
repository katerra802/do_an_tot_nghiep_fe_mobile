import axios from 'axios';

// Cấu hình base URLs
export const API_CONFIG = {
    // Backend API (sẽ được deploy sau)
    BACKEND_URL: 'http://192.168.1.6:3000/api', // IP máy tính trong mạng local

    // AI Model API (Python FastAPI)
    AI_URL: 'http://192.168.1.6:8000', // URL của Model AI
};

// Tạo axios instance cho Backend
export const backendApi = axios.create({
    baseURL: API_CONFIG.BACKEND_URL,
    timeout: 30000, // Tăng timeout lên 30 giây
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tạo axios instance cho AI API
export const aiApi = axios.create({
    baseURL: API_CONFIG.AI_URL,
    timeout: 30000, // AI processing có thể mất nhiều thời gian hơn
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptors cho Backend API
backendApi.interceptors.request.use(
    (config) => {
        // Có thể thêm token authentication ở đây
        // const token = await AsyncStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

backendApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // Không log 404 errors
        if (error.response && error.response.status !== 404) {
            console.error('Backend API Error:', error.response.data);
        } else if (error.request && !error.response) {
            // Chỉ log khi không có response (network error)
            console.error('Backend API No Response:', error.request);
        }
        return Promise.reject(error);
    }
);

// Interceptors cho AI API
aiApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // Không log 404 errors
        if (error.response && error.response.status !== 404) {
            console.error('AI API Error:', error.response.data);
        } else if (error.request && !error.response) {
            // Chỉ log khi không có response (network error)
            console.error('AI API No Response:', error.request);
        }
        return Promise.reject(error);
    }
);
