import ThemedTextInput from '@/components/themed-text-input';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    // theme-aware colors
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
    footer: {
        alignItems: 'center',
        marginTop: 30,
    },
    footerText: {
        fontSize: 12,
    },
});
