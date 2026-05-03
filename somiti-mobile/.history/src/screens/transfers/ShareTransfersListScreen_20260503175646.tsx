import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function ShareTransfersListScreen({ navigation }: any) {
    const [items, setItems] = useState<any[]>([]);
    useFocusEffect(useCallback(() => { client.get('/share-transfers').then(({ data }) => setItems(data.data || [])).catch(() => {}); }, []));
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Share Transfers</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('ShareTransferCreate')}>
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={`${item.from_user?.name || 'Treasury'} → ${item.to_user?.name}`}
                        subtitle={`${item.somiti?.name} • ${item.quantity} shares @ $${parseFloat(item.price_per_share).toLocaleString()}`}
                        right={<StatusBadge status={item.status} />} />
                )}
                ListEmptyComponent={<EmptyState message="No transfers" action="New Transfer" onAction={() => navigation.navigate('ShareTransferCreate')} />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, header: { flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    addBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
