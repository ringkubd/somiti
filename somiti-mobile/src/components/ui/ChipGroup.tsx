import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface ChipGroupProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export default function ChipGroup({ options, value, onChange, label }: ChipGroupProps) {
    return (
        <View style={styles.wrap}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <View style={styles.row}>
                {options.map((opt) => {
                    const active = value === opt;
                    return (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.chip, active && styles.chipActive]}
                            onPress={() => onChange(opt)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.replace('_', ' ')}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginBottom: spacing.lg },
    label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: {
        paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
        borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
    chipTextActive: { color: colors.textOnPrimary },
});