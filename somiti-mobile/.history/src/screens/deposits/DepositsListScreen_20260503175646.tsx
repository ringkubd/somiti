import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function DepositsListScreen({ navigation }: any) {
    const [deposits, setDeposits] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        try {
            const { data } = await client.get('/deposits');
            setDeposits(data.data || []);
        } catch {}
    };

    useFocusEffect(useCallback(() => { fetch(); }, []));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Deposits</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('DepositCreate')}>
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={deposits}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={`${item.somiti?.name || ''}`}
                        subtitle={`${item.user?.name || ''} • ${new Date(item.created_at).toLocaleDateString()}`}
                        right={<StatusBadge status={item.status} />}
                        onPress={() => navigation.navigate('DepositDetail', { id: item.id })}
                    />
                )}
                ListEmptyComponent={<EmptyState message="No deposits yet" action="Create Deposit" onAction={() => navigation.navigate('DepositCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={deposits.length === 0 ? { flex: 1 } : {}}
            />
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
