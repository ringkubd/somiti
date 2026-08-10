import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import client from '../../api/client';
import { StatusBadge } from '../../components/Shared';
import { DetailScreen, DetailRow, AppButton } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';
import { colors, spacing, typography } from '../../theme';

export default function DividendDetailScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [confirmAction, setConfirmAction] = useState<string | null>(null);

    const load = async () => {
        setLoading(true); setError(false);
        try { const { data } = await client.get(`/dividends/${route.params.id}`); setItem(data); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const decide = async (decision: string) => {
        if (!item) return;
        try {
            await client.post(`/dividends/${item.id}/${decision}`);
            Alert.alert(t('done'), `${t('dividends')} ${decision}`);
            setConfirmAction(null);
            load();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setConfirmAction(null); }
    };

    return (
        <DetailScreen
            title={`${t('dividends')} #${item?.id || ''}`}
            onBack={() => navigation.goBack()}
            loading={loading}
            error={error}
            onRetry={load}
            right={item ? <StatusBadge status={item.status === 'paid' ? 'approved' : item.status} /> : null}
            stat={{ label: t('totalAmount'), value: item?.total_amount, color: '#8B5CF6', currency: getCurrencySymbol() }}
            footer={
                item?.status === 'pending' ? (
                    <View style={styles.actions}>
                        <View style={styles.btnWrap}>
                            <AppButton title={t('approvePay')} variant="secondary" onPress={() => decide('approve')} />
                        </View>
                        <View style={styles.btnWrap}>
                            <AppButton title={t('reject')} variant="danger" onPress={() => decide('reject')} />
                        </View>
                    </View>
                ) : null
            }
        >
            <DetailRow label={t('distributionType')} value={item?.distribution_type} />
            <DetailRow label={t('profitPeriod')} value={item?.profit_period} />
            <DetailRow label={t('financialYear')} value={item?.financial_year?.title || item?.financial_year?.name} />
            <DetailRow label={t('allocations')} value={`${item?.allocations?.length || 0}`} last />

            <Text style={styles.sectionTitle}>{t('allocations')}</Text>
            {(item?.allocations || []).map((a: any) => (
                <View key={a.id} style={styles.allocRow}>
                    <Text style={styles.allocName}>{a.user?.name || `#${a.user_id}`}</Text>
                    <Text style={styles.allocValue}>{getCurrencySymbol()}{parseFloat(a.amount || '0').toLocaleString()}</Text>
                </View>
            ))}
            {(item?.allocations || []).length === 0 && <Text style={styles.empty}>{t('noData')}</Text>}
        </DetailScreen>
    );
}

const styles = StyleSheet.create({
    sectionTitle: { ...typography.label, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
    allocRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
    allocName: { ...typography.body, color: colors.textSecondary, flex: 1 },
    allocValue: { ...typography.bodyMedium, color: colors.text, fontWeight: '600' },
    empty: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center', padding: spacing.md },
    actions: { flexDirection: 'row', gap: spacing.md },
    btnWrap: { flex: 1 },
});
