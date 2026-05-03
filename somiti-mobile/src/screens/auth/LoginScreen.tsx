import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation }: any) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const storeLogin = useAuthStore((s) => s.login);

    const handleLogin = async () => {
        if (!login || !password) { Alert.alert('Error', 'Fill all fields'); return; }
        setLoading(true);
        try {
            const { data } = await client.post('/auth/login', { login, password });
            await SecureStore.setItemAsync('auth_token', data.token);
            useAuthStore.setState({ token: data.token, user: data.user });
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Somiti</Text>
            <Text style={styles.subtitle}>Cooperative Management</Text>

            <TextInput style={styles.input} placeholder="Email or Phone" value={login}
                onChangeText={setLogin} autoCapitalize="none" autoCorrect={false} />
            <TextInput style={styles.input} placeholder="Password" value={password}
                onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' },
    title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#1e293b' },
    subtitle: { fontSize: 16, textAlign: 'center', color: '#64748b', marginBottom: 40 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
        padding: 16, fontSize: 16, marginBottom: 16 },
    button: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    link: { textAlign: 'center', color: '#2563eb', marginTop: 20, fontSize: 14 },
});
