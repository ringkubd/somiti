import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import { StatCard } from '../Shared';
import AppCard from './AppCard';
import DetailRow from './DetailRow';
import ErrorState from './ErrorState';

interface DetailScreenProps {
    title: string;
    subtitle?: string;
    onBack: () => void;
    loading?: boolean;
    error?: boolean;
    onRetry?: () => void;
    right?: React.ReactNode;
    stat?: { label: string; value: any; color?: string; currency?: string };
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export default function DetailScreen({
    title, subtitle, onBack, loading, error, onRetry, right, stat, children, footer,
}: DetailScreenProps) {
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }
    if (error) {
        return <ErrorState onRetry={onRetry} />;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                {onBack ? (
                    <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="chevron-back" size={26} color={colors.text} />
                    </TouchableOpacity>
                ) : <View style={styles.backBtn} />}
                <View style={styles.headerCenter}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
                </View>
                <View style={styles.headerRight}>{right}</View>
            </View>

            {stat ? (
                <View style={styles.statWrap}>
                    <StatCard label={stat.label} value={stat.value} color={stat.color || colors.primary} currency={stat.currency || ''} />
                </View>
            ) : null}

            <AppCard style={styles.details}>{children}</AppCard>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
            <View style={{ height: spacing.xxxl }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { paddingBottom: spacing.xxl },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
        backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn: { width: 40, alignItems: 'flex-start' },
    headerCenter: { flex: 1, alignItems: 'center' },
    title: { ...typography.h3, color: colors.text },
    subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    headerRight: { width: 40, alignItems: 'flex-end' },
    statWrap: { padding: spacing.lg, paddingBottom: 0 },
    details: { margin: spacing.lg, marginTop: spacing.lg },
    footer: { paddingHorizontal: spacing.lg },
});