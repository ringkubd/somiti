import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ListHeader } from '../../components/ui';
import { ListItem } from '../../components/Shared';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

const reports = [
    { labelKey: 'summaryReport', icon: 'stats-chart-outline' as const, color: '#7C3AED', screen: 'ReportsSummary', tx: false },
    { labelKey: 'trialBalance', icon: 'scale-outline' as const, color: '#0D9488', screen: 'ReportsTrialBalance', tx: false },
    { labelKey: 'balanceSheet', icon: 'reader-outline' as const, color: '#2563EB', screen: 'BalanceSheet', tx: true },
    { labelKey: 'profitLoss', icon: 'trending-down-outline' as const, color: '#DC2626', screen: 'ProfitLoss', tx: true },
    { labelKey: 'fundPortfolio', icon: 'pie-chart-outline' as const, color: '#D97706', screen: 'Portfolio', tx: true },
    { labelKey: 'memberProfiles', icon: 'people-outline' as const, color: '#4F46E5', screen: 'MemberProfiles', tx: true },
];

export default function ReportsHubScreen({ navigation }: any) {
    const { t } = useLanguage();

    const go = (item: any) => {
        if (item.tx) {
            navigation.navigate('Transactions', { screen: item.screen });
        } else {
            navigation.navigate(item.screen);
        }
    };

    return (
        <View style={styles.container}>
            <ListHeader title={t('reports')} subtitle={t('financialReports')} onBack={() => navigation.goBack()} />
            <FlatList
                data={reports}
                keyExtractor={(i) => i.screen}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => go(item)}>
                        <ListItem
                            title={t(item.labelKey)}
                            left={
                                <View style={[styles.iconWrap, { backgroundColor: item.color + '1A' }]}>
                                    <Ionicons name={item.icon} size={20} color={item.color} />
                                </View>
                            }
                        />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
