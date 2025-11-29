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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { usePlots } from '../contexts/PlotContext';
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
                    console.log('[DiseaseLogForm] Detection data:', data);

                    // Lấy thông tin bệnh từ database
                    const info = await diseaseLogService.getDiseaseInfoFromDetection(data);
                    if (info) {
                        setDiseaseInfo(info);
                        console.log('[DiseaseLogForm] Disease info loaded:', info.name);
                    } else {
                        console.warn('[DiseaseLogForm] No disease info found for detection');
                    }
                } catch (error) {
                    console.error('[DiseaseLogForm] Parse detection data error:', error);
                }
            } else {
                console.warn('[DiseaseLogForm] No detection data in params');
            }

            // Kiểm tra cả capturedImage và image
            const imageParam = params.capturedImage || params.image;
            if (imageParam) {
                setCapturedImage(imageParam as string);
                console.log('[DiseaseLogForm] Image URI:', imageParam);
            } else {
                console.warn('[DiseaseLogForm] No image in params');
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
                console.log(`[DiseaseLogForm] Loaded ${response.results} plant plots`);
            }
        } catch (error) {
            console.error('[DiseaseLogForm] Error loading plant plots:', error);
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
        } catch (error) {
            console.error('[DiseaseLogForm] Submit error:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo báo cáo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Báo cáo bệnh cây</Text>

            {capturedImage && (
                <View style={styles.imageContainer}>
                    <Text style={styles.label}>Ảnh phát hiện:</Text>
                    <Image source={{ uri: capturedImage }} style={styles.image} resizeMode="contain" />
                </View>
            )}

            {diseaseInfo && (
                <View style={styles.diseaseInfoContainer}>
                    <Text style={styles.sectionTitle}>Thông tin bệnh:</Text>
                    <Text style={styles.diseaseName}>{diseaseInfo.name}</Text>
                    {diseaseInfo.scientificName && (
                        <Text style={styles.diseaseScientific}>({diseaseInfo.scientificName})</Text>
                    )}
                    <Text style={styles.diseaseCategory}>{diseaseInfo.disease_category_name}</Text>
                    {diseaseInfo.symptoms && (
                        <View style={styles.infoSection}>
                            <Text style={styles.infoLabel}>Triệu chứng:</Text>
                            <Text style={styles.infoText}>{diseaseInfo.symptoms}</Text>
                        </View>
                    )}
                </View>
            )}

            {detectionData && (
                <View style={styles.detectionContainer}>
                    <Text style={styles.label}>Kết quả AI phát hiện:</Text>
                    {(detectionData.predictions || detectionData.detections || []).map((det, index) => (
                        <Text key={index} style={styles.detectionText}>
                            • {det.class} - Độ tin cậy: {(det.confidence * 100).toFixed(1)}%
                        </Text>
                    ))}
                </View>
            )}

            <View style={styles.form}>
                <Text style={styles.sectionTitle}>Thông tin báo cáo</Text>

                <Text style={styles.label}>Chọn lô đất *</Text>
                {plotsLoading ? (
                    <ActivityIndicator style={{ marginVertical: 10 }} />
                ) : (
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedPlotId}
                            onValueChange={handlePlotSelect}
                            style={styles.picker}
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
                        <Text style={styles.label}>Chọn cây trồng bị bệnh *</Text>
                        {loadingPlantPlots ? (
                            <ActivityIndicator style={{ marginVertical: 10 }} />
                        ) : plantPlots.length > 0 ? (
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedPlantPlotId}
                                    onValueChange={setSelectedPlantPlotId}
                                    style={styles.picker}
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
                            <Text style={styles.warningText}>Không có cây trồng nào trong lô này</Text>
                        )}
                    </>
                )}

                <Text style={styles.label}>Ngày phát hiện</Text>
                <TextInput
                    style={styles.input}
                    value={new Date().toLocaleDateString('vi-VN')}
                    editable={false}
                />

                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Nhập ghi chú về tình trạng bệnh, vị trí phát hiện..."
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Tạo báo cáo</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 20,
        backgroundColor: '#fff',
    },
    imageContainer: {
        backgroundColor: '#fff',
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
        backgroundColor: '#e3f2fd',
        padding: 15,
        marginTop: 10,
    },
    detectionText: {
        fontSize: 14,
        color: '#1976d2',
        marginVertical: 2,
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
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
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    diseaseInfoContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginTop: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    diseaseName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    diseaseScientific: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#666',
        marginTop: 2,
    },
    diseaseCategory: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#e8f5e9',
        alignSelf: 'flex-start',
        borderRadius: 4,
    },
    infoSection: {
        marginTop: 10,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    picker: {
        height: 50,
    },
    warningText: {
        fontSize: 14,
        color: '#ff9800',
        fontStyle: 'italic',
        marginVertical: 10,
    },
});
