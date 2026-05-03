import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, EmptyState, StatusBadge } from '../../components/Shared';

export default function FinancialYearsListScreen({ navigation }: any) {
    const [items, setItems] = useState<any[]>([]);
    useFocusEffect(useCallback(() => { client.get('/financial-years').then(({ data }) => setItems(data.data || [])).catch(() => { }); }, []));
    return (
        <View style={styles.container}>
            <View style={styles.header}><Text style={styles.title}>Financial Years</Text></View>
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={item.title} subtitle={`${item.somiti?.name} • ${new Date(item.start_date).toLocaleDateString()} - ${new Date(item.end_date).toLocaleDateString()}`}
                        right={<StatusBadge status={item.is_active ? 'active' : 'closed'} />} />
                )}
                ListEmptyComponent={<EmptyState message="No financial years" />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, header: {
        paddingHorizontal: 20, paddingBottom: 16,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
});
