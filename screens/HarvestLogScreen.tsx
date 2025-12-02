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
import { usePlots } from '../contexts/PlotContext';
import { useThemeColor } from '../hooks/use-theme-color';
import { harvestLogService } from '../services/harvestLog.service';
import { plotService } from '../services/plot.service';
import { HarvestLog, PlotOption } from '../types';

export default function HarvestLogScreen() {
    const router = useRouter();
    const { employeeId, isAuthenticated } = useAuth();
    const { plots: contextPlots } = usePlots();
    const [logs, setLogs] = useState<HarvestLog[]>([]);
    const [plots, setPlots] = useState<PlotOption[]>([]);

    // Sử dụng contextPlots nếu có, nếu không fallback về plots local
    const allPlots = contextPlots.length > 0 ? contextPlots : plots;
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showPlots, setShowPlots] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState<HarvestLog | null>(null);

    // Theme colors
    const bgColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({}, 'cardBackground');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const labelColor = useThemeColor({}, 'label');
    const borderColor = useThemeColor({}, 'border');
    const dividerColor = useThemeColor({}, 'divider');
    const successColor = useThemeColor({}, 'success');
    const dangerColor = useThemeColor({}, 'danger');
    const overlayColor = useThemeColor({}, 'overlay');

    const loadLogs = useCallback(async () => {
        if (!employeeId) return;

        try {
            const result = await harvestLogService.getByEmployee(employeeId);
            if (result.success && result.data) {
                setLogs(result.data);
            } else {
                Alert.alert('Thông báo', result.error || 'Không thể tải danh sách nhật ký');
            }
        } catch {
            Alert.alert('Thông báo', 'Có lỗi xảy ra khi tải dữ liệu');
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
            pathname: '/harvest-log-form',
            params: {
                plotId: plot.id.toString(),
                plotName: plot.name,
            },
        });
    };

    const handleCardPress = (log: HarvestLog) => {
        setSelectedLog(log);
        setShowActionModal(true);
    };

    const handleEdit = () => {
        setShowActionModal(false);

        if (selectedLog && (selectedLog._id || selectedLog.id)) {
            const logId = selectedLog._id ?? selectedLog.id;

            router.push({
                pathname: '/harvest-log-edit',
                params: {
                    id: String(logId),
                },
            });
        } else {

        }
    };

    const handleDelete = async () => {
        if (!selectedLog || (!selectedLog._id && !selectedLog.id)) {
            return;
        }

        const logId = selectedLog._id ?? selectedLog.id;
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
                            const result = await harvestLogService.delete(logId!);
                            if (result.success) {
                                Alert.alert('Thành công', 'Xóa nhật ký thành công');
                                loadLogs();
                            } else {
                                Alert.alert('Lỗi', result.error || 'Không thể xóa nhật ký');
                            }
                        } catch {
                            Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa nhật ký');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: HarvestLog }) => {
        const plotName = allPlots.find(p => String(p.id) === String(item.plot_id))?.name || 'Không xác định';

        return (
            <TouchableOpacity onPress={() => handleCardPress(item)}>
                <View style={[styles.card, { backgroundColor: cardBg }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: textColor }]}>Lô đất: #{item.plot_id} - {plotName}</Text>
                        <Text style={[styles.cardDate, { color: mutedColor }]}>
                            {new Date(item.dateReport).toLocaleDateString('vi-VN')}
                        </Text>
                    </View>

                    <View style={styles.cardBody}>
                        <View style={styles.quantityContainer}>
                            <Text style={[styles.quantityLabel, { color: labelColor }]}>Sản lượng:</Text>
                            <Text style={[styles.quantityValue, { color: successColor }]}>
                                {item.quantity} {item.unit}
                            </Text>
                        </View>

                        {item.notes && <Text style={[styles.notes, { color: mutedColor }]}>Ghi chú: {item.notes}</Text>}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color={successColor} />
            </View>
        );
    }

    if (!isAuthenticated || !employeeId) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: bgColor }]}>
                <Text style={[styles.errorText, { color: mutedColor }]}>Vui lòng đăng nhập để xem nhật ký</Text>
            </View>
        );
    }

    if (showPlots) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
                <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
                    <Text style={[styles.title, { color: textColor }]}>Chọn lô đất</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowPlots(false)}
                    >
                        <Text style={[styles.closeButtonText, { color: mutedColor }]}>✕</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={plots}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.plotCard, { backgroundColor: cardBg, borderLeftColor: successColor }]}
                            onPress={() => handlePlotSelect(item)}
                        >
                            <Text style={[styles.plotName, { color: textColor }]}>{item.name}</Text>
                            <View style={styles.plotInfo}>
                                <Text style={[styles.plotDetail, { color: mutedColor }]}>
                                    Diện tích: {item.acreage} m²
                                </Text>
                                <Text style={[styles.plotDetail, { color: mutedColor }]}>
                                    Số cây: {item.numberOfTrees}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: mutedColor }]}>
                                Không có lô đất nào
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
                <Text style={[styles.title, { color: textColor }]}>Nhật ký thu hoạch</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: successColor }]}
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
                        <Text style={[styles.emptyText, { color: mutedColor }]}>Chưa có nhật ký nào</Text>
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
                    style={[styles.modalOverlay, { backgroundColor: overlayColor }]}
                    activeOpacity={1}
                    onPress={() => setShowActionModal(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: dividerColor }]}
                            onPress={handleEdit}
                        >
                            <Text style={[styles.modalButtonText, { color: textColor }]}>Cập nhật</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: dangerColor + '20' }]}
                            onPress={handleDelete}
                        >
                            <Text style={[styles.modalButtonText, { color: dangerColor }]}>
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
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButton: {
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
    },
    cardDate: {
        fontSize: 14,
    },
    cardBody: {
        marginBottom: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityLabel: {
        fontSize: 14,
        marginRight: 8,
    },
    quantityValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    notes: {
        fontSize: 14,
        marginTop: 5,
        fontStyle: 'italic',
    },
    plotCard: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
    },
    plotName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    plotInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    plotDetail: {
        fontSize: 14,
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
    errorText: {
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 400,
    },
    modalButton: {
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
    },
    modalButtonText: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
});
