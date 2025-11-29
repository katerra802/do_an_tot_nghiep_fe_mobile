import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, LoginCredentials, LoginResponse, User } from '../types';
import { backendApi } from './api.config';

const AUTH_STORAGE_KEY = '@auth_data';
const TOKEN_STORAGE_KEY = '@access_token';
const REFRESH_TOKEN_STORAGE_KEY = '@refresh_token';

/**
 * Service để quản lý Authentication
 */
export const authService = {
    /**
     * Đăng nhập
     */
    login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse['data']>> => {
        try {
            const response = await backendApi.post<LoginResponse>('/auth/login', credentials);

            if (response.data.success) {
                // Lưu tokens và user info vào AsyncStorage
                await Promise.all([
                    AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.data.accessToken),
                    AsyncStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.data.data.refreshToken),
                    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response.data.data.user)),
                ]);

                // Set token vào axios headers
                backendApi.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.accessToken}`;

                return {
                    success: true,
                    data: response.data.data,
                    message: 'Đăng nhập thành công',
                };
            }

            return {
                success: false,
                error: 'Đăng nhập thất bại',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể kết nối đến server',
            };
        }
    },

    /**
     * Đăng xuất
     */
    logout: async (): Promise<ApiResponse<void>> => {
        try {
            // Xóa tokens và user info khỏi AsyncStorage
            await Promise.all([
                AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
                AsyncStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY),
                AsyncStorage.removeItem(AUTH_STORAGE_KEY),
            ]);

            // Xóa token khỏi axios headers
            delete backendApi.defaults.headers.common['Authorization'];

            return {
                success: true,
                message: 'Đăng xuất thành công',
            };
        } catch {
            return {
                success: false,
                error: 'Có lỗi xảy ra khi đăng xuất',
            };
        }
    },    /**
     * Lấy access token từ storage
     */
    getAccessToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        } catch {
            return null;
        }
    },    /**
     * Lấy refresh token từ storage
     */
    getRefreshToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
        } catch {
            return null;
        }
    },    /**
     * Lấy thông tin user từ storage
     */
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    },    /**
     * Kiểm tra xem user đã đăng nhập chưa
     */
    isAuthenticated: async (): Promise<boolean> => {
        const token = await authService.getAccessToken();
        return !!token;
    },

    /**
     * Refresh access token
     */
    refreshToken: async (): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
        try {
            const refreshToken = await authService.getRefreshToken();

            if (!refreshToken) {
                return {
                    success: false,
                    error: 'Không tìm thấy refresh token',
                };
            }

            const response = await backendApi.post('/auth/refresh', { refreshToken });

            if (response.data.success) {
                // Lưu tokens mới
                await Promise.all([
                    AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.data.accessToken),
                    AsyncStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.data.data.refreshToken),
                ]);

                // Set token mới vào axios headers
                backendApi.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.accessToken}`;

                return {
                    success: true,
                    data: response.data.data,
                };
            }

            return {
                success: false,
                error: 'Không thể refresh token',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể refresh token',
            };
        }
    },

    /**
     * Khởi tạo auth state khi app start
     */
    initializeAuth: async (): Promise<void> => {
        const token = await authService.getAccessToken();
        if (token) {
            backendApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    },
};
