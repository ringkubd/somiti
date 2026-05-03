import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';

export default function ChangePasswordScreen({ navigation }: any) {
    const [current, setCurrent] = useState(''); const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState(''); const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (password !== confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
        setLoading(true);
        try {
            await client.put('/auth/password', { current_password: current, password, password_confirmation: confirm });
            Alert.alert('Success', 'Password changed'); navigation.goBack();
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Change Password</Text>
            <TextInput style={styles.input} placeholder="Current Password" value={current} onChangeText={setCurrent} secureTextEntry />
            <TextInput style={styles.input} placeholder="New Password" value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry />
            <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, content: { padding: 20, paddingTop: 60 },
    back: { fontSize: 16, color: '#2563eb', marginBottom: 16 }, title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 24 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
    btn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
