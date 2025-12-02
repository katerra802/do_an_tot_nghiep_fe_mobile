import ThemedTextInput from '@/components/themed-text-input';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { developmentLogService } from '../services/developmentLog.service';
import { DevelopmentLog } from '../types';

export default function DevelopmentLogEditScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const logId = params.id ? Number(params.id) : 0;

    // Form state
    const [phaseDevelopment, setPhaseDevelopment] = useState<string>('nảy mầm');
    const [notes, setNotes] = useState<string>('');
    const pickerColor = useThemeColor({}, 'text');
    const [plotName, setPlotName] = useState<string>('');
    const [dateReport, setDateReport] = useState<Date>(new Date());

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Theme colors
    const bgColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({}, 'cardBackground');
    const inputBg = useThemeColor({}, 'inputBackground');
    const textColor = useThemeColor({}, 'text');
    const labelColor = useThemeColor({}, 'label');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const dividerColor = useThemeColor({}, 'divider');
    const successColor = useThemeColor({}, 'success');

    useEffect(() => {
        if (logId) {
            loadLogData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logId]);

    const loadLogData = async () => {
        setLoading(true);
        const result = await developmentLogService.getById(logId);

        if (result.success && result.data) {
            const log = result.data;
            setPhaseDevelopment(log.phaseDevelopment || 'nảy mầm');
            setNotes(log.notes || '');
            setPlotName(`Lô đất: ${log.plot_id}`);
            setDateReport(new Date(log.dateReport));
        } else {
            Alert.alert('Lỗi', result.error || 'Không thể tải thông tin nhật ký', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!logId) {
            Alert.alert('Lỗi', 'Không có thông tin nhật ký');
            return;
        }

        if (!phaseDevelopment.trim()) {
            Alert.alert('Lỗi', 'Vui lòng chọn giai đoạn phát triển');
            return;
        }

        setSubmitting(true);

        const updateData: Partial<DevelopmentLog> = {
            phaseDevelopment: phaseDevelopment,
            notes: notes.trim() || '',
        };

        const result = await developmentLogService.update(logId, updateData);

        setSubmitting(false);

        if (result.success) {
            Alert.alert('Thành công', 'Đã cập nhật nhật ký phát triển', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } else {
            Alert.alert('Lỗi', result.error || 'Không thể cập nhật nhật ký');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={successColor} />
                    <Text style={[styles.loadingText, { color: mutedColor }]}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>Cập nhật nhật ký phát triển</Text>
                    <Text style={[styles.subtitle, { color: mutedColor }]}>{plotName}</Text>
                </View>

                {/* Giai đoạn phát triển */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: labelColor }]}>Giai đoạn phát triển *</Text>
                    <View style={[styles.pickerContainer, { backgroundColor: inputBg, borderColor: borderColor }]}>
                        <Picker
                            selectedValue={phaseDevelopment}
                            onValueChange={setPhaseDevelopment}
                            style={[styles.picker, { color: pickerColor }]}
                        >
                            <Picker.Item label="Nảy mầm" value="nảy mầm" />
                            <Picker.Item label="Sinh trưởng thân lá" value="sinh trưởng thân lá" />
                            <Picker.Item label="Ra hoa" value="ra hoa" />
                            <Picker.Item label="Đậu trái" value="đậu trái" />
                            <Picker.Item label="Phát triển trái" value="phát triển trái" />
                            <Picker.Item label="Thu hoạch" value="thu hoạch" />
                        </Picker>
                    </View>
                </View>

                {/* Ngày báo cáo */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: labelColor }]}>Ngày báo cáo</Text>
                    <Text style={[styles.dateText, { backgroundColor: dividerColor, color: textColor }]}>
                        {dateReport.toLocaleDateString('vi-VN')}
                    </Text>
                </View>

                {/* Ghi chú */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: labelColor }]}>Ghi chú</Text>
                    <ThemedTextInput
                        style={[styles.input, styles.textArea, { backgroundColor: inputBg, borderColor: borderColor }]}
                        placeholder="Nhập ghi chú (nếu có)"
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                {/* Submit button */}
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: submitting ? mutedColor : successColor }]}
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
                    style={[styles.cancelButton, { backgroundColor: cardBg, borderColor: borderColor }]}
                    onPress={() => router.back()}
                    disabled={submitting}
                >
                    <Text style={[styles.cancelButtonText, { color: mutedColor }]}>Hủy</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
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
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    pickerContainer: {
        borderRadius: 8,
        borderWidth: 1,
    },
    picker: {
        height: 50,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateText: {
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    submitButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 20,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
