import { Alert } from 'react-native';
import { AIDetectionResponse, ApiResponse, DiseaseInfo, DiseaseLogRequest, DiseaseLogResponse, MediaUploadResponse } from '../types';
import { backendApi } from './api.config';
import { diseaseService } from './disease.service';

/**
 * Service để quản lý Disease Logs (Nhật ký bệnh)
 */
export const diseaseLogService = {
    /**
     * Lấy thông tin bệnh từ AI detection result
     * @param detectionResult - Kết quả detection từ AI
     * @returns Promise với thông tin bệnh đầy đủ từ database
     */
    getDiseaseInfoFromDetection: async (detectionResult: AIDetectionResponse): Promise<DiseaseInfo | null> => {
        const detections = detectionResult.detections || detectionResult.predictions || [];

        if (detections.length === 0) {
            Alert.alert('Thông báo', 'Không có phát hiện bệnh nào từ AI');
            return null;
        }

        // Lấy detection có confidence cao nhất
        const bestDetection = detections.reduce((prev, current) =>
            (prev.confidence > current.confidence) ? prev : current
        );

        const label = bestDetection.class; // label của bệnh (ví dụ: "sauvebua")

        Alert.alert('Thông báo', `Đang lấy thông tin bệnh cho label: ${label}`);

        const diseaseInfoResponse = await diseaseService.getByLabel(label);

        if (diseaseInfoResponse && diseaseInfoResponse.data.length > 0) {
            return diseaseInfoResponse.data[0]; // Lấy bệnh đầu tiên
        }

        Alert.alert('Thông báo', `Không tìm thấy thông tin bệnh cho label: ${label}`);
        return null;
    },
    /**
     * Upload ảnh lên backend
     * @param imageUri - URI của ảnh từ camera (file://...)
     * @param name - Tên file
     * @returns Promise với thông tin ảnh đã upload
     */
    uploadImage: async (imageUri: string, name: string): Promise<MediaUploadResponse | null> => {
        try {
            const formData = new FormData();

            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: name,
            } as any);

            formData.append('name', name);
            formData.append('directory_id', '15');

            const response = await backendApi.post('/medias/upload/single', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Backend trả về với status code 201
            if (response.status === 201 && response.data.data) {
                return {
                    data: {
                        _id: response.data.data._id,
                        mediaURL: response.data.data.mediaURL,
                        directory_id: response.data.data.directory_id,
                    },
                };
            }

            return null;
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải ảnh lên');
            return null;
        }
    },

    /**
     * Tạo disease log với upload ảnh
     * @param diseaseLogData - Dữ liệu disease log
     * @param capturedImageUri - URI ảnh đã chụp (optional)
     * @returns Promise với disease log response
     */
    createWithImage: async (
        diseaseLogData: Omit<DiseaseLogRequest, 'image_ids'>,
        capturedImageUri?: string
    ): Promise<ApiResponse<DiseaseLogResponse>> => {
        try {
            let imageIds: number[] = [];

            // Upload ảnh nếu có
            if (capturedImageUri) {
                const imageName = `disease_${Date.now()}.jpg`;
                const uploadResult = await diseaseLogService.uploadImage(capturedImageUri, imageName);

                if (uploadResult && uploadResult.data._id) {
                    imageIds.push(uploadResult.data._id);
                } else {
                    Alert.alert('Thông báo', 'Tải ảnh lên thất bại, tiếp tục mà không có ảnh');
                }
            }

            // Tạo disease log với image_ids
            const requestData: DiseaseLogRequest = {
                ...diseaseLogData,
                image_ids: imageIds.length > 0 ? imageIds : undefined,
            };

            const response = await backendApi.post('/diseases-log', requestData);

            // Backend trả về format: { success: true, message: "", data: {...} }
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Tạo báo cáo bệnh thành công',
                };
            }

            return {
                success: false,
                error: 'Invalid response format from backend',
            };
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tạo báo cáo bệnh');
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tạo báo cáo bệnh',
            };
        }
    },
    /**
     * Lấy danh sách disease logs theo employee_id
     * @param employeeId - ID của nhân viên
     * @returns Promise với danh sách disease logs
     */
    getByEmployee: async (employeeId: number): Promise<ApiResponse<DiseaseLogResponse[]>> => {
        try {
            const response = await backendApi.get(`/diseases-log/employee/${employeeId}`);

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
                error: error.response?.data?.message || 'Không thể lấy danh sách nhật ký bệnh',
            };
        }
    },

    /**
     * Cập nhật disease log
     * @param id - ID của disease log
     * @param diseaseLogData - Dữ liệu cập nhật
     * @returns Promise với disease log đã cập nhật
     */
    update: async (id: number, diseaseLogData: Partial<DiseaseLogRequest>): Promise<ApiResponse<DiseaseLogResponse>> => {
        try {
            const response = await backendApi.put(`/diseases-log/${id}`, diseaseLogData);

            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Cập nhật báo cáo bệnh thành công',
                };
            }

            return {
                success: false,
                error: 'Invalid response format from backend',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể cập nhật báo cáo bệnh',
            };
        }
    },

    /**
     * Xóa disease log
     * @param id - ID của disease log
     * @returns Promise với kết quả
     */
    delete: async (id: number): Promise<ApiResponse<void>> => {
        try {
            await backendApi.delete(`/diseases-log/${id}`);
            // Backend trả về status 204 với .send() - axios coi là success
            return {
                success: true,
                message: 'Xóa báo cáo bệnh thành công',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể xóa báo cáo bệnh',
            };
        }
    },

    /**
     * Lấy chi tiết disease log theo ID
     * @param id - ID của disease log
     * @returns Promise với disease log
     */
    getById: async (id: number): Promise<ApiResponse<DiseaseLogResponse>> => {
        try {
            const response = await backendApi.get(`/diseases-log/${id}`);

            if (response.data.success && response.data.data) {
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
                error: error.response?.data?.message || 'Không thể lấy thông tin báo cáo bệnh',
            };
        }
    },
};
