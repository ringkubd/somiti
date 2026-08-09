import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function DividendsListScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        if (!somitiId) return;
        try {
            const { data } = await client.get(`/somitis/${somitiId}/dividends`);
            setItems(data.data || []);
        } catch {}
    };

    useFocusEffect(useCallback(() => { fetch(); }, [somitiId]));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Dividends</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('DividendCreate')}>
                    <Text style={styles.addBtnText}>+ Declare</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={items}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={`${getCurrencySymbol()}${parseFloat(item.total_amount || '0').toLocaleString()}`}
                        subtitle={`${item.profit_period || ''} • ${item.financial_year?.name || ''}`}
                        right={<StatusBadge status={item.status === 'paid' ? 'approved' : item.status} />}
                        onPress={() => navigation.navigate('DividendDetail', { id: item.id })}
                    />
                )}
                ListEmptyComponent={<EmptyState message="No dividends declared yet" action="Declare Dividend" onAction={() => navigation.navigate('DividendCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    addBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
