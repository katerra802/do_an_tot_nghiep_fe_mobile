import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ThemedTextInput from '../components/themed-text-input';
import { useAuth } from '../contexts/AuthContext';
import { usePlots } from '../contexts/PlotContext';
import { useThemeColor } from '../hooks/use-theme-color';
import { diseaseLogService } from '../services/diseaseLog.service';
import { plantPlotService } from '../services/plantPlot.service';
import { AIDetectionResponse, DiseaseInfo, PlantPlot } from '../types';

export default function DiseaseLogFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { plots, isLoading: plotsLoading } = usePlots();
    const { employeeId } = useAuth();

    const [loading, setLoading] = useState(false);
    const [diseaseInfo, setDiseaseInfo] = useState<DiseaseInfo | null>(null);
    const [detectionData, setDetectionData] = useState<AIDetectionResponse | null>(null);
    const [capturedImage, setCapturedImage] = useState<string>('');

    const [selectedPlotId, setSelectedPlotId] = useState<number | undefined>(undefined);
    const [plantPlots, setPlantPlots] = useState<PlantPlot[]>([]);
    const [selectedPlantPlotId, setSelectedPlantPlotId] = useState<number | undefined>(undefined);
    const [loadingPlantPlots, setLoadingPlantPlots] = useState(false);

    const [notes, setNotes] = useState('');
    const hasLoadedRef = useRef(false);

    // Theme colors
    const bgColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({}, 'cardBackground');
    const inputBg = useThemeColor({}, 'inputBackground');
    const textColor = useThemeColor({}, 'text');
    const labelColor = useThemeColor({}, 'label');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const dividerColor = useThemeColor({}, 'divider');
    const warningColor = useThemeColor({}, 'warning');
    const infoColor = useThemeColor({}, 'info');
    const pickerColor = useThemeColor({}, 'text');

    useEffect(() => {
        // Chỉ load 1 lần khi mount
        if (hasLoadedRef.current) {
            return;
        }

        // Parse data từ camera screen và lấy thông tin bệnh
        const loadDiseaseInfo = async () => {
            hasLoadedRef.current = true;

            // Kiểm tra cả detectionResult và detectionData (backward compatibility)
            const detectionParam = params.detectionResult || params.detectionData;
            if (detectionParam) {
                try {
                    const data = JSON.parse(detectionParam as string);
                    setDetectionData(data);


                    // Lấy thông tin bệnh từ database
                    const info = await diseaseLogService.getDiseaseInfoFromDetection(data);
                    if (info) {
                        setDiseaseInfo(info);

                    } else {
                        Alert.alert('Lỗi', 'Không tìm thấy thông tin bệnh cho kết quả phát hiện');
                    }
                } catch {
                    Alert.alert('Lỗi', 'Không thể phân tích kết quả phát hiện từ AI');
                }
            } else {
                Alert.alert('Lỗi', 'Không có kết quả phát hiện từ AI');
            }

            // Kiểm tra cả capturedImage và image
            const imageParam = params.capturedImage || params.image;
            if (imageParam) {
                setCapturedImage(imageParam as string);

            } else {
                Alert.alert('Lỗi', 'Không có ảnh trong tham số');
            }
        };

        loadDiseaseInfo();

        // Cleanup: Reset ref khi unmount
        return () => {
            hasLoadedRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load plant plots khi chọn lô đất
    const handlePlotSelect = async (plotId: number) => {
        setSelectedPlotId(plotId);
        setSelectedPlantPlotId(undefined);
        setPlantPlots([]);

        if (!plotId) return;

        setLoadingPlantPlots(true);
        try {
            const response = await plantPlotService.getByPlotId(plotId);
            if (response && response.data) {
                setPlantPlots(response.data);

            }
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách cây trồng');
        } finally {
            setLoadingPlantPlots(false);
        }
    };

    const handleSubmit = async () => {
        // Validate
        if (!diseaseInfo) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin bệnh');
            return;
        }

        if (!selectedPlantPlotId) {
            Alert.alert('Lỗi', 'Vui lòng chọn cây trồng bị bệnh');
            return;
        }

        if (!employeeId) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin nhân viên');
            return;
        }

        try {
            setLoading(true);

            // Tạo disease log với upload ảnh
            const result = await diseaseLogService.createWithImage(
                {
                    disease_id: diseaseInfo._id,
                    plant_plot_id: selectedPlantPlotId,
                    employee_ids: employeeId,
                    dateReport: new Date().toISOString(),
                    notes: notes,
                },
                capturedImage // URI ảnh đã chụp
            );

            if (result.success) {
                Alert.alert('Thành công', result.message || 'Đã tạo báo cáo bệnh', [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]);
            } else {
                Alert.alert('Lỗi', result.error || 'Không thể tạo báo cáo');
            }
        } catch {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo báo cáo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.titleContainer, { backgroundColor: cardBg }]}>
                <Text style={[styles.title, { color: textColor }]}>Báo cáo bệnh cây</Text>
            </View>

            {capturedImage && (
                <View style={[styles.imageContainer, { backgroundColor: cardBg }]}>
                    <Text style={[styles.label, { color: labelColor }]}>Ảnh phát hiện:</Text>
                    <Image source={{ uri: capturedImage }} style={styles.image} resizeMode="contain" />
                </View>
            )}

            {diseaseInfo && (
                <View style={[styles.diseaseInfoContainer, { backgroundColor: cardBg, borderLeftColor: warningColor }]}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Thông tin bệnh:</Text>
                    <Text style={[styles.diseaseName, { color: warningColor }]}>{diseaseInfo.name}</Text>
                    {diseaseInfo.scientificName && (
                        <Text style={[styles.diseaseScientific, { color: mutedColor }]}>({diseaseInfo.scientificName})</Text>
                    )}
                    <Text style={[styles.diseaseCategory, { color: mutedColor, backgroundColor: warningColor + '20' }]}>{diseaseInfo.disease_category_name}</Text>
                    {diseaseInfo.symptoms && (
                        <View style={styles.infoSection}>
                            <Text style={[styles.infoLabel, { color: labelColor }]}>Triệu chứng:</Text>
                            <Text style={[styles.infoText, { color: mutedColor }]}>{diseaseInfo.symptoms}</Text>
                        </View>
                    )}
                </View>
            )}

            {detectionData && (
                <View style={[styles.detectionContainer, { backgroundColor: infoColor + '20' }]}>
                    <Text style={[styles.label, { color: labelColor }]}>Kết quả AI phát hiện:</Text>
                    {(detectionData.predictions || detectionData.detections || []).map((det, index) => (
                        <Text key={index} style={[styles.detectionText, { color: infoColor }]}>
                            • {det.class} - Độ tin cậy: {(det.confidence * 100).toFixed(1)}%
                        </Text>
                    ))}
                </View>
            )}

            <View style={[styles.form, { backgroundColor: cardBg }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Thông tin báo cáo</Text>

                <Text style={[styles.label, { color: labelColor }]}>Chọn lô đất *</Text>
                {plotsLoading ? (
                    <ActivityIndicator style={{ marginVertical: 10 }} color={warningColor} />
                ) : (
                    <View style={[styles.pickerContainer, { backgroundColor: inputBg, borderColor: borderColor }]}>
                        <Picker
                            selectedValue={selectedPlotId}
                            onValueChange={handlePlotSelect}
                            style={[styles.picker, { color: pickerColor }]}
                        >
                            <Picker.Item label="-- Chọn lô đất --" value={undefined} />
                            {plots.map((plot) => (
                                <Picker.Item
                                    key={plot.id}
                                    label={`${plot.name} (${plot.numberOfTrees} cây, ${plot.acreage}m²)`}
                                    value={plot.id}
                                />
                            ))}
                        </Picker>
                    </View>
                )}

                {selectedPlotId && (
                    <>
                        <Text style={[styles.label, { color: labelColor }]}>Chọn cây trồng bị bệnh *</Text>
                        {loadingPlantPlots ? (
                            <ActivityIndicator style={{ marginVertical: 10 }} color={warningColor} />
                        ) : plantPlots.length > 0 ? (
                            <View style={[styles.pickerContainer, { backgroundColor: inputBg, borderColor: borderColor }]}>
                                <Picker
                                    selectedValue={selectedPlantPlotId}
                                    onValueChange={setSelectedPlantPlotId}
                                    style={[styles.picker, { color: pickerColor }]}
                                >
                                    <Picker.Item label="-- Chọn cây trồng --" value={undefined} />
                                    {plantPlots.map((plantPlot) => (
                                        <Picker.Item
                                            key={plantPlot.id}
                                            label={`Cây #${plantPlot.id} - ${plantPlot.position ? `Hàng ${plantPlot.position.row}, Cột ${plantPlot.position.column}` : 'Vị trí không xác định'}`}
                                            value={plantPlot.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        ) : (
                            <Text style={[styles.warningText, { color: warningColor }]}>Không có cây trồng nào trong lô này</Text>
                        )}
                    </>
                )}

                <Text style={[styles.label, { color: labelColor }]}>Ngày phát hiện</Text>
                <ThemedTextInput
                    style={[styles.input, { backgroundColor: dividerColor, borderColor: borderColor }]}
                    value={new Date().toLocaleDateString('vi-VN')}
                    editable={false}
                />

                <Text style={[styles.label, { color: labelColor }]}>Ghi chú</Text>
                <ThemedTextInput
                    style={[styles.input, styles.textArea, { backgroundColor: inputBg, borderColor: borderColor }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Nhập ghi chú về tình trạng bệnh, vị trí phát hiện..."
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: loading ? mutedColor : warningColor }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Tạo báo cáo</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.cancelButton, { backgroundColor: cardBg, borderColor: borderColor }]} onPress={() => router.back()}>
                    <Text style={[styles.cancelButtonText, { color: mutedColor }]}>Hủy</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    imageContainer: {
        padding: 15,
        marginTop: 10,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 10,
    },
    detectionContainer: {
        padding: 15,
        marginTop: 10,
    },
    detectionText: {
        fontSize: 14,
        marginVertical: 2,
    },
    form: {
        padding: 20,
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
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
    submitButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    diseaseInfoContainer: {
        padding: 15,
        marginTop: 10,
        borderLeftWidth: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    diseaseName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    diseaseScientific: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 2,
    },
    diseaseCategory: {
        fontSize: 14,
        marginTop: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
        borderRadius: 4,
    },
    infoSection: {
        marginTop: 10,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
    },
    picker: {
        height: 50,
    },
    warningText: {
        fontSize: 14,
        fontStyle: 'italic',
        marginVertical: 10,
    },
});
