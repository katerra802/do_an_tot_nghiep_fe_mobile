import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { LoginCredentials, User } from '../types';

interface AuthContextType {
    user: User | null;
    employeeId: number | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [employeeId, setEmployeeId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user data khi app khởi động
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            await authService.initializeAuth();
            const currentUser = await authService.getCurrentUser();

            if (currentUser) {
                setUser(currentUser);
                setEmployeeId(currentUser.id); // user.id chính là employee_id từ BE
            }
        } catch (error) {
            console.error('Failed to initialize auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const result = await authService.login(credentials);

            if (result.success && result.data) {
                setUser(result.data.user);
                setEmployeeId(result.data.user.employee_id);
                return { success: true };
            }

            return {
                success: false,
                error: result.error || 'Đăng nhập thất bại'
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Có lỗi xảy ra'
            };
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setEmployeeId(null);
    };

    const refreshAuth = async () => {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setEmployeeId(currentUser.id);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                employeeId,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
