import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';
import { FormScreen, AppInput, AppButton } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, radius, spacing, typography } from '../../theme';

export default function MemberAddScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [role, setRole] = useState('member');
    const [submitting, setSubmitting] = useState(false);

    const search = async () => {
        if (!query.trim()) { Alert.alert(t('error'), t('enterNamePhoneEmail')); return; }
        setSearching(true);
        try {
            const { data } = await client.get('/users/search', { params: { q: query.trim() } });
            setResults(data || []);
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSearching(false); }
    };

    const add = async () => {
        if (!selected) { Alert.alert(t('error'), t('selectUserFromResults')); return; }
        setSubmitting(true);
        try {
            await client.post(`/somitis/${somitiId}/users`, { user_id: selected.id, role });
            Alert.alert(t('done'), `${selected.name} ${t('addedAs')} ${role}`);
            navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('addMember')} subtitle={t('searchByNamePhoneEmail')} onBack={() => navigation.goBack()} submitLabel={t('addToSomiti')} onSubmit={add} submitting={submitting} submitDisabled={!selected}>
            <View style={styles.searchWrap}>
                <View style={styles.searchField}>
                    <AppInput placeholder={t('namePhoneEmail')} value={query} onChangeText={setQuery} autoCapitalize="none" containerStyle={{ marginBottom: 0 }} />
                </View>
                <AppButton title={t('search')} onPress={search} loading={searching} size="sm" fullWidth={false} style={styles.searchBtn} />
            </View>

            {results.length > 0 && (
                <View style={styles.results}>
                    {results.map((u) => {
                        const active = selected?.id === u.id;
                        return (
                            <TouchableOpacity key={u.id} style={[styles.result, active && styles.resultActive]} onPress={() => setSelected(u)}>
                                <View style={styles.resultText}>
                                    <Text style={styles.resultName}>{u.name}</Text>
                                    <Text style={styles.resultSub}>{u.phone || u.email || ''}</Text>
                                </View>
                                {active ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : <Ionicons name="ellipse-outline" size={22} color={colors.borderStrong} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {selected && (
                <SelectField
                    label={t('role')}
                    value={role}
                    options={[
                        { label: t('member'), value: 'member' },
                        { label: t('manager'), value: 'manager' },
                    ]}
                    onSelect={setRole}
                />
            )}
        </FormScreen>
    );
}

const styles = StyleSheet.create({
    searchWrap: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginBottom: spacing.lg },
    searchField: { flex: 1 },
    searchBtn: { paddingHorizontal: spacing.lg, marginTop: 0 },
    results: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, overflow: 'hidden' },
    result: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
    resultActive: { backgroundColor: colors.primaryLight },
    resultText: { flex: 1 },
    resultName: { ...typography.bodyMedium, color: colors.text },
    resultSub: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
});
