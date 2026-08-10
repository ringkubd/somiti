import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface DetailRowProps {
    label: string;
    value?: string | number | null;
    last?: boolean;
}

export default function DetailRow({ label, value, last }: DetailRowProps) {
    return (
        <View style={[styles.row, last && styles.rowLast]}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} numberOfLines={2}>{value ?? '-'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: spacing.md + 1, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
    },
    rowLast: { borderBottomWidth: 0, paddingBottom: 0 },
    label: { ...typography.body, color: colors.textSecondary },
    value: { ...typography.bodyMedium, color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});