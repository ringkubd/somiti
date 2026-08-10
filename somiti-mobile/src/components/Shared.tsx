import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppCard from './ui/AppCard';
import Badge from './ui/Badge';
import { colors, radius, shadows, spacing, typography } from '../theme';

const STATUS_TONES: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'> = {
    approved: 'success',
    active: 'success',
    paid: 'success',
    completed: 'success',
    disbursed: 'info',
    pending: 'warning',
    request: 'warning',
    rejected: 'danger',
    cancelled: 'danger',
    closed: 'neutral',
    inactive: 'neutral',
    default: 'neutral',
};

export function StatCard({ label, value, color = colors.primary, currency = '', icon = 'trending-up-outline' }: any) {
    const displayValue =
        value === undefined || value === null || isNaN(Number(value))
            ? '0'
            : Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
    return (
        <AppCard style={styles.statCard}>
            <View style={styles.statTop}>
                <View style={[styles.statIcon, { backgroundColor: color + '1A' }]}>
                    <Ionicons name={icon} size={16} color={color} />
                </View>
            </View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
                {currency }{displayValue}
            </Text>
        </AppCard>
    );
}

export function ListItem({ title, subtitle, right, onPress, left }: any) {
    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            style={styles.listItem}
            onPress={onPress}
            disabled={!onPress}
        >
            {left && <View style={styles.listLeft}>{left}</View>}
            <View style={styles.listContent}>
                <Text style={styles.listTitle} numberOfLines={1}>{title}</Text>
                {subtitle ? <Text style={styles.listSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
            </View>
            {right && (
                <View style={styles.listRight}>
                    {typeof right === 'string' ? <Text style={styles.listRightText}>{right}</Text> : right}
                </View>
            )}
            {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
        </TouchableOpacity>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const key = String(status || '').toLowerCase();
    const tone = STATUS_TONES[key] || STATUS_TONES.default;
    return <Badge label={status || 'n/a'} tone={tone} dot />;
}

export function EmptyState({ message, action, onAction, icon = 'folder-open-outline' }: any) {
    return (
        <View style={styles.empty}>
            <View style={styles.emptyIcon}>
                <Ionicons name={icon} size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyText}>{message}</Text>
            {action && (
                <TouchableOpacity style={styles.emptyBtn} onPress={onAction}>
                    <Text style={styles.emptyBtnText}>{action}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export function SectionHeader({ title, action, onAction }: any) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {action && (
                <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <View style={styles.sectionActionWrap}>
                        <Text style={styles.sectionAction}>{action}</Text>
                        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
    return (
        <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    statCard: {
        flex: 1,
        padding: spacing.lg,
        overflow: 'hidden',
        minHeight: 110,
        justifyContent: 'space-between',
    },
    statTop: { flexDirection: 'row', justifyContent: 'flex-end' },
    statIcon: { width: 28, height: 28, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
    statLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
    statValue: { ...typography.h2, fontWeight: '800' },

    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        marginHorizontal: spacing.lg,
        marginVertical: spacing.xs,
        ...shadows.card,
    },
    listLeft: { marginRight: spacing.xs },
    listContent: { flex: 1 },
    listTitle: { ...typography.bodyMedium, color: colors.text },
    listSubtitle: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
    listRight: { marginRight: spacing.sm },
    listRightText: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },

    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: radius.full,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    emptyText: {
        ...typography.body,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    emptyBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.md,
        ...shadows.card,
    },
    emptyBtnText: { color: colors.textOnPrimary, ...typography.bodyMedium },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    sectionTitle: { ...typography.h3, color: colors.text },
    sectionActionWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    sectionAction: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },

    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl, gap: spacing.md },
    loadingText: { ...typography.bodySmall, color: colors.textMuted },
});
