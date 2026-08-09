import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import client from '../../api/client';
import { StatCard } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function BankAccountDetailScreen({ route, navigation }: any) {
    const [item, setItem] = useState<any>(null);

    useEffect(() => {
        client.get(`/bank-accounts/${route.params.id}`).then(({ data }) => setItem(data)).catch(() => {});
    }, []);

    if (!item) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.header}>
                <Text style={styles.title}>{item.account_name || item.bank_name}</Text>
                <Text style={[styles.active, { color: item.is_active ? '#10b981' : '#ef4444' }]}>
                    {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Text>
            </View>
            <StatCard label="Current Balance" value={item.current_balance} color="#3b82f6" currency={getCurrencySymbol()} />
            <View style={styles.card}>
                <DetailRow label="Bank" value={item.bank_name} />
                <DetailRow label="Branch" value={item.branch_name} />
                <DetailRow label="Account Number" value={item.account_number} />
                <DetailRow label="Account Type" value={item.account_type} />
                <DetailRow label="Opening Balance" value={`${getCurrencySymbol()}${Number(item.opening_balance || 0).toLocaleString()}`} />
                <DetailRow label="Somiti" value={item.somiti?.name} />
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
    title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', flex: 1 },
    active: { fontSize: 11, fontWeight: 'bold' },
    card: { backgroundColor: '#fff', margin: 20, borderRadius: 12, padding: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    label: { fontSize: 14, color: '#64748b' },
    value: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1, textAlign: 'right' },
});
