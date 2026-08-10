import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

interface AppCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    title?: string;
    subtitle?: string;
    right?: React.ReactNode;
}

export default function AppCard({ children, style, onPress, title, subtitle, right }: AppCardProps) {
    const Content = (
        <>
            {title ? (
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{title}</Text>
                        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                    </View>
                    {right ? <View>{right}</View> : null}
                </View>
            ) : null}
            <View>{children}</View>
        </>
    );

    if (onPress) {
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.card, style]}>
                {Content}
            </TouchableOpacity>
        );
    }

    return <View style={[styles.card, style]}>{Content}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    headerText: { flex: 1, marginRight: spacing.sm },
    title: { ...typography.h3, color: colors.text },
    subtitle: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
});