import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { plotService } from '../services/plot.service';
import { PlotOption } from '../types';
import { useAuth } from './AuthContext';

interface PlotContextType {
    plots: PlotOption[];
    isLoading: boolean;
    error: string | null;
    refreshPlots: () => Promise<void>;
}

const PlotContext = createContext<PlotContextType | undefined>(undefined);

export const PlotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [plots, setPlots] = useState<PlotOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    const loadPlots = async () => {
        if (!isAuthenticated) {
            setPlots([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await plotService.getOptions();

            if (response && response.success) {
                setPlots(response.data);
            } else {
                setError('Không thể tải danh sách lô đất');
            }
        } catch {
            setError('Lỗi khi tải danh sách lô đất');
        } finally {
            setIsLoading(false);
        }
    };

    // Load plots khi đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            loadPlots();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const refreshPlots = async () => {
        await loadPlots();
    };

    return (
        <PlotContext.Provider value={{ plots, isLoading, error, refreshPlots }}>
            {children}
        </PlotContext.Provider>
    );
};

export const usePlots = (): PlotContextType => {
    const context = useContext(PlotContext);
    if (!context) {
        throw new Error('usePlots must be used within a PlotProvider');
    }
    return context;
};
