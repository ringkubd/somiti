import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
}

export default function ErrorState({
    message = 'Something went wrong. Please try again.',
    onRetry,
    icon = 'cloud-offline-outline',
}: ErrorStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrap}>
                <Ionicons name={icon} size={40} color={colors.danger} />
            </View>
            <Text style={styles.title}>Oops</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry ? (
                <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
                    <Ionicons name="refresh" size={18} color={colors.textOnPrimary} />
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
    iconWrap: {
        width: 80, height: 80, borderRadius: radius.full,
        backgroundColor: colors.dangerLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
    },
    title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
    message: {
        ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22,
    },
    retryBtn: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        backgroundColor: colors.primary, borderRadius: radius.md,
        paddingHorizontal: spacing.xxl, paddingVertical: spacing.md,
    },
    retryText: { color: colors.textOnPrimary, ...typography.bodyMedium },
});