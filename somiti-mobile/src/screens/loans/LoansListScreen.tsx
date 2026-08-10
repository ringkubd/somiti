import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { ListHeader } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';
import { colors } from '../../theme';

export default function LoansListScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [loans, setLoans] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const fetch = async () => { try { const { data } = await client.get('/loans'); setLoans(data.data || []); } catch { } };
    useFocusEffect(useCallback(() => { fetch(); }, []));
    return (
        <View style={styles.container}>
            <ListHeader title={t('loans')} subtitle={t('loansBorrowing')} actionLabel={t('new')} onAction={() => navigation.navigate('LoanCreate')} />
            <FlatList data={loans} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={`${item.somiti?.name || ''} — ${getCurrencySymbol()}${parseFloat(item.amount).toLocaleString()}`}
                        subtitle={item.user?.name} right={<StatusBadge status={item.status} />}
                        onPress={() => navigation.navigate('LoanDetail', { id: item.id })} />
                )}
                ListEmptyComponent={<EmptyState message={t('noLoans')} action={t('newLoan')} onAction={() => navigation.navigate('LoanCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={loans.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
