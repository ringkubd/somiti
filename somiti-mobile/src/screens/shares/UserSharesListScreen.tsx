import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { ListHeader } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

export default function UserSharesListScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const fetch = async () => { try { const { data } = await client.get('/shares'); setItems(data.data || []); } catch { } };
    useFocusEffect(useCallback(() => { fetch(); }, []));
    return (
        <View style={styles.container}>
            <ListHeader title={t('shares')} subtitle={t('shareAllocations')} actionLabel={t('assign')} onAction={() => navigation.navigate('UserShareCreate')} />
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={`${item.somiti?.name || ''} — ${item.share_count} ${t('shares')}`}
                        subtitle={item.user?.name} right={<StatusBadge status={item.status} />}
                        onPress={() => navigation.navigate('UserShareDetail', { id: item.id })} />
                )}
                ListEmptyComponent={<EmptyState message={t('noShares')} action={t('assignShares')} onAction={() => navigation.navigate('UserShareCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
