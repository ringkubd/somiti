import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, EmptyState } from '../../components/Shared';
import { ListHeader } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

export default function NotificationsListScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const fetch = async () => { try { const { data } = await client.get('/notifications'); setItems(data.data || []); } catch { } };
    useFocusEffect(useCallback(() => { fetch(); }, []));
    return (
        <View style={styles.container}>
            <ListHeader title={t('notifications')} subtitle={t('updatesAlerts')} />
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={item.title} subtitle={item.message}
                        right={item.is_read ? undefined : <View style={styles.dot} />} />
                )}
                ListEmptyComponent={<EmptyState message={t('noNotifications')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
