import React from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppButton from './AppButton';
import { colors, radius, shadows, spacing, typography } from '../../theme';

interface FormScreenProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    children: React.ReactNode;
    submitLabel: string;
    onSubmit: () => void;
    submitting?: boolean;
    submitDisabled?: boolean;
}

/** Consistent professional scrollable form screen for create/edit flows. */
export default function FormScreen({
    title, subtitle, onBack, children, submitLabel, onSubmit, submitting, submitDisabled,
}: FormScreenProps) {
    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    {onBack ? (
                        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="chevron-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    ) : <View style={styles.backBtn} />}
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{title}</Text>
                        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                    </View>
                    <View style={styles.backBtn} />
                </View>

                <View style={styles.form}>
                    {children}
                    <AppButton title={submitLabel} onPress={onSubmit} loading={submitting} disabled={submitDisabled} size="lg" style={{ marginTop: spacing.sm }} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    content: { paddingBottom: spacing.xxxl },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn: { width: 40 },
    headerText: { flex: 1, alignItems: 'center' },
    title: { ...typography.h3, color: colors.text },
    subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    form: { padding: spacing.lg, paddingTop: spacing.xl },
});