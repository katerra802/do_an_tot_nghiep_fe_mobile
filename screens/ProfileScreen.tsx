import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authService } from '../services/auth.service';

export default function ProfileScreen() {
    const { user, employeeId, logout } = useAuth();
    const router = useRouter();

    // Change password modal state
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changing, setChanging] = useState(false);

    // Theme colors
    const bgColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({}, 'cardBackground');
    const textColor = useThemeColor({}, 'text');
    const labelColor = useThemeColor({}, 'label');
    const mutedColor = useThemeColor({}, 'muted');
    const dividerColor = useThemeColor({}, 'divider');
    const dangerColor = useThemeColor({}, 'danger');

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới và mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (!user?.id) {
            Alert.alert('Lỗi', 'Không thể xác định người dùng');
            return;
        }

        setChanging(true);
        try {
            const result = await authService.changePassword(
                user.id,
                oldPassword,
                newPassword,
                confirmPassword
            );

            if (result.success) {
                Alert.alert(
                    'Thành công',
                    result.message || 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
                    [
                        {
                            text: 'OK',
                            onPress: async () => {
                                setShowChangePassword(false);
                                setOldPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                                await logout();
                                router.replace('../../login' as any);
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Lỗi', result.error || 'Không thể đổi mật khẩu');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error?.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        } finally {
            setChanging(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('../../login' as any);
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: cardBg }]}>
                    <Text style={[styles.title, { color: textColor }]}>Thông tin cá nhân</Text>

                    <View style={[styles.infoRow, { borderBottomColor: dividerColor }]}>
                        <Text style={[styles.label, { color: labelColor }]}>Tên:</Text>
                        <Text style={[styles.value, { color: textColor }]}>{user?.name || 'N/A'}</Text>
                    </View>

                    <View style={[styles.infoRow, { borderBottomColor: dividerColor }]}>
                        <Text style={[styles.label, { color: labelColor }]}>Email:</Text>
                        <Text style={[styles.value, { color: textColor }]}>{user?.email || 'N/A'}</Text>
                    </View>

                    <View style={[styles.infoRow, { borderBottomColor: dividerColor }]}>
                        <Text style={[styles.label, { color: labelColor }]}>Vai trò:</Text>
                        <Text style={[styles.value, { color: textColor }]}>{user?.role || 'N/A'}</Text>
                    </View>

                    <View style={[styles.infoRow, { borderBottomColor: dividerColor }]}>
                        <Text style={[styles.label, { color: labelColor }]}>ID Nhân viên:</Text>
                        <Text style={[styles.value, { color: textColor }]}>{employeeId || 'N/A'}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.changePasswordButton, { backgroundColor: cardBg, borderColor: dividerColor }]}
                    onPress={() => setShowChangePassword(true)}
                >
                    <Text style={[styles.changePasswordButtonText, { color: textColor }]}>Đổi mật khẩu</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: dangerColor }]} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>

            {/* Change Password Modal */}
            <Modal
                visible={showChangePassword}
                transparent
                animationType="fade"
                onRequestClose={() => setShowChangePassword(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>Đổi mật khẩu</Text>
                            <TouchableOpacity onPress={() => setShowChangePassword(false)}>
                                <Text style={[styles.modalCloseText, { color: mutedColor }]}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: labelColor }]}>Mật khẩu cũ</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: bgColor, color: textColor, borderColor: dividerColor }]}
                                placeholder="Nhập mật khẩu cũ"
                                placeholderTextColor={mutedColor}
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                editable={!changing}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: labelColor }]}>Mật khẩu mới</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: bgColor, color: textColor, borderColor: dividerColor }]}
                                placeholder="Nhập mật khẩu mới"
                                placeholderTextColor={mutedColor}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                editable={!changing}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: labelColor }]}>Xác nhận mật khẩu mới</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: bgColor, color: textColor, borderColor: dividerColor }]}
                                placeholder="Nhập lại mật khẩu mới"
                                placeholderTextColor={mutedColor}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                editable={!changing}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton, { borderColor: dividerColor }]}
                                onPress={() => {
                                    setShowChangePassword(false);
                                    setOldPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                                disabled={changing}
                            >
                                <Text style={[styles.modalButtonText, { color: mutedColor }]}>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalSubmitButton, { backgroundColor: dangerColor }]}
                                onPress={handleChangePassword}
                                disabled={changing}
                            >
                                {changing ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={[styles.modalButtonText, { color: '#fff' }]}>Đổi mật khẩu</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
    },
    changePasswordButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
    },
    changePasswordButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
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
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
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
});
