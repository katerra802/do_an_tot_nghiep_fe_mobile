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
import { careLogService } from '../services/careLog.service';
import { SupplyOption, supplyService } from '../services/supply.service';
import { CareLog } from '../types';

export default function CareLogEditScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const logId = params.id ? Number(params.id) : 0;

    // Debug
    console.log('[CareLogEditScreen] params:', params);
    console.log('[CareLogEditScreen] logId:', logId);

    // Form state
    const [activeType, setActiveType] = useState<string>('tưới nước');
    const [amount, setAmount] = useState<string>('');
    const [unit, setUnit] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [weather, setWeather] = useState<string>('');
    const [plotName, setPlotName] = useState<string>('');
    const [dateReport, setDateReport] = useState<Date>(new Date());

    // Supply selection
    const [supplies, setSupplies] = useState<SupplyOption[]>([]);
    const [selectedSupplyIds, setSelectedSupplyIds] = useState<number[]>([]);
    const [loadingSupplies, setLoadingSupplies] = useState(true);
    const pickerColor = useThemeColor({}, 'text');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (logId) {
            loadLogData();
        }
        loadSupplies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logId]);

    const loadLogData = async () => {
        setLoading(true);
        console.log('[CareLogEditScreen] loadLogData - calling getById with logId:', logId);
        const result = await careLogService.getById(logId);
        console.log('[CareLogEditScreen] getById result:', result);
        if (result.success && result.data) {
            const log = result.data;
            setActiveType(log.active?.[0] || 'tưới nước');
            setAmount(log.amount?.toString() || '');
            setUnit(log.unit || '');
            setNotes(log.notes || '');
            setWeather(log.weather || '');
            setPlotName(`Lô đất: ${log.plot_id}`);
            setDateReport(new Date(log.dateReport));
            // Set supply ids if available
            if (log.supply_ids) {
                setSelectedSupplyIds(log.supply_ids);
            }
        } else {
            Alert.alert('Lỗi', result.error || 'Không thể tải thông tin nhật ký', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        }
        setLoading(false);
    };

    const loadSupplies = async () => {
        setLoadingSupplies(true);
        const result = await supplyService.getOptions();
        if (result.success && result.data) {
            setSupplies(result.data);
        }
        setLoadingSupplies(false);
    };

    const toggleSupply = (supplyId: number) => {
        setSelectedSupplyIds((prev) =>
            prev.includes(supplyId)
                ? prev.filter((id) => id !== supplyId)
                : [...prev, supplyId]
        );
    };

    const handleSubmit = async () => {
        if (!logId) {
            Alert.alert('Lỗi', 'Không có thông tin nhật ký');
            return;
        }

        if (!amount || isNaN(Number(amount))) {
            Alert.alert('Lỗi', 'Vui lòng nhập số lượng vật tư hợp lệ');
            return;
        }

        if (!unit.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đơn vị');
            return;
        }

        setSubmitting(true);

        const updateData: Partial<CareLog> = {
            supply_ids: selectedSupplyIds.length > 0 ? selectedSupplyIds : undefined,
            active: [activeType],
            notes: notes.trim() || '',
            unit: unit.trim(),
            amount: Number(amount),
            weather: weather.trim() || undefined,
        };

        const result = await careLogService.update(logId, updateData);

        setSubmitting(false);

        if (result.success) {
            Alert.alert('Thành công', 'Đã cập nhật nhật ký chăm sóc', [
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
                    <Text style={styles.title}>Cập nhật nhật ký chăm sóc</Text>
                    <Text style={styles.subtitle}>{plotName}</Text>
                </View>

                {/* Hoạt động */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Hoạt động *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={activeType}
                            onValueChange={setActiveType}
                            style={[styles.picker, { color: pickerColor }]}
                        >
                            <Picker.Item label="Tưới nước" value="tưới nước" />
                            <Picker.Item label="Bón phân" value="bón phân" />
                            <Picker.Item label="Phun thuốc" value="phun thuốc" />
                            <Picker.Item label="Cắt tỉa" value="cắt tỉa" />
                        </Picker>
                    </View>
                </View>

                {/* Ngày báo cáo */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Ngày báo cáo</Text>
                    <Text style={styles.dateText}>
                        {dateReport.toLocaleDateString('vi-VN')}
                    </Text>
                </View>

                {/* Số lượng vật tư */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Số lượng vật tư *</Text>
                    <ThemedTextInput
                        style={styles.input}
                        placeholder="Nhập số lượng"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                {/* Đơn vị */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Đơn vị *</Text>
                    <ThemedTextInput
                        style={styles.input}
                        placeholder="Ví dụ: lít, kg, chai"
                        value={unit}
                        onChangeText={setUnit}
                    />
                </View>

                {/* Thời tiết */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Thời tiết</Text>
                    <ThemedTextInput
                        style={styles.input}
                        placeholder="Ví dụ: Nắng, Mưa, Âm u"
                        value={weather}
                        onChangeText={setWeather}
                    />
                </View>

                {/* Vật tư sử dụng */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Vật tư sử dụng (chọn nhiều)</Text>
                    {loadingSupplies ? (
                        <ActivityIndicator size="small" color="#2196F3" />
                    ) : (
                        <View style={styles.checkboxContainer}>
                            {supplies.map((supply) => (
                                <TouchableOpacity
                                    key={supply.id}
                                    style={styles.checkboxItem}
                                    onPress={() => toggleSupply(supply.id)}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            selectedSupplyIds.includes(supply.id) &&
                                            styles.checkboxChecked,
                                        ]}
                                    >
                                        {selectedSupplyIds.includes(supply.id) && (
                                            <Text style={styles.checkboxIcon}>✓</Text>
                                        )}
                                    </View>
                                    <Text style={styles.checkboxLabel}>{supply.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Ghi chú */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <ThemedTextInput
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
    checkboxContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#2196F3',
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#2196F3',
    },
    checkboxIcon: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxLabel: {
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
