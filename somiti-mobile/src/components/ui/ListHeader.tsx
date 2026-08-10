import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, radius, spacing, typography } from '../../theme';

interface ListHeaderProps {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
    onBack?: () => void;
}

export default function ListHeader({ title, subtitle, actionLabel, onAction, onBack }: ListHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                {onBack ? (
                    <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                ) : null}
                <View>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
            </View>
            {actionLabel && onAction ? (
                <TouchableOpacity onPress={onAction} activeOpacity={0.85}>
                    <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addBtn}>
                        <Ionicons name="add" size={18} color={colors.textOnPrimary} />
                        <Text style={styles.addBtnText}>{actionLabel}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
        backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    backBtn: { marginRight: spacing.sm },
    title: { ...typography.h2, color: colors.text },
    subtitle: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    },
    addBtnText: { color: colors.textOnPrimary, ...typography.bodySmall, fontWeight: '600' },
});