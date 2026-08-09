import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import client from '../../api/client';
import { StatusBadge, StatCard } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function DividendDetailScreen({ route, navigation }: any) {
    const [item, setItem] = useState<any>(null);

    useEffect(() => {
        client.get(`/dividends/${route.params.id}`).then(({ data }) => setItem(data)).catch(() => {});
    }, []);

    const decide = async (decision: string) => {
        try {
            await client.post(`/dividends/${item.id}/${decision}`);
            Alert.alert('Done', `Dividend ${decision}`);
            const { data } = await client.get(`/dividends/${item.id}`);
            setItem(data);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed');
        }
    };

    if (!item) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.header}>
                <Text style={styles.title}>Dividend #{item.id}</Text>
                <StatusBadge status={item.status === 'paid' ? 'approved' : item.status} />
            </View>
            <StatCard label="Total Amount" value={item.total_amount} color="#8b5cf6" currency={getCurrencySymbol()} />
            <View style={styles.card}>
                <DetailRow label="Distribution" value={item.distribution_type} />
                <DetailRow label="Period" value={item.profit_period} />
                <DetailRow label="Financial Year" value={item.financial_year?.title || item.financial_year?.name} />
                <DetailRow label="Allocations" value={`${item.allocations?.length || 0}`} />
            </View>

            <Text style={styles.sectionTitle}>Allocations</Text>
            <View style={styles.card}>
                {(item.allocations || []).map((a: any) => (
                    <View key={a.id} style={styles.row}>
                        <Text style={styles.label}>{a.user?.name || `User #${a.user_id}`}</Text>
                        <Text style={styles.value}>{getCurrencySymbol()}{parseFloat(a.amount || '0').toLocaleString()}</Text>
                    </View>
                ))}
                {(item.allocations || []).length === 0 && <Text style={styles.empty}>No allocations yet</Text>}
            </View>

            {item.status === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]} onPress={() => decide('approve')}>
                        <Text style={styles.actionText}>Approve & Pay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={() => decide('reject')}>
                        <Text style={styles.actionText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    card: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, padding: 16, marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    label: { fontSize: 14, color: '#64748b', flex: 1 },
    value: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
    empty: { color: '#94a3b8', textAlign: 'center', padding: 12 },
    actions: { flexDirection: 'row', gap: 12, margin: 20, marginTop: 16 },
    actionBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
    actionText: { color: '#fff', fontWeight: '600' },
});
