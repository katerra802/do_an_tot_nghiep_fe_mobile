import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { diseaseLogService } from '../services/diseaseLog.service';

export default function DiseaseLogEditScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const logId = params.id ? Number(params.id) : 0;

    // Form state
    const [notes, setNotes] = useState<string>('');
    const [plantPlotInfo, setPlantPlotInfo] = useState<string>('');
    const [dateReport, setDateReport] = useState<Date>(new Date());

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (logId) {
            loadLogData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logId]);

    const loadLogData = async () => {
        setLoading(true);
        const result = await diseaseLogService.getById(Number(logId));
        if (result.success && result.data) {
            const log = result.data;
            setNotes(log.notes || '');
            setPlantPlotInfo(`Lô đất: ${log.plant_plot?.plot_id}, Trạng thái: ${log.plant_plot?.state_plant}`);
            setDateReport(new Date(log.dateReport));
        } else {
            Alert.alert('Lỗi', result.error || 'Không thể tải thông tin báo cáo', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!logId) {
            Alert.alert('Lỗi', 'Không có thông tin báo cáo');
            return;
        }

        setSubmitting(true);

        const updateData = {
            notes: notes.trim() || '',
        };

        const result = await diseaseLogService.update(Number(logId), updateData);

        setSubmitting(false);

        if (result.success) {
            Alert.alert('Thành công', 'Đã cập nhật báo cáo bệnh', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } else {
            Alert.alert('Lỗi', result.error || 'Không thể cập nhật báo cáo');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Cập nhật báo cáo bệnh</Text>
                    <Text style={styles.subtitle}>{plantPlotInfo}</Text>
                </View>

                {/* Ngày báo cáo */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Ngày báo cáo</Text>
                    <Text style={styles.dateText}>
                        {dateReport.toLocaleDateString('vi-VN')}
                    </Text>
                </View>

                {/* Ghi chú */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Nhập ghi chú về bệnh"
                        multiline
                        numberOfLines={6}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                {/* Submit button */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Cập nhật</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={submitting}
                >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    dateText: {
        backgroundColor: '#e8e8e8',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#FF9800',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});
