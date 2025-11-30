import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { diseaseLogService } from '../services/diseaseLog.service';
import { DiseaseLogResponse } from '../types';

export default function DiseaseLogScreen() {
    const router = useRouter();
    const { employeeId, isAuthenticated } = useAuth();
    const [logs, setLogs] = useState<DiseaseLogResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedLog, setSelectedLog] = useState<DiseaseLogResponse | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);

    const loadLogs = useCallback(async () => {
        if (!employeeId) return;

        try {
            const result = await diseaseLogService.getByEmployee(employeeId);
            if (result.success && result.data) {
                setLogs(result.data);
            } else {
                Alert.alert('Lỗi', result.error || 'Không thể tải danh sách báo cáo bệnh');
            }
        } catch {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [employeeId]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadLogs();
    }, [loadLogs]);

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && employeeId) {
                loadLogs();
            }
        }, [isAuthenticated, employeeId, loadLogs])
    );

    const handleCardPress = (log: DiseaseLogResponse) => {
        setSelectedLog(log);
        setShowActionModal(true);
    };

    const handleEdit = () => {
        setShowActionModal(false);
        if (selectedLog) {
            router.push({
                pathname: '/disease-log-edit',
                params: {
                    logId: selectedLog._id.toString(),
                },
            });
        }
    };

    const handleDelete = async () => {
        if (!selectedLog) return;

        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn xóa báo cáo bệnh này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        setShowActionModal(false);
                        try {
                            const result = await diseaseLogService.delete(selectedLog._id);
                            if (result.success) {
                                Alert.alert('Thành công', 'Xóa báo cáo bệnh thành công');
                                loadLogs();
                            } else {
                                Alert.alert('Lỗi', result.error || 'Không thể xóa báo cáo bệnh');
                            }
                        } catch {
                            Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa báo cáo bệnh');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: DiseaseLogResponse }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Báo cáo bệnh #{item._id}</Text>
                <Text style={styles.cardDate}>
                    {new Date(item.dateReport).toLocaleDateString('vi-VN')}
                </Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.info}>Lô đất: {item.plant_plot?.plot_id || 'N/A'}</Text>
                <Text style={styles.info}>
                    Trạng thái cây: {item.plant_plot?.state_plant || 'N/A'}
                </Text>

                {item.notes && <Text style={styles.notes}>Ghi chú: {item.notes}</Text>}

                {item.image && item.image.length > 0 && (
                    <View style={styles.imageContainer}>
                        {item.image.slice(0, 3).map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: img.mediaPath }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                            />
                        ))}
                        {item.image.length > 3 && (
                            <View style={styles.moreImages}>
                                <Text style={styles.moreImagesText}>+{item.image.length - 3}</Text>
                            </View>
                        )}
                    </View>
                )}
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
                <Text style={styles.errorText}>Vui lòng đăng nhập để xem báo cáo bệnh</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Báo cáo bệnh hại</Text>
            </View>

            <FlatList
                data={logs}
                renderItem={renderItem}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Chưa có báo cáo bệnh nào</Text>
                    </View>
                }
            />

            {/* Action Modal */}
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
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    title: {
        fontSize: 20,
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
    info: {
        fontSize: 14,
        color: '#666',
        marginVertical: 2,
    },
    notes: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic',
    },
    imageContainer: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 5,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    moreImages: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreImagesText: {
        color: '#fff',
        fontSize: 16,
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
