import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { ListHeader } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';
import { colors } from '../../theme';

export default function InvestmentsListScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const fetch = async () => { try { const { data } = await client.get('/investments'); setItems(data.data || []); } catch { } };
    useFocusEffect(useCallback(() => { fetch(); }, []));
    return (
        <View style={styles.container}>
            <ListHeader title={t('investments')} subtitle={t('growthInvestments')} actionLabel={t('new')} onAction={() => navigation.navigate('InvestmentCreate')} />
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={`${item.somiti?.name || ''} — ${getCurrencySymbol()}${parseFloat(item.amount).toLocaleString()}`}
                        subtitle={item.type} right={<StatusBadge status={item.status} />}
                        onPress={() => navigation.navigate('InvestmentDetail', { id: item.id })} />
                )}
                ListEmptyComponent={<EmptyState message={t('noInvestments')} action={t('newInvestment')} onAction={() => navigation.navigate('InvestmentCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
