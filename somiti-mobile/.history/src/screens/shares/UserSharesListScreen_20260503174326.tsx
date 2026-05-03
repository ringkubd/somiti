import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';

export default function UserSharesListScreen({ navigation }: any) {
    const [items, setItems] = useState<any[]>([]);
    useFocusEffect(useCallback(() => { client.get('/shares').then(({ data }) => setItems(data.data || [])).catch(() => {}); }, []));
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Member Shares</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('UserShareCreate')}>
                    <Text style={styles.addBtnText}>Assign</Text>
                </TouchableOpacity>
            </View>
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={`${item.somiti?.name || ''} — ${item.share_count} shares`}
                        subtitle={item.user?.name} right={<StatusBadge status={item.status} />} />
                )}
                ListEmptyComponent={<EmptyState message="No shares allocated" action="Assign Shares" onAction={() => navigation.navigate('UserShareCreate')} />}
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
