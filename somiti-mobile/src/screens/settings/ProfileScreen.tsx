import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useLocalAuth } from '../../hooks/useLocalAuth';
import { FormScreen, AppInput, AppButton } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import { LANGUAGES } from '../../i18n/translations';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ProfileScreen({ navigation }: any) {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);
    const [bioEnabled, setBioEnabled] = useState(false);

    const { hasPin, biometricType, enableBiometric, disableBiometric } = useLocalAuth();
    const { language, setLanguage } = useLanguage();

    useEffect(() => {
        (async () => {
            const { default: SecureStore } = await import('expo-secure-store');
            const v = await SecureStore.getItemAsync('biometric_enabled');
            setBioEnabled(v === 'true');
        })();
    }, []);

    const toggleBio = async (val: boolean) => {
        if (val) {
            const ok = await enableBiometric();
            if (ok) { setBioEnabled(true); Alert.alert('Success', 'Biometric enabled'); }
            else Alert.alert('Error', 'Biometric not available or not enrolled');
        } else {
            await disableBiometric();
            setBioEnabled(false);
        }
    };

    const update = async () => {
        setLoading(true);
        try {
            await client.put('/auth/profile', { name, email, phone });
            Alert.alert('Success', 'Profile updated');
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <FormScreen title="Profile" subtitle="Your account details" onBack={() => navigation.goBack()} submitLabel="Save Changes" onSubmit={update} submitting={loading}>
            <View style={styles.avatarWrap}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text></View>
            </View>
            <AppInput label="Name" placeholder="Your name" value={name} onChangeText={setName} leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />} />
            <AppInput label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />} />
            <AppInput label="Phone" placeholder="Your phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon={<Ionicons name="call-outline" size={20} color={colors.textMuted} />} />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Language</Text>
                <View style={styles.langWrap}>
                    {LANGUAGES.map((l) => {
                        const active = language === l.code;
                        return (
                            <TouchableOpacity
                                key={l.code}
                                style={[styles.langChip, active && styles.langChipActive]}
                                onPress={() => setLanguage(l.code)}
                            >
                                <Text style={[styles.langText, active && styles.langTextActive]}>{l.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                {biometricType && (
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>{biometricType === 'fingerprint' ? 'Fingerprint' : 'Face ID'} Lock</Text>
                        <Switch value={bioEnabled} onValueChange={toggleBio} trackColor={{ true: colors.primary }} />
                    </View>
                )}
                {hasPin && (
                    <TouchableOpacity style={styles.linkBtn} onPress={() => Alert.alert('Change PIN', 'Feature coming')}>
                        <Text style={styles.linkText}>Change PIN</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('ChangePassword')}>
                    <Text style={styles.linkText}>Change Password</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.linkBtn} onPress={() => logout()}>
                    <Text style={[styles.linkText, { color: colors.danger }]}>Logout</Text>
                </TouchableOpacity>
            </View>
        </FormScreen>
    );
}

const styles = StyleSheet.create({
    avatarWrap: { alignItems: 'center', marginBottom: spacing.xl },
    avatar: { width: 80, height: 80, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: colors.textOnPrimary, fontSize: 32, fontWeight: '700' },
    section: { marginTop: spacing.lg },
    sectionTitle: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    switchLabel: { ...typography.body, color: colors.text },
    langWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    langChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
    langChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    langText: { ...typography.bodySmall, color: colors.textSecondary },
    langTextActive: { color: colors.textOnPrimary, fontWeight: '600' },
    linkBtn: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    linkText: { ...typography.bodyMedium, color: colors.primary },
});
