import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { developmentLogService } from '../services/developmentLog.service';
import { plotService } from '../services/plot.service';
import { DevelopmentLog, PlotOption } from '../types';

export default function DevelopmentLogScreen() {
    const router = useRouter();
    const { employeeId, isAuthenticated } = useAuth();
    const [logs, setLogs] = useState<DevelopmentLog[]>([]);
    const [plots, setPlots] = useState<PlotOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showPlots, setShowPlots] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState<DevelopmentLog | null>(null);

    const loadLogs = useCallback(async () => {
        if (!employeeId) return;

        try {
            const result = await developmentLogService.getByEmployee(employeeId);
            if (result.success && result.data) {
                setLogs(result.data);
            } else {
                Alert.alert('Lỗi', result.error || 'Không thể tải danh sách nhật ký');
            }
        } catch {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [employeeId]);

    const loadRemainingPlots = async () => {
        try {
            const result = await plotService.getOptions();
            if (result && result.success && result.data) {
                setPlots(result.data);
                setShowPlots(true);
            } else {
                setPlots([]);
                setShowPlots(true);
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                setPlots([]);
                setShowPlots(true);
            } else {
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải dữ liệu');
            }
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadLogs();
    }, [loadLogs]);

    useEffect(() => {
        if (isAuthenticated && employeeId) {
            loadLogs();
        }
    }, [isAuthenticated, employeeId, loadLogs]);

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && employeeId) {
                loadLogs();
            }
        }, [isAuthenticated, employeeId, loadLogs])
    );

    const handleAddNew = () => {
        setShowPlots(false);
        loadRemainingPlots();
    };

    const handlePlotSelect = (plot: PlotOption) => {
        setShowPlots(false);
        router.push({
            pathname: '/development-log-form',
            params: {
                plotId: plot.id.toString(),
                plotName: plot.name,
            },
        });
    };

    const handleCardPress = (log: DevelopmentLog) => {
        setSelectedLog(log);
        setShowActionModal(true);
    };

    const handleEdit = () => {
        setShowActionModal(false);
        console.log('[DevelopmentLog] handleEdit selectedLog:', selectedLog);
        if (selectedLog && (selectedLog._id || selectedLog.id)) {
            const logId = selectedLog._id ?? selectedLog.id;
            console.log('[DevelopmentLog] Navigating to edit with id:', logId);
            router.push({
                pathname: '/development-log-edit',
                params: {
                    id: String(logId),
                },
            });
        } else {
            console.log('[DevelopmentLog] No selectedLog or _id/id');
        }
    };

    const handleDelete = async () => {
        if (!selectedLog || (!selectedLog._id && !selectedLog.id)) {
            console.log('[DevelopmentLog] handleDelete: no selectedLog or _id/id');
            return;
        }

        const logId = selectedLog._id ?? selectedLog.id;

        console.log('[DevelopmentLog] handleDelete selectedLog id:', logId);
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn xóa nhật ký này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        setShowActionModal(false);
                        try {
                            console.log('[DevelopmentLog] Calling delete with id:', logId!);
                            const result = await developmentLogService.delete(logId!);
                            console.log('[DevelopmentLog] Delete result:', result);
                            if (result.success) {
                                Alert.alert('Thành công', 'Xóa nhật ký thành công');
                                loadLogs();
                            } else {
                                Alert.alert('Lỗi', result.error || 'Không thể xóa nhật ký');
                            }
                        } catch (error) {
                            console.error('[DevelopmentLog] Delete error:', error);
                            Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa nhật ký');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: DevelopmentLog }) => (
        <TouchableOpacity onPress={() => handleCardPress(item)}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Lô đất: {item.plot_id}</Text>
                    <Text style={styles.cardDate}>
                        {new Date(item.dateReport).toLocaleDateString('vi-VN')}
                    </Text>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.phase}>
                        Giai đoạn: <Text style={styles.phaseValue}>{item.phaseDevelopment}</Text>
                    </Text>

                    {item.notes && <Text style={styles.notes}>Ghi chú: {item.notes}</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    if (!isAuthenticated || !employeeId) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Vui lòng đăng nhập để xem nhật ký</Text>
            </View>
        );
    }

    if (showPlots) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Chọn lô đất</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowPlots(false)}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={plots}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.plotCard}
                            onPress={() => handlePlotSelect(item)}
                        >
                            <Text style={styles.plotName}>{item.name}</Text>
                            <View style={styles.plotInfo}>
                                <Text style={styles.plotDetail}>
                                    Diện tích: {item.acreage} m²
                                </Text>
                                <Text style={styles.plotDetail}>
                                    Số cây: {item.numberOfTrees}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Không có lô đất nào
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Nhật ký phát triển</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddNew}
                >
                    <Text style={styles.addButtonText}>+ Thêm mới</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={logs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Chưa có nhật ký nào</Text>
                    </View>
                }
            />

            <Modal
                visible={showActionModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowActionModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowActionModal(false)}
                >
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={handleEdit}
                        >
                            <Text style={styles.modalButtonText}>Cập nhật</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.deleteButton]}
                            onPress={handleDelete}
                        >
                            <Text style={[styles.modalButtonText, styles.deleteButtonText]}>
                                Xóa
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    list: {
        padding: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cardDate: {
        fontSize: 14,
        color: '#666',
    },
    cardBody: {
        marginBottom: 10,
    },
    phase: {
        fontSize: 14,
        color: '#555',
    },
    phaseValue: {
        fontWeight: 'bold',
        color: '#2196F3',
    },
    notes: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic',
    },
    plotCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    plotName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    plotInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    plotDetail: {
        fontSize: 14,
        color: '#666',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#666',
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 400,
    },
    modalButton: {
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        backgroundColor: '#f0f0f0',
    },
    modalButtonText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#ffebee',
    },
    deleteButtonText: {
        color: '#d32f2f',
    },
});
