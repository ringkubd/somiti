import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import client from '../../api/client';
import { StatusBadge, StatCard } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function ShareTransferDetailScreen({ route, navigation }: any) {
    const [item, setItem] = useState<any>(null);

    useEffect(() => {
        client.get(`/share-transfers/${route.params.id}`).then(({ data }) => setItem(data)).catch(() => {});
    }, []);

    if (!item) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    const total = Number(item.quantity || 0) * Number(item.price_per_share || 0);

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.header}>
                <Text style={styles.title}>Transfer #{item.id}</Text>
                <StatusBadge status={item.status} />
            </View>
            <StatCard label="Total Value" value={total} color="#8b5cf6" currency={getCurrencySymbol()} />
            <View style={styles.card}>
                <DetailRow label="From" value={item.from_user?.name || 'Treasury'} />
                <DetailRow label="To" value={item.to_user?.name} />
                <DetailRow label="Quantity" value={`${item.quantity} shares`} />
                <DetailRow label="Price / Share" value={`${getCurrencySymbol()}${Number(item.price_per_share).toLocaleString()}`} />
                <DetailRow label="Transfer Date" value={item.transfer_date} />
                <DetailRow label="Somiti" value={item.somiti?.name} />
                {item.notes && <DetailRow label="Notes" value={item.notes} />}
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
