import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, EmptyState } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function BankAccountsListScreen({ navigation }: any) {
    const [items, setItems] = useState<any[]>([]);
    useFocusEffect(useCallback(() => { client.get('/bank-accounts').then(({ data }) => setItems(data.data || [])).catch(() => {}); }, []));
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Bank Accounts</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('BankAccountCreate')}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={item.bank_name} subtitle={`${item.account_number} • ${getCurrencySymbol()}${parseFloat(item.current_balance).toLocaleString()}`}
                        right={<Text style={styles.type}>{item.account_type}</Text>} />
                )}
                ListEmptyComponent={<EmptyState message="No bank accounts" action="Add Account" onAction={() => navigation.navigate('BankAccountCreate')} />}
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
    type: { fontSize: 12, color: '#64748b', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },
});
