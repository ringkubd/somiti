import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import client from '../../api/client';

export default function SomitiDetailScreen({ route, navigation }: any) {
    const [somiti, setSomiti] = useState<any>(null);

    useEffect(() => {
        client.get(`/somitis/${route.params?.id || ''}`).then(({ data }) => setSomiti(data)).catch(() => {});
    }, []);

    const qrUrl = somiti?.unique_code
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(somiti.unique_code)}`
        : null;

    if (!somiti) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <View style={styles.header}><Text style={styles.title}>{somiti.name}</Text><Text style={styles.code}>{somiti.unique_code}</Text></View>

            {/* QR Code */}
            {qrUrl && (
                <View style={styles.qrSection}>
                    <Text style={styles.qrLabel}>Share this code with members to join:</Text>
                    <Image source={{ uri: qrUrl }} style={styles.qr} />
                    <Text style={styles.qrCode}>{somiti.unique_code}</Text>
                    <Text style={styles.qrHint}>Members enter this code to join your somiti</Text>
                </View>
            )}

            <View style={styles.card}>
                <DetailRow label="Status" value={somiti.status} />
                <DetailRow label="Currency" value={`${somiti.currency_symbol || '$'} ${somiti.currency || 'USD'}`} />
                <DetailRow label="Members" value={`${somiti.members?.length || 0}`} />
                <DetailRow label="Created" value={new Date(somiti.created_at).toLocaleDateString()} />
            </View>
            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('SomitiSettings', { id: somiti.id })}>
                <Text style={styles.btnText}>Settings</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function DetailRow({ label, value }: any) {
    return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || '-'}</Text></View>;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    back: { fontSize: 16, color: '#2563eb', padding: 20, paddingBottom: 0 }, header: { padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' }, code: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
    card: { backgroundColor: '#fff', margin: 20, borderRadius: 12, padding: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    label: { fontSize: 14, color: '#64748b' }, value: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    btn: { backgroundColor: '#2563eb', marginHorizontal: 20, borderRadius: 12, padding: 16, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    qrSection: { alignItems: 'center', padding: 20, backgroundColor: '#fff', margin: 20, borderRadius: 12 },
    qrLabel: { fontSize: 14, color: '#64748b', marginBottom: 12 },
    qr: { width: 160, height: 160, borderRadius: 8 },
    qrCode: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', letterSpacing: 2, marginTop: 12 },
    qrHint: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
});
