import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function JoinSomitiScreen({ navigation }: any) {
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!code.trim()) { Alert.alert('Error', 'Enter somiti code'); return; }
        setSubmitting(true);
        try {
            // Find somiti by unique code
            const { data: somitis } = await client.get('/somitis');
            const matched = somitis?.data?.find((s: any) => s.unique_code?.toUpperCase() === code.trim().toUpperCase());
            if (!matched) {
                Alert.alert('Not Found', 'No somiti found with this code. Check with your somiti admin.');
                setSubmitting(false);
                return;
            }
            // Add user as member
            await client.post(`/somitis/${matched.id}/users`, { user_id: useAuthStore.getState().user?.id, role: 'member' });
            const { data: me } = await client.get('/auth/me');
            useAuthStore.setState({ user: me });
            Alert.alert('Joined!', `You're now a member of "${matched.name}"`, [
                { text: 'Go to Dashboard', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to join');
        } finally { setSubmitting(false); }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.emoji}>🤝</Text>
            <Text style={styles.title}>Join Somiti</Text>
            <Text style={styles.subtitle}>Enter your somiti's unique code</Text>

            <TextInput style={styles.input} placeholder="e.g. SOM-A1B2C3" value={code}
                onChangeText={setCode} autoCapitalize="characters" />

            <Text style={styles.hint}>Ask your somiti admin for the code. It's on the somiti details page.</Text>

            <TouchableOpacity style={styles.btn} onPress={submit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Join Somiti</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CreateSomiti')}>
                <Text style={styles.link}>Create a new somiti instead</Text>
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
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 18, textAlign: 'center', letterSpacing: 2, marginBottom: 16 },
    hint: { fontSize: 13, color: '#94a3b8', marginBottom: 24, textAlign: 'center' },
    btn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    link: { textAlign: 'center', color: '#2563eb', marginTop: 20, fontSize: 15 },
});
