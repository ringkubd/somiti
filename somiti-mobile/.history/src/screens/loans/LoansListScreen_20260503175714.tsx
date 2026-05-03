import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function LoansListScreen({ navigation }: any) {
    const [loans, setLoans] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        try { const { data } = await client.get('/loans'); setLoans(data.data || []); } catch {}
    };

    useFocusEffect(useCallback(() => { fetch(); }, []));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Loans</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('LoanCreate')}>
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>
            <FlatList data={loans} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={`${item.somiti?.name || ''} — ${getCurrencySymbol()}${parseFloat(item.amount).toLocaleString()}`}
                        subtitle={item.user?.name} right={<StatusBadge status={item.status} />}
                        onPress={() => navigation.navigate('LoanDetail', { id: item.id })} />
                )}
                ListEmptyComponent={<EmptyState message="No loans" action="Apply for Loan" onAction={() => navigation.navigate('LoanCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={loans.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    addBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
