import ThemedTextInput from '@/components/themed-text-input';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

export default function LoginScreen() {
    // Login states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot password modal state
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetUsername, setResetUsername] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [resetting, setResetting] = useState(false);

    const { login } = useAuth();
    const router = useRouter();    // theme-aware colors
    const bg = useThemeColor({ light: '#f3f6f9', dark: '#000' }, 'background');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#111' }, 'background');
    const inputBg = useThemeColor({ light: '#ffffff', dark: '#111' }, 'background');
    const textColor = useThemeColor({ light: '#0f1720', dark: '#fff' }, 'text');
    const labelColor = useThemeColor({ light: '#66707a', dark: '#bbb' }, 'text');
    const buttonBg = useThemeColor({ light: '#0a7ea4', dark: '#66BB6A' }, 'tint');
    const btnTextColor = useThemeColor({ light: '#ffffff', dark: '#000000' }, 'text');

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            const result = await login({ username, password });

            if (result.success) {
                // Navigate to main app
                router.replace('/(tabs)');
            } else {
                Alert.alert('Đăng nhập thất bại', result.error || 'Vui lòng kiểm tra lại thông tin');
            }
        } catch (error: any) {
            console.log('Login error details:', error);
            Alert.alert('Lỗi', error?.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetUsername || !resetEmail) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(resetEmail)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        setResetting(true);
        try {
            // Bước 1: Lấy user ID từ username (API 1)
            const userResult = await authService.getUserByUsername(resetUsername);

            if (!userResult.success || !userResult.data) {
                Alert.alert('Lỗi', userResult.error || 'Không tìm thấy người dùng với tên đăng nhập này');
                return;
            }

            const userId = userResult.data; // API trả về ID trực tiếp

            // Bước 2: Gửi yêu cầu reset password (API 2)
            const resetResult = await authService.resetPassword(userId, resetEmail);

            if (resetResult.success) {
                Alert.alert(
                    'Thành công',
                    resetResult.message || 'Đặt lại mật khẩu thành công. Vui lòng kiểm tra email của bạn.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Reset form và đóng modal
                                setResetUsername('');
                                setResetEmail('');
                                setShowForgotPassword(false);
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Lỗi', resetResult.error || 'Không thể đặt lại mật khẩu');
            }
        } catch (error: any) {
            console.log('Reset password error:', error);
            Alert.alert('Lỗi', error?.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
        } finally {
            setResetting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: bg }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    {/* Logo/Title */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: textColor }]}>Quản lý Vườn Chanh</Text>
                        <Text style={[styles.subtitle, { color: labelColor }]}>Đăng nhập để tiếp tục</Text>
                    </View>

                    {/* Login Form */}
                    <View style={[styles.form, { backgroundColor: cardBg }]}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: labelColor }]}>Tên đăng nhập</Text>
                            <ThemedTextInput
                                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: labelColor }]}>Mật khẩu</Text>
                            <ThemedTextInput
                                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!loading}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowForgotPassword(true)}
                            style={styles.forgotPasswordButton}
                        >
                            <Text style={[styles.forgotPasswordText, { color: buttonBg }]}>Quên mật khẩu?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled, { backgroundColor: buttonBg }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={btnTextColor} />
                            ) : (
                                <Text style={[styles.loginButtonText, { color: btnTextColor }]}>Đăng nhập</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: labelColor }]}>
                            Phiên bản 1.0.0
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Forgot Password Modal */}
            <Modal
                visible={showForgotPassword}
                transparent
                animationType="fade"
                onRequestClose={() => setShowForgotPassword(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>Quên mật khẩu</Text>
                            <TouchableOpacity onPress={() => setShowForgotPassword(false)}>
                                <Text style={[styles.modalCloseText, { color: labelColor }]}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: labelColor }]}>Tên đăng nhập</Text>
                            <ThemedTextInput
                                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                                placeholder="Nhập tên đăng nhập"
                                value={resetUsername}
                                onChangeText={setResetUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!resetting}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: labelColor }]}>Email</Text>
                            <ThemedTextInput
                                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                                placeholder="Nhập email đã đăng ký"
                                value={resetEmail}
                                onChangeText={setResetEmail}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                editable={!resetting}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton, { borderColor: labelColor }]}
                                onPress={() => setShowForgotPassword(false)}
                                disabled={resetting}
                            >
                                <Text style={[styles.modalButtonText, { color: labelColor }]}>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalSubmitButton, { backgroundColor: buttonBg }]}
                                onPress={handleResetPassword}
                                disabled={resetting}
                            >
                                {resetting ? (
                                    <ActivityIndicator color={btnTextColor} size="small" />
                                ) : (
                                    <Text style={[styles.modalButtonText, { color: btnTextColor }]}>Gửi yêu cầu</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {
        borderRadius: 12,
        padding: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    loginButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 16,
        marginTop: -8,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 12,
        padding: 24,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    modalCloseText: {
        fontSize: 24,
        fontWeight: '400',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCancelButton: {
        borderWidth: 1,
    },
    modalSubmitButton: {
        // backgroundColor set dynamically
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 30,
    },
    footerText: {
        fontSize: 12,
    },
});
