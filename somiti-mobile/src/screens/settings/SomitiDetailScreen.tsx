import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import client from '../../api/client';
import { DetailScreen, DetailRow, AppButton } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, radius, spacing, typography } from '../../theme';

export default function SomitiDetailScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const [somiti, setSomiti] = useState<any>(null);
    const [canManage, setCanManage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true); setError(false);
        try {
            const { data } = await client.get(`/somitis/${route.params?.id || ''}`);
            setSomiti(data.somiti || data);
            setCanManage(data.can_manage ?? false);
        }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const qrUrl = somiti?.unique_code
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(somiti.unique_code)}`
        : null;

    return (
        <DetailScreen
            title={somiti?.name || t('somiti')}
            subtitle={somiti?.unique_code}
            onBack={() => navigation.goBack()}
            loading={loading}
            error={error}
            onRetry={load}
            footer={
                somiti && canManage ? <AppButton title={t('settings')} variant="secondary" onPress={() => navigation.navigate('SomitiSettings', { id: somiti.id })} /> : null
            }
        >
            {qrUrl && (
                <View style={styles.qrSection}>
                    <Text style={styles.qrLabel}>{t('shareCodeWithMembers')}:</Text>
                    <Image source={{ uri: qrUrl }} style={styles.qr} />
                    <Text style={styles.qrCode}>{somiti.unique_code}</Text>
                    <Text style={styles.qrHint}>{t('membersEnterCode')}</Text>
                </View>
            )}
            <DetailRow label={t('status')} value={somiti?.status} />
            <DetailRow label={t('currency')} value={somiti ? `${somiti.currency_symbol || '$'} ${somiti.currency || 'USD'}` : null} />
            <DetailRow label={t('members')} value={`${somiti?.members?.length || 0}`} />
            <DetailRow label={t('created')} value={somiti && new Date(somiti.created_at).toLocaleDateString()} last />

            {canManage && (
                <>
                    <Text style={styles.section}>{t('manage')}</Text>
                    <View style={styles.actions}>
                        <AppButton title={t('setManager')} variant="primary" onPress={() => navigation.navigate('Managers', { somitiId: somiti.id })} />
                        <AppButton title={t('monthlyDues')} variant="secondary" onPress={() => navigation.navigate('DuesOverview', { somitiId: somiti.id })} />
                        <AppButton title={t('members')} variant="secondary" onPress={() => navigation.navigate('MembersList')} />
                        <AppButton title={t('balanceSheet')} variant="secondary" onPress={() => navigation.navigate('BalanceSheet')} />
                        <AppButton title={t('fundPortfolio')} variant="secondary" onPress={() => navigation.navigate('Portfolio')} />
                    </View>
                </>
            )}
        </DetailScreen>
    );
}

const styles = StyleSheet.create({
    qrSection: { alignItems: 'center', padding: spacing.lg, marginBottom: spacing.lg },
    qrLabel: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
    qr: { width: 160, height: 160, borderRadius: radius.md },
    qrCode: { ...typography.h3, color: colors.text, letterSpacing: 2, marginTop: spacing.md },
    qrHint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
    section: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
    actions: { gap: spacing.sm, marginBottom: spacing.lg },
});