import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import client from '../../api/client';
import { StatCard } from '../../components/Shared';
import { ScreenHeader, ErrorState, SkeletonList } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';
import { colors, spacing } from '../../theme';

export default function ReportsSummaryScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true); setError(false);
        try { const { data: d } = await client.get('/reports/summary'); setData(d); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    React.useEffect(() => { load(); }, []);

    const cs = getCurrencySymbol();

    return (
        <>
            <ScreenHeader title={t('financialSummary')} onBack={() => navigation.goBack()} />
            {loading ? <SkeletonList count={2} rows={1} /> : error ? <ErrorState onRetry={load} /> : (
                <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                    <View style={styles.row}>
                        <StatCard label={t('cashBalance')} value={data?.cash} color="#16A34A" currency={cs} />
                        <StatCard label={t('memberSavings')} value={data?.member_savings} color="#D97706" currency={cs} />
                    </View>
                    <View style={styles.row}>
                        <StatCard label={t('loansReceivable')} value={data?.loans_receivable} color="#EF4444" currency={cs} />
                        <StatCard label={t('shareCapital')} value={data?.share_capital} color="#8B5CF6" currency={cs} />
                    </View>
                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg },
    row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
});
