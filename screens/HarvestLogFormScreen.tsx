import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { harvestLogService } from '../services/harvestLog.service';
import { HarvestLog } from '../types';

export default function HarvestLogFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { employeeId } = useAuth();

    // Lấy plot_id và plotName từ params
    const plotId = params.plotId ? Number(params.plotId) : 0;
    const plotName = params.plotName as string || '';

    // Form state
    const [quantity, setQuantity] = useState<string>('');
    const [unit, setUnit] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [dateReport] = useState<Date>(new Date());

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (!plotId) {
            Alert.alert('Lỗi', 'Không có thông tin lô đất');
            return;
        }

        if (!employeeId) {
            Alert.alert('Lỗi', 'Không có thông tin nhân viên');
            return;
        }

        if (!quantity || isNaN(Number(quantity))) {
            Alert.alert('Lỗi', 'Vui lòng nhập sản lượng hợp lệ');
            return;
        }

        if (!unit.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đơn vị');
            return;
        }

        setSubmitting(true);

        const harvestLogData: Omit<HarvestLog, 'id'> = {
            plot_id: plotId,
            employee_id: employeeId,
            quantity: Number(quantity),
            unit: unit.trim(),
            dateReport: dateReport.toISOString(),
            notes: notes.trim() || '',
        };

        const result = await harvestLogService.create(harvestLogData);

        setSubmitting(false);

        if (result.success) {
            Alert.alert('Thành công', 'Đã tạo nhật ký thu hoạch', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } else {
            Alert.alert('Lỗi', result.error || 'Không thể tạo nhật ký');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Tạo nhật ký thu hoạch</Text>
                    <Text style={styles.subtitle}>{plotName}</Text>
                </View>

                {/* Ngày báo cáo */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Ngày báo cáo *</Text>
                    <Text style={styles.dateText}>
                        {dateReport.toLocaleDateString('vi-VN')}
                    </Text>
                </View>

                {/* Sản lượng */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Sản lượng *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập sản lượng"
                        keyboardType="numeric"
                        value={quantity}
                        onChangeText={setQuantity}
                    />
                </View>

                {/* Đơn vị */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Đơn vị *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ví dụ: kg, tấn, tạ"
                        value={unit}
                        onChangeText={setUnit}
                    />
                </View>

                {/* Ghi chú */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Nhập ghi chú (nếu có)"
                        multiline
                        numberOfLines={4}
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
                        <Text style={styles.submitButtonText}>Tạo nhật ký</Text>
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
        height: 100,
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
        backgroundColor: '#4CAF50',
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
