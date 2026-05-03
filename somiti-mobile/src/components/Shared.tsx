import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';

export function StatCard({ label, value, color = '#3b82f6', currency = '$' }: any) {
    const displayValue = (value === undefined || value === null || isNaN(Number(value))) ? '0' : Number(value).toLocaleString();
    return (
        <PaperCard style={[styles.card, { borderLeftColor: color }]}>
            <PaperCard.Content>
                <Text style={styles.cardLabel}>{label}</Text>
                <Text style={[styles.cardValue, { color }]}>{currency}{displayValue}</Text>
            </PaperCard.Content>
        </PaperCard>
    );
}

export function ListItem({ title, subtitle, right, onPress, left }: any) {
    return (
        <TouchableOpacity style={styles.listItem} onPress={onPress} disabled={!onPress}>
            {left && <View style={styles.listLeft}>{left}</View>}
            <View style={styles.listContent}>
                <Text style={styles.listTitle} numberOfLines={1}>{title}</Text>
                {subtitle && <Text style={styles.listSubtitle} numberOfLines={1}>{subtitle}</Text>}
            </View>
            {right && <View style={styles.listRight}>{typeof right === 'string' ? <Text style={styles.listRightText}>{right}</Text> : right}</View>}
        </TouchableOpacity>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        approved: '#10b981', pending: '#f59e0b', rejected: '#ef4444',
        disbursed: '#3b82f6', closed: '#6b7280', active: '#10b981',
    };
    return (
        <View style={[styles.badge, { backgroundColor: colors[status] || '#6b7280' }]}>
            <Text style={styles.badgeText}>{status.toUpperCase()}</Text>
        </View>
    );
}

export function EmptyState({ message, action, onAction }: any) {
    return (
        <View style={styles.empty}>
            <Text style={styles.emptyText}>{message}</Text>
            {action && (
                <TouchableOpacity style={styles.emptyBtn} onPress={onAction}>
                    <Text style={styles.emptyBtnText}>{action}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export function SectionHeader({ title, action, onAction }: any) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {action && (
                <TouchableOpacity onPress={onAction}>
                    <Text style={styles.sectionAction}>{action}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { flex: 1, borderRadius: 12, borderLeftWidth: 4, elevation: 2 },
    cardLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
    cardValue: { fontSize: 22, fontWeight: 'bold' },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    listLeft: { marginRight: 12 },
    listContent: { flex: 1 },
    listTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    listSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    listRight: { marginLeft: 8 },
    listRightText: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
    emptyBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
    emptyBtnText: { color: '#fff', fontWeight: '600' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    sectionAction: { fontSize: 14, color: '#2563eb', fontWeight: '500' },
});
