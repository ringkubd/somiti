import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import client from '../../api/client';
import { StatusBadge, StatCard } from '../../components/Shared';

export default function UserShareDetailScreen({ route, navigation }: any) {
    const [item, setItem] = useState<any>(null);

    useEffect(() => {
        client.get(`/shares/${route.params.id}`).then(({ data }) => setItem(data)).catch(() => {});
    }, []);

    if (!item) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.header}>
                <Text style={styles.title}>Shares #{item.id}</Text>
                <StatusBadge status={item.status} />
            </View>
            <StatCard label="Share Count" value={item.share_count} color="#10b981" currency="" />
            <View style={styles.card}>
                <DetailRow label="Somiti" value={item.somiti?.name} />
                <DetailRow label="Financial Year" value={item.financial_year?.title || item.financial_year?.name} />
                <DetailRow label="Allocated" value={new Date(item.created_at).toLocaleDateString()} />
            </View>
        </ScrollView>
    );
}

function DetailRow({ label, value }: any) {
    return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || '-'}</Text></View>;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backBtn: { padding: 20, paddingBottom: 0 },
    back: { fontSize: 16, color: '#2563eb' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    card: { backgroundColor: '#fff', margin: 20, borderRadius: 12, padding: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    label: { fontSize: 14, color: '#64748b' },
    value: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1, textAlign: 'right' },
});
