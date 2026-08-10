import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
    label: string;
    tone?: Tone;
    dot?: boolean;
}

const TONES: Record<Tone, { bg: string; fg: string }> = {
    success: { bg: colors.successLight, fg: colors.success },
    warning: { bg: colors.warningLight, fg: colors.warning },
    danger: { bg: colors.dangerLight, fg: colors.danger },
    info: { bg: colors.infoLight, fg: colors.info },
    neutral: { bg: colors.surfaceAlt, fg: colors.textSecondary },
    primary: { bg: colors.primaryLight, fg: colors.primaryDark },
};

export default function Badge({ label, tone = 'neutral', dot = false }: BadgeProps) {
    const t = TONES[tone];
    return (
        <View style={[styles.badge, { backgroundColor: t.bg }]}>
            {dot ? <View style={[styles.dot, { backgroundColor: t.fg }]} /> : null}
            <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        gap: spacing.xs,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    text: { ...typography.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
});