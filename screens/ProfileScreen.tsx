import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { user, employeeId, logout } = useAuth();
    const router = useRouter();

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
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.title}>Thông tin cá nhân</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Tên:</Text>
                        <Text style={styles.value}>{user?.name || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{user?.email || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Vai trò:</Text>
                        <Text style={styles.value}>{user?.role || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>ID Nhân viên:</Text>
                        <Text style={styles.value}>{employeeId || 'N/A'}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#fff',
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
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    logoutButton: {
        backgroundColor: '#f44336',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
