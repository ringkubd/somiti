import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '../../theme';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
    destructive = false, icon = 'help-circle-outline', onConfirm, onCancel,
}: ConfirmDialogProps) {
    if (!visible) return null;
    const accent = destructive ? colors.danger : colors.primary;
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <View style={[styles.iconWrap, { backgroundColor: accent + '1A' }]}>
                        <Ionicons name={icon} size={30} color={accent} />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    {message ? <Text style={styles.message}>{message}</Text> : null}
                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel} activeOpacity={0.8}>
                            <Text style={styles.cancelText}>{cancelLabel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: accent }]} onPress={onConfirm} activeOpacity={0.8}>
                            <Text style={styles.confirmText}>{confirmLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backdrop, padding: spacing.xxl },
    dialog: {
        width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl,
        padding: spacing.xxl, alignItems: 'center', ...shadows.popover,
    },
    iconWrap: { width: 64, height: 64, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
    title: { ...typography.h2, color: colors.text, textAlign: 'center' },
    message: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, width: '100%' },
    btn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
    cancelBtn: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
    cancelText: { ...typography.bodyMedium, color: colors.textSecondary },
    confirmText: { ...typography.bodyMedium, color: colors.textOnPrimary, fontWeight: '600' },
});