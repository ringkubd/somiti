import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import * as SecureStore from 'expo-secure-store';

export default function CreateSomitiScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!name.trim()) { Alert.alert('Error', 'Somiti name required'); return; }
        setSubmitting(true);
        try {
            const { data } = await client.post('/somitis', { name: name.trim() });
            // Refresh user token/state
            const { data: me } = await client.get('/auth/me');
            useAuthStore.setState({ user: me });
            Alert.alert('Success', `"${data.name}" created!`, [
                { text: 'Go to Dashboard', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed');
        } finally { setSubmitting(false); }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.emoji}>🏗️</Text>
            <Text style={styles.title}>Create Somiti</Text>
            <Text style={styles.subtitle}>Start your own cooperative society</Text>
            <TextInput style={styles.input} placeholder="Somiti Name" value={name} onChangeText={setName} />
            <Text style={styles.hint}>You'll be the owner. You can invite members after creation.</Text>
            <TouchableOpacity style={styles.btn} onPress={submit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Somiti</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('JoinSomiti')}>
                <Text style={styles.link}>Join an existing somiti instead</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 24, justifyContent: 'center', flexGrow: 1 },
    emoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 32 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
    hint: { fontSize: 13, color: '#94a3b8', marginBottom: 16, textAlign: 'center' },
    btn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    link: { textAlign: 'center', color: '#2563eb', marginTop: 20, fontSize: 15 },
});
