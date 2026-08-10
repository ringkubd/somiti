import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    right?: React.ReactNode;
}

export default function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
    return (
        <View style={styles.container}>
            {onBack ? (
                <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
            ) : (
                <View style={styles.backBtn} />
            )}
            <View style={styles.center}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
            </View>
            <View style={styles.right}>{right}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
    center: { flex: 1, alignItems: 'center' },
    title: { ...typography.h3, color: colors.text },
    subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    right: { width: 40, alignItems: 'flex-end' },
});