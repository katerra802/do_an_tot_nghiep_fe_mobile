import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    // Redirect to login if not authenticated, otherwise to tabs
    return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
