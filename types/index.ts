// Auth & User Types
export interface User {
    id: number;
    role: string;
    name: string;
    email?: string;
    employee_id: number;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: User;
    };
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    employeeId?: number;
}

// Types for Disease Log
export interface DiseaseLog {
    id?: number;
    disease_id: number;
    plant_plot_id: number;
    employee_ids: number;
    image_ids?: number[];
    dateReport: Date | string;
    notes?: string;
    isDeleted?: boolean;
    created_date?: Date | string | null;
    updated_date?: Date | string | null;
}

// Disease Log Request (gửi lên backend)
export interface DiseaseLogRequest {
    id?: number;
    disease_id: number;
    plant_plot_id: number;
    employee_ids: number;
    image_ids?: number[];
    dateReport: Date | string;
    notes?: string;
}

// Disease Log Response (nhận từ backend)
export interface DiseaseLogResponse {
    _id: number;
    disease_id: number;
    plant_plot: {
        id: number;
        plot_id?: number;
        state_plant: string;
        planted_at?: Date | null;
        position?: { row: number; column: number };
    };
    employee_ids: number;
    image?: {
        id: number;
        mediaPath: string;
    }[];
    dateReport: Date;
    notes?: string;
}

// Media Upload Types
export interface MediaUploadRequest {
    file: File | Blob;
    name: string;
    directory_id: number;
}

export interface MediaUploadResponse {
    data: {
        _id: number;
        mediaURL: string;
        directory_id: number;
    };
}// Types for Care Log
export interface CareLog {
    id?: number;
    plot_id: number;
    employee_id: number;
    supply_ids?: number[];
    active: string[];
    notes?: string;
    dateReport: Date | string;
    unit?: string;
    amount?: number;
    weather?: string;
    isDeleted?: boolean;
    created_date?: Date | string | null;
    updated_date?: Date | string | null;
}

// Types for Development Log
export interface DevelopmentLog {
    id?: number;
    plot_id: number;
    employee_id: number;
    phaseDevelopment: string;
    dateReport: Date | string;
    notes?: string;
    isDeleted?: boolean;
    created_date?: Date | string | null;
    updated_date?: Date | string | null;
}

// Types for Harvest Log
export interface HarvestLog {
    id?: number;
    plot_id: number;
    employee_id: number;
    dateReport: Date | string;
    quantity: number;
    unit: string;
    notes?: string;
    isDeleted?: boolean;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
}

// AI Detection Types
export interface AIDetection {
    track_id: number | null;
    class_id: number;
    class: string; // label của bệnh
    confidence: number;
    box: number[];
}

export interface AIDetectionResponse {
    predictions?: AIDetection[];
    detections?: AIDetection[];
    processed_media_base64?: string;
    media_type?: string;
    status?: string;
    message?: string;
}

// Disease Info Types (thông tin bệnh từ database)
export interface DiseaseInfo {
    _id: number;
    name: string;
    label: string;
    scientificName?: string;
    directory_id: number;
    disease_category_id?: number;
    disease_category_name: string;
    medias: {
        _id: number;
        mediaURL: string;
    }[];
    description?: string;
    symptoms: string;
    affectedParts?: ("Lá" | "Thân" | "Cành" | "Rễ" | "Hoa" | "Quả")[];
    cause?: string;
    favorableConditions?: string;
    preventionMeasures?: string;
    treatmentMeasures?: string;
    recommendedSupply?: number[];
    isDeleted?: boolean;
}

export interface DiseaseInfoResponse {
    success: boolean;
    message: string;
    results: number;
    data: DiseaseInfo[];
}

// Plot Types (Lô đất)
export interface PlotOption {
    id: number;
    name: string;
    acreage: number;
    numberOfTrees: number;
}

export interface PlotOptionsResponse {
    success: boolean;
    message: string;
    results: number;
    data: PlotOption[];
}

// Plant Plot Types (Cây trồng trong lô)
export interface PlantPlot {
    id: number;
    plot_id: number;
    state_plant: string[];
    planted_at?: Date | null;
    position?: { row: number; column: number };
    isDeleted?: boolean;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}

export interface PlantPlotResponse {
    success: boolean;
    message: string;
    results: number;
    data: PlantPlot[];
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
