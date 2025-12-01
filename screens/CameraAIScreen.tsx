import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { aiService } from '../services/ai.service';
import { AIDetectionResponse } from '../types';

export default function CameraAIScreen() {
    const router = useRouter();
    const [isDetecting, setIsDetecting] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [detectionResult, setDetectionResult] = useState<AIDetectionResponse | null>(null);
    const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
    const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
    const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

    const device = useCameraDevice(cameraPosition);
    const { hasPermission, requestPermission } = useCameraPermission();
    const camera = useRef<Camera>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const isStreamingRef = useRef<boolean>(false);
    const frameCountRef = useRef<number>(0);
    const lastFrameTimeRef = useRef<number>(0);
    const recordingDotOpacity = useRef(new Animated.Value(1)).current;

    // Animation cho recording dot
    useEffect(() => {
        if (isStreaming) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(recordingDotOpacity, {
                        toValue: 0.3,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(recordingDotOpacity, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            recordingDotOpacity.setValue(1);
        }
    }, [isStreaming, recordingDotOpacity]);

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                aiService.closeStream(wsRef.current);
            }
        };
    }, []);

    // Dừng real-time khi navigate đi khỏi screen
    useFocusEffect(
        useCallback(() => {
            // Khi vào screen, không làm gì
            return () => {
                // Khi rời khỏi screen (navigate sang form), dừng real-time
                if (isStreamingRef.current) {
                    stopRealTimeDetection();
                }
            };
        }, [])
    );

    const toggleCamera = useCallback(() => {
        setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
    }, []);

    // Navigate to disease report form
    const navigateToDiseaseReport = useCallback((result: AIDetectionResponse) => {
        // Dừng real-time detection trước khi navigate
        if (isStreamingRef.current) {
            stopRealTimeDetection();
        }

        // Serialize detection result để truyền qua params
        const detectionData = JSON.stringify(result);

        router.push({
            pathname: '/disease-log-form',
            params: {
                detectionResult: detectionData,
                capturedImage: capturedImageUri || '',
            },
        });
    }, [router, capturedImageUri]);

    // Hàm chụp ảnh và phát hiện (mode thông thường)
    const handleCapture = async () => {
        if (!camera.current) return;

        try {
            setIsDetecting(true);
            setDetectionResult(null);
            setAnnotatedImage(null);

            const photo = await camera.current.takePhoto();
            const photoUri = `file://${photo.path}`;
            setCapturedImageUri(photoUri);

            const result = await aiService.detectDisease(photoUri);

            setDetectionResult(result);

            if (result.processed_media_base64) {
                setAnnotatedImage(`data:${result.media_type};base64,${result.processed_media_base64}`);
            }

            const detections = result.predictions || result.detections || [];
            if (detections.length > 0) {
                const highestConf = Math.max(...detections.map(d => d.confidence));
                Alert.alert(
                    'Phát hiện bệnh',
                    `Tìm thấy ${detections.length} bệnh (độ tin cậy: ${(highestConf * 100).toFixed(1)}%). Bạn có muốn tạo báo cáo?`,
                    [
                        { text: 'Hủy', style: 'cancel' },
                        {
                            text: 'Tạo báo cáo',
                            onPress: () => navigateToDiseaseReport(result),
                        },
                    ]
                );
            } else {
                Alert.alert('Kết quả', 'Không phát hiện bệnh nào');
            }
        } catch {
            Alert.alert('Lỗi', 'Không thể chụp ảnh hoặc phát hiện bệnh');
        } finally {
            setIsDetecting(false);
        }
    };

    // Callback để xử lý detection từ frame processor (chạy trên JS thread)
    const handleDetectionData = useCallback((data: AIDetectionResponse) => {
        if (data.status === 'captured') {
            setDetectionResult(data);
            if (data.processed_media_base64) {
                setAnnotatedImage(`data:${data.media_type};base64,${data.processed_media_base64}`);
            }

            stopRealTimeDetection();

            const detections = data.detections || [];
            if (detections.length > 0) {
                Alert.alert(
                    'Phát hiện bệnh',
                    `Tìm thấy ${detections.length} bệnh. Bạn có muốn tạo báo cáo?`,
                    [
                        { text: 'Hủy', style: 'cancel' },
                        {
                            text: 'Tạo báo cáo',
                            onPress: () => navigateToDiseaseReport(data),
                        },
                    ]
                );
            }
        } else if (data.detections !== undefined) {
            setDetectionResult(data);

            // Nếu có detection (bất kể confidence), cho phép tạo báo cáo
            if (data.detections.length > 0) {
                const highestConf = Math.max(...data.detections.map(d => d.confidence));

                // Cho phép tạo báo cáo miễn có phát hiện bệnh
                Alert.alert(
                    'Phát hiện bệnh',
                    `Tìm thấy ${data.detections.length} bệnh (độ tin cậy: ${(highestConf * 100).toFixed(1)}%). Bạn có muốn tạo báo cáo?`,
                    [
                        { text: 'Tiếp tục quét', style: 'cancel' },
                        {
                            text: 'Tạo báo cáo',
                            onPress: () => {
                                stopRealTimeDetection();
                                navigateToDiseaseReport(data);
                            },
                        },
                    ]
                );
            }
        }
    }, [navigateToDiseaseReport]);

    // Hàm chụp snapshot và gửi qua WebSocket
    const captureAndSendFrame = useCallback(async () => {
        if (!camera.current || !isStreamingRef.current || !wsRef.current) return;
        if (wsRef.current.readyState !== WebSocket.OPEN) return;

        try {
            const snapshot = await camera.current.takeSnapshot({
                quality: 70,
            });

            // Đọc file và chuyển thành base64
            const response = await fetch(`file://${snapshot.path}`);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64dataUrl = reader.result as string; // "data:image/jpeg;base64,..."
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    // Gửi trực tiếp data URL string (không phải JSON)
                    wsRef.current.send(base64dataUrl);
                    frameCountRef.current++;
                }
            };

            reader.readAsDataURL(blob);
        } catch {
            Alert.alert('Lỗi', 'Không thể chụp và gửi khung hình');
        }
    }, []);

    const startRealTimeDetection = async () => {
        if (isStreaming) {
            Alert.alert('Thông báo', 'Real-time detection đang chạy');
            return;
        }

        const isHealthy = await aiService.checkHealth();
        if (!isHealthy) {
            Alert.alert('Lỗi', 'AI service không khả dụng');
            return;
        }

        try {
            const ws = aiService.createStreamConnection(
                handleDetectionData,
                (error) => {
                    Alert.alert('Lỗi', 'Mất kết nối với AI service');
                    stopRealTimeDetection();
                },
                () => {
                    setIsStreaming(false);
                    isStreamingRef.current = false;
                    wsRef.current = null;
                }
            );

            wsRef.current = ws;

            // Đợi WebSocket mở
            const isOpen = await new Promise<boolean>((resolve) => {
                if (ws.readyState === WebSocket.OPEN) {
                    resolve(true);
                    return;
                }

                const timeout = setTimeout(() => {
                    resolve(false);
                }, 5000);

                ws.addEventListener('open', () => {
                    clearTimeout(timeout);
                    resolve(true);
                }, { once: true });

                ws.addEventListener('error', () => {
                    clearTimeout(timeout);
                    resolve(false);
                }, { once: true });
            });

            if (!isOpen || ws.readyState !== WebSocket.OPEN) {
                Alert.alert('Lỗi', 'Không thể kết nối WebSocket');
                if (wsRef.current) {
                    wsRef.current.close();
                    wsRef.current = null;
                }
                return;
            }

            setIsStreaming(true);
            isStreamingRef.current = true;
            frameCountRef.current = 0;
            lastFrameTimeRef.current = 0;

            // Bắt đầu capture frames mỗi 1.5 giây
            const captureInterval = setInterval(() => {
                if (isStreamingRef.current) {
                    captureAndSendFrame();
                } else {
                    clearInterval(captureInterval);
                }
            }, 1500);
        } catch {
            Alert.alert('Lỗi', 'Không thể kết nối AI service');
            setIsStreaming(false);
            isStreamingRef.current = false;
        }
    };

    const stopRealTimeDetection = () => {
        isStreamingRef.current = false;
        setIsStreaming(false);

        if (wsRef.current) {
            try {
                aiService.closeStream(wsRef.current);
                wsRef.current = null;
            } catch {
                wsRef.current = null;
            }
        }

        setDetectionResult(null);
    };

    // Permission check
    if (!hasPermission) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Cần quyền truy cập camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Cấp quyền</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Không tìm thấy camera</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                ref={camera}
                style={styles.camera}
                device={device}
                isActive={true}
                photo={true}
            >
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.flipButton} onPress={toggleCamera}>
                        <Text style={styles.buttonText}>Lật camera</Text>
                    </TouchableOpacity>
                </View>

                {/* Real-time Detection Overlay */}
                {isStreaming && (
                    <View style={styles.realtimeOverlay}>
                        <View style={styles.realtimeIndicator}>
                            <Animated.View style={[styles.recordingDot, { opacity: recordingDotOpacity }]} />
                            <Text style={styles.realtimeText}>Đang quét bệnh...</Text>
                        </View>

                        {detectionResult && detectionResult.detections && detectionResult.detections.length > 0 && (
                            <View style={styles.detectionOverlay}>
                                <Text style={styles.detectionOverlayTitle}>🔍 Phát hiện bệnh:</Text>
                                {detectionResult.detections.map((det, index) => (
                                    <View key={index} style={styles.detectionBadge}>
                                        <Text style={styles.detectionBadgeText}>
                                            {det.class}: {(det.confidence * 100).toFixed(0)}%
                                        </Text>
                                    </View>
                                ))}

                                <TouchableOpacity
                                    style={styles.reportButton}
                                    onPress={() => {
                                        stopRealTimeDetection();
                                        navigateToDiseaseReport(detectionResult);
                                    }}
                                >
                                    <Text style={styles.reportButtonText}>📝 Tạo báo cáo bệnh</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </Camera>

            <View style={styles.controlPanel}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.captureButton, isDetecting && styles.buttonDisabled]}
                        onPress={handleCapture}
                        disabled={isDetecting}
                    >
                        {isDetecting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Chụp & Phát hiện</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={isStreaming ? styles.stopButton : styles.streamButton}
                        onPress={isStreaming ? stopRealTimeDetection : startRealTimeDetection}
                        disabled={isDetecting}
                    >
                        <Text style={styles.buttonText}>
                            {isStreaming ? 'Dừng Real-time' : 'Bật Real-time'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {annotatedImage && !isStreaming && (
                    <ScrollView style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>Kết quả phát hiện:</Text>
                        <Image source={{ uri: annotatedImage }} style={styles.resultImage} resizeMode="contain" />

                        {detectionResult && (
                            <View style={styles.detectionInfo}>
                                {(detectionResult.predictions || detectionResult.detections || []).map((det, index) => (
                                    <View key={index} style={styles.detectionItem}>
                                        <Text style={styles.detectionText}>
                                            Bệnh: {det.class} - Độ tin cậy: {(det.confidence * 100).toFixed(1)}%
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: '#fff',
        fontSize: 16,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 20,
    },
    flipButton: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 15,
        borderRadius: 8,
    },
    controlPanel: {
        backgroundColor: '#fff',
        padding: 15,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        margin: 10,
    },
    captureButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    streamButton: {
        backgroundColor: '#FF9800',
        padding: 15,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    stopButton: {
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    resultContainer: {
        maxHeight: 300,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    resultImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
    detectionInfo: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
    },
    detectionItem: {
        paddingVertical: 5,
    },
    detectionText: {
        fontSize: 14,
        color: '#333',
    },
    realtimeOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        padding: 20,
    },
    realtimeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    recordingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
        marginRight: 8,
    },
    realtimeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    detectionOverlay: {
        alignSelf: 'stretch',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 12,
        padding: 12,
    },
    detectionOverlayTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    detectionBadge: {
        backgroundColor: 'rgba(255, 152, 0, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginVertical: 4,
    },
    detectionBadgeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    reportButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'center',
    },
    reportButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
