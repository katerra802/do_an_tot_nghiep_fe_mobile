import { Picker } from '@react-native-picker/picker';
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
import { developmentLogService } from '../services/developmentLog.service';
import { DevelopmentLog } from '../types';

export default function DevelopmentLogFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { employeeId } = useAuth();

    // Lấy plot_id và plotName từ params
    const plotId = params.plotId ? Number(params.plotId) : 0;
    const plotName = params.plotName as string || '';

    // Form state
    const [phaseDevelopment, setPhaseDevelopment] = useState<string>('nảy mầm');
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

        if (!phaseDevelopment.trim()) {
            Alert.alert('Lỗi', 'Vui lòng chọn giai đoạn phát triển');
            return;
        }

        setSubmitting(true);

        const developmentLogData: Omit<DevelopmentLog, 'id'> = {
            plot_id: plotId,
            employee_id: employeeId,
            phaseDevelopment: phaseDevelopment,
            dateReport: dateReport.toISOString(),
            notes: notes.trim() || '',
        };

        const result = await developmentLogService.create(developmentLogData);

        setSubmitting(false);

        if (result.success) {
            Alert.alert('Thành công', 'Đã tạo nhật ký phát triển', [
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
                    <Text style={styles.title}>Tạo nhật ký phát triển</Text>
                    <Text style={styles.subtitle}>{plotName}</Text>
                </View>

                {/* Giai đoạn phát triển */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Giai đoạn phát triển *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={phaseDevelopment}
                            onValueChange={setPhaseDevelopment}
                            style={styles.picker}
                        >
                            <Picker.Item label="Nảy mầm" value="nảy mầm" />
                            <Picker.Item label="Sinh trưởng" value="sinh trưởng" />
                            <Picker.Item label="Ra hoa" value="ra hoa" />
                            <Picker.Item label="Kết trái" value="kết trái" />
                            <Picker.Item label="Thu hoạch" value="thu hoạch" />
                        </Picker>
                    </View>
                </View>

                {/* Ngày báo cáo */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Ngày báo cáo *</Text>
                    <Text style={styles.dateText}>
                        {dateReport.toLocaleDateString('vi-VN')}
                    </Text>
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
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    picker: {
        height: 50,
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
