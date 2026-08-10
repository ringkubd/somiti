import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { ListHeader } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

export default function DepositsListScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [deposits, setDeposits] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        try {
            const { data } = await client.get('/deposits');
            setDeposits(data.data || []);
        } catch { }
    };

    useFocusEffect(useCallback(() => { fetch(); }, []));

    return (
        <View style={styles.container}>
            <ListHeader
                title={t('deposits')}
                subtitle={t('savingsContributions')}
                actionLabel={t('new')}
                onAction={() => navigation.navigate('DepositCreate')}
            />
            <FlatList
                data={deposits}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={`${item.somiti?.name || ''}`}
                        subtitle={`${item.user?.name || ''} • ${new Date(item.created_at).toLocaleDateString()}`}
                        right={<StatusBadge status={item.status} />}
                        onPress={() => navigation.navigate('DepositDetail', { id: item.id })}
                    />
                )}
                ListEmptyComponent={<EmptyState message={t('noDeposits')} action={t('newDeposit')} onAction={() => navigation.navigate('DepositCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={deposits.length === 0 ? { flex: 1 } : {}}
            />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
