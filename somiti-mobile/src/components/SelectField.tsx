import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

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
            <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
                <Text style={[styles.triggerText, !selected && styles.placeholder]}>
                    {selected?.label || placeholder || `Select ${label}`}
                </Text>
                <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <FlatList data={options} keyExtractor={(i) => i.value.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.option, item.value.toString() === value?.toString() && styles.optionActive]}
                                    onPress={() => { onSelect(item.value.toString()); setVisible(false); }}>
                                    <Text style={[styles.optionText, item.value.toString() === value?.toString() && styles.optionTextActive]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 6 },
    trigger: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1,
        borderColor: '#e2e8f0', borderRadius: 12, padding: 16 },
    triggerText: { flex: 1, fontSize: 16, color: '#1e293b' },
    placeholder: { color: '#94a3b8' },
    arrow: { fontSize: 12, color: '#94a3b8' },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    modal: { backgroundColor: '#fff', borderRadius: 16, width: '85%', maxHeight: '60%', padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
    option: { paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    optionActive: { backgroundColor: '#eff6ff', borderRadius: 8 },
    optionText: { fontSize: 16, color: '#1e293b' },
    optionTextActive: { color: '#2563eb', fontWeight: '600' },
});
