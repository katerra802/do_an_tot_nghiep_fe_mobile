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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedTextInput from '../components/themed-text-input';
import { useAuth } from '../contexts/AuthContext';
import { useThemeColor } from '../hooks/use-theme-color';
import { careLogService } from '../services/careLog.service';
import { SupplyOption, supplyService } from '../services/supply.service';
import { CareLog } from '../types';

export default function CareLogFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { employeeId } = useAuth();

    // Lấy plot_id và plotName từ params
    const plotId = params.plotId ? Number(params.plotId) : 0;
    const plotName = params.plotName as string || '';

    // Form state
    const [activeType, setActiveType] = useState<string>('tưới nước');
    const [amount, setAmount] = useState<string>('');
    const [unit, setUnit] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [weather, setWeather] = useState<string>('');
    const [dateReport] = useState<Date>(new Date());

    // Supply selection
    const [supplies, setSupplies] = useState<SupplyOption[]>([]);
    const [selectedSupplyIds, setSelectedSupplyIds] = useState<number[]>([]);
    const [loadingSupplies, setLoadingSupplies] = useState(true);

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
    const infoColor = useThemeColor({}, 'info');
    const pickerColor = useThemeColor({}, 'text');

    // Load supplies
    useEffect(() => {
        loadSupplies();
    }, []);

    const loadSupplies = async () => {
        setLoadingSupplies(true);
        const result = await supplyService.getOptions();
        if (result.success && result.data) {
            setSupplies(result.data);
        } else {
            Alert.alert('Lỗi', result.error || 'Không thể tải danh sách vật tư');
        }
        setLoadingSupplies(false);
    };



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

        if (selectedSupplyIds.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn vật tư sử dụng');
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

        const careLogData: Omit<CareLog, 'id'> = {
            plot_id: plotId,
            employee_id: employeeId,
            supply_ids: selectedSupplyIds.length > 0 ? selectedSupplyIds : undefined,
            active: [activeType],
            notes: notes.trim() || '',
            dateReport: dateReport.toISOString(),
            unit: unit.trim(),
            amount: Number(amount),
            weather: weather.trim() || undefined,
        };

        const result = await careLogService.create(careLogData);

        setSubmitting(false);

        if (result.success) {
            Alert.alert('Thành công', 'Đã tạo nhật ký chăm sóc', [
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>Tạo nhật ký chăm sóc</Text>
                    <Text style={[styles.subtitle, { color: mutedColor }]}>{plotName}</Text>
                </View>

                {/* Hoạt động */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: labelColor }]}>Hoạt động *</Text>
                    <View style={[styles.pickerContainer, { backgroundColor: inputBg, borderColor: borderColor }]}>
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
                    <Text style={[styles.label, { color: labelColor }]}>Ngày báo cáo *</Text>
                    <Text style={[styles.dateText, { backgroundColor: dividerColor, color: textColor }]}>
                        {dateReport.toLocaleDateString('vi-VN')}
                    </Text>
                </View>

                {/* Số lượng vật tư */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: labelColor }]}>Số lượng vật tư *</Text>
                    <ThemedTextInput
                        style={[styles.input, { backgroundColor: inputBg, borderColor: borderColor }]}
                        placeholder="Nhập số lượng"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                {/* Đơn vị */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: labelColor }]}>Đơn vị *</Text>
                    <ThemedTextInput
                        style={[styles.input, { backgroundColor: inputBg, borderColor: borderColor }]}
                        placeholder="Ví dụ: lít, kg, chai"
                        value={unit}
                        onChangeText={setUnit}
                    />
                </View>

                {/* Thời tiết */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: labelColor }]}>Thời tiết</Text>
                    <ThemedTextInput
                        style={[styles.input, { backgroundColor: inputBg, borderColor: borderColor }]}
                        placeholder="Ví dụ: Nắng, Mưa, Âm u"
                        value={weather}
                        onChangeText={setWeather}
                    />
                </View>

                {/* Vật tư sử dụng */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: labelColor }]}>Vật tư sử dụng (chọn 1)</Text>
                    {loadingSupplies ? (
                        <ActivityIndicator size="small" color={successColor} />
                    ) : (
                        <View style={[styles.checkboxContainer, { backgroundColor: inputBg, borderColor: borderColor }]}>
                            {supplies.map((supply) => (
                                <TouchableOpacity
                                    key={supply.id}
                                    style={[styles.checkboxItem, { borderBottomColor: dividerColor }]}
                                    onPress={() => setSelectedSupplyIds([supply.id])}
                                >
                                    <View
                                        style={[
                                            styles.radio,
                                            { borderColor: infoColor },
                                            selectedSupplyIds.includes(supply.id) &&
                                            { borderColor: infoColor },
                                        ]}
                                    >
                                        {selectedSupplyIds.includes(supply.id) && (
                                            <View style={[styles.radioInner, { backgroundColor: infoColor }]} />
                                        )}
                                    </View>
                                    <Text style={[styles.checkboxLabel, { color: textColor }]}>{supply.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
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
                        <Text style={styles.submitButtonText}>Tạo nhật ký</Text>
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
    checkboxContainer: {
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radio: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 12,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    checkboxIcon: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxLabel: {
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
