import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export default function CreateSomitiScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!name.trim()) { Alert.alert(t('error'), t('somitiNameRequired')); return; }
        setSubmitting(true);
        try {
            const { data } = await client.post('/somitis', { name: name.trim() });
            const { data: me } = await client.get('/auth/me');
            useAuthStore.setState({ user: me });
            Alert.alert(t('done'), `"${data.name}" ${t('created')}!`, [
                { text: t('goToDashboard'), onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }
            ]);
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.logo}><Ionicons name="business" size={40} color={colors.textOnPrimary} /></View>
                <Text style={styles.title}>{t('createSomiti')}</Text>
                <Text style={styles.subtitle}>{t('startYourOwn')}</Text>

                <View style={styles.card}>
                    <AppInput label={t('somitiName')} placeholder={t('somitiName')} value={name} onChangeText={setName} />
                    <Text style={styles.hint}>{t('youWillBeOwner')}</Text>
                    <AppButton title={t('createSomiti')} onPress={submit} loading={submitting} size="lg" />
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('JoinSomiti')} style={styles.linkWrap}>
                    <Text style={styles.link}>{t('joinExistingInstead')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl },
    logo: { width: 72, height: 72, borderRadius: radius.xl, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', ...shadows.card },
    title: { ...typography.h1, color: colors.text, textAlign: 'center', marginTop: spacing.lg },
    subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.xxxl },
    card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xxl, ...shadows.card },
    hint: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
    linkWrap: { alignItems: 'center', marginTop: spacing.xl },
    link: { ...typography.bodyMedium, color: colors.primary },
});
