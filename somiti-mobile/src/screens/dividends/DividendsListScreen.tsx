import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { ListHeader } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol, useSomiti } from '../../hooks/useSomiti';
import { colors } from '../../theme';

export default function DividendsListScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const fetch = async () => { try { const { data } = await client.get(`/somitis/${somitiId}/dividends`); setItems(data.data || []); } catch { } };
    useFocusEffect(useCallback(() => { fetch(); }, []));
    return (
        <View style={styles.container}>
            <ListHeader title={t('dividends')} subtitle={t('profitDistributions')} actionLabel={t('new')} onAction={() => navigation.navigate('DividendCreate')} />
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={`${getCurrencySymbol()}${parseFloat(item.total_amount || '0').toLocaleString()}`}
                        subtitle={`${item.user?.name || ''} • ${item.status}`}
                        right={<StatusBadge status={item.status} />}
                        onPress={() => navigation.navigate('DividendDetail', { id: item.id })} />
                )}
                ListEmptyComponent={<EmptyState message={t('noDividends')} action={t('declareDividend')} onAction={() => navigation.navigate('DividendCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
