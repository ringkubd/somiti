import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useSomiti, getCurrencySymbol } from '../../hooks/useSomiti';
import { StatusBadge, EmptyState } from '../../components/Shared';
import { ListHeader } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

const statusColor: Record<string, string> = { paid: '#10b981', partial: '#f59e0b', due: '#3b82f6', overdue: '#ef4444', future: '#94a3b8' };

export default function MyDuesScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [schedule, setSchedule] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        if (!somitiId) return;
        try {
            const { data } = await client.get(`/somitis/${somitiId}/my-dues`);
            setSchedule(data);
        } catch {}
    };

    useFocusEffect(useCallback(() => { fetch(); }, [somitiId]));

    if (!schedule) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    const cs = getCurrencySymbol();

    return (
        <View style={styles.container}>
            <ListHeader title={t('myDues')} subtitle={t('monthlyDues')} actionLabel={t('pay')} onAction={() => navigation.navigate('DepositCreate')} />

            <View style={styles.summary}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{t('expected')}</Text>
                    <Text style={styles.summaryValue}>{cs}{Number(schedule.total_expected || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{t('paid')}</Text>
                    <Text style={[styles.summaryValue, { color: '#10b981' }]}>{cs}{Number(schedule.total_paid || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{t('overdue')}</Text>
                    <Text style={[styles.summaryValue, { color: schedule.overdue_count > 0 ? '#ef4444' : '#94a3b8' }]}>{schedule.overdue_count} mo</Text>
                </View>
            </View>

            <FlatList
                data={schedule.months}
                keyExtractor={(m) => m.month_key}
                renderItem={({ item }) => (
                    <View style={styles.monthRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.monthLabel}>{item.month_label}</Text>
                            <Text style={styles.monthAmount}>
                                {cs}{Number(item.paid || 0).toLocaleString()} / {cs}{Number(item.expected || 0).toLocaleString()}
                                {item.pending > 0 ? `  • pending ${cs}${Number(item.pending).toLocaleString()}` : ''}
                            </Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: statusColor[item.status] || '#94a3b8' }]}>
                            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<EmptyState message={t('noDues')} action={t('makeDeposit')} onAction={() => navigation.navigate('DepositCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    addBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    summary: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, gap: 12 },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
    summaryValue: { fontSize: 17, fontWeight: 'bold', color: '#1e293b' },
    monthRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16,
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    monthLabel: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    monthAmount: { fontSize: 13, color: '#64748b', marginTop: 3 },
    statusPill: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
