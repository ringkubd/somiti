import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const register = useAuthStore((s) => s.register);

    const handleRegister = async () => {
        if (!name || (!email && !phone) || !password) {
            Alert.alert('Error', 'Please provide at least an email or phone number, along with your name and password');
            return;
        }
        setLoading(true);
        try {
            await register(name, email, phone, password);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Join Somiti</Text>
            <Text style={styles.subtitle}>Create your account</Text>

            <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone}
                keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Password (min 8 chars)" value={password}
                onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { justifyContent: 'center', padding: 24, flexGrow: 1 },
    title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#1e293b' },
    subtitle: { fontSize: 16, textAlign: 'center', color: '#64748b', marginBottom: 40 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
        padding: 16, fontSize: 16, marginBottom: 16 },
    button: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    link: { textAlign: 'center', color: '#2563eb', marginTop: 20, fontSize: 14 },
});
