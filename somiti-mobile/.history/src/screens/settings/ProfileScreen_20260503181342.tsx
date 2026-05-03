import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useLocalAuth } from '../../hooks/useLocalAuth';

export default function ProfileScreen({ navigation }: any) {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);
    const [bioEnabled, setBioEnabled] = useState(false);

    const { hasPin, biometricType, enableBiometric, disableBiometric } = useLocalAuth();

    useEffect(() => {
        (async () => {
            const { default: SecureStore } = await import('expo-secure-store');
            const v = await SecureStore.getItemAsync('biometric_enabled');
            setBioEnabled(v === 'true');
        })();
    }, []);

    const toggleBio = async (val: boolean) => {
        if (val) {
            const ok = await enableBiometric();
            if (ok) { setBioEnabled(true); Alert.alert('Success', 'Biometric enabled'); }
            else Alert.alert('Error', 'Biometric not available or not enrolled');
        } else {
            await disableBiometric();
            setBioEnabled(false);
        }
    };

    const update = async () => {
        setLoading(true);
        try {
            await client.put('/auth/profile', { name, email, phone });
            Alert.alert('Success', 'Profile updated');
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text></View>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TouchableOpacity style={styles.btn} onPress={update} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Security</Text>

            {biometricType && (
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>{biometricType === 'fingerprint' ? 'Fingerprint' : 'Face ID'} Lock</Text>
                    <Switch value={bioEnabled} onValueChange={toggleBio} trackColor={{ true: '#2563eb' }} />
                </View>
            )}

            {hasPin && (
                <TouchableOpacity style={styles.linkBtn} onPress={() => Alert.alert('Change PIN', 'Feature coming')}>
                    <Text style={styles.linkText}>Change PIN</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('ChangePassword')}>
                <Text style={styles.linkText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.linkBtn, { marginTop: 8 }]} onPress={() => logout()}>
                <Text style={[styles.linkText, { color: '#ef4444' }]}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, content: { padding: 20, alignItems: 'center' },
    back: { fontSize: 16, color: '#2563eb', alignSelf: 'flex-start', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', alignSelf: 'flex-start', marginBottom: 24 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    input: { width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
    btn: { width: '100%', backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    linkBtn: { width: '100%', padding: 12, alignItems: 'center' },
    linkText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', alignSelf: 'flex-start', width: '100%', marginTop: 24, marginBottom: 12 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    switchLabel: { fontSize: 16, color: '#1e293b' },
});
