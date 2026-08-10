import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '../theme';

interface Option { label: string; value: string | number; }

interface SelectFieldProps {
    label: string;
    value: string | number | null;
    options: Option[];
    onSelect: (value: string) => void;
    placeholder?: string;
}

export function SelectField({ label, value, options, onSelect, placeholder }: SelectFieldProps) {
    const [visible, setVisible] = useState(false);
    const selected = options.find(o => o.value.toString() === value?.toString());

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)} activeOpacity={0.7}>
                <Text style={[styles.triggerText, !selected && styles.placeholder]}>
                    {selected?.label || placeholder || `Select ${label}`}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="close" size={22} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(i) => i.value.toString()}
                            renderItem={({ item }) => {
                                const active = item.value.toString() === value?.toString();
                                return (
                                    <TouchableOpacity
                                        style={[styles.option, active && styles.optionActive]}
                                        onPress={() => { onSelect(item.value.toString()); setVisible(false); }}
                                    >
                                        <Text style={[styles.optionText, active && styles.optionTextActive]}>{item.label}</Text>
                                        {active ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                                    </TouchableOpacity>
                                );
                            }}
                            ItemSeparatorComponent={() => <View style={styles.sep} />}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginBottom: spacing.lg },
    label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
    trigger: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
        borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md + 1,
    },
    triggerText: { flex: 1, fontSize: 16, color: colors.text },
    placeholder: { color: colors.textMuted },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backdrop },
    modal: { backgroundColor: colors.surface, borderRadius: radius.lg, width: '85%', maxHeight: '65%', padding: spacing.xl, ...shadows.popover },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    modalTitle: { ...typography.h3, color: colors.text },
    option: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    },
    optionActive: { backgroundColor: colors.primaryLight, borderRadius: radius.md },
    optionText: { ...typography.body, color: colors.text },
    optionTextActive: { color: colors.primaryDark, fontWeight: '600' },
    sep: { height: 1, backgroundColor: colors.border },
});
