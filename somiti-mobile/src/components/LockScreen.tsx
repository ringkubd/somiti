import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LockScreenProps {
    onUnlock: () => void;
    onSetupPin: (pin: string) => Promise<boolean>;
    biometricType: string | null;
    onBiometric: () => Promise<boolean>;
}

export default function LockScreen({ onUnlock, onSetupPin, biometricType, onBiometric }: LockScreenProps) {
    const [pin, setPin] = useState('');
    const [mode, setMode] = useState<'unlock' | 'create' | 'confirm'>('unlock');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [loadingBio, setLoadingBio] = useState(false);

    useEffect(() => {
        if (biometricType) {
            handleBiometric();
        }
    }, []);

    const handleBiometric = async () => {
        setLoadingBio(true);
        const ok = await onBiometric();
        setLoadingBio(false);
        if (ok) onUnlock();
    };

    const handlePinSubmit = async () => {
        if (mode === 'unlock') {
            const ok = await onSetupPin(pin);
            if (ok) { onUnlock(); return; }
            setError('Wrong PIN');
            setPin('');
            return;
        }
        if (mode === 'create') {
            if (pin.length < 4) { setError('PIN must be at least 4 digits'); return; }
            setMode('confirm');
            setError('');
            return;
        }
        if (mode === 'confirm') {
            if (pin === confirmPin) {
                const ok = await onSetupPin(pin);
                if (ok) { onUnlock(); return; }
            }
            setError('PINs do not match');
            setPin('');
            setConfirmPin('');
            setMode('create');
        }
    };

    const digit = (d: string) => {
        if (mode === 'confirm' && confirmPin.length < 4) {
            setConfirmPin(prev => prev + d);
        } else if (pin.length < 6) {
            setPin(prev => prev + d);
        }
        setError('');
    };

    const deleteDigit = () => {
        if (mode === 'confirm' && confirmPin.length > 0) {
            setConfirmPin(prev => prev.slice(0, -1));
        } else if (pin.length > 0) {
            setPin(prev => prev.slice(0, -1));
        }
    };

    const displayPin = mode === 'confirm' ? confirmPin : pin;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="lock-closed" size={48} color="#2563eb" />
                <Text style={styles.title}>
                    {mode === 'unlock' ? 'Enter PIN' : mode === 'create' ? 'Create PIN' : 'Confirm PIN'}
                </Text>
                <Text style={styles.subtitle}>
                    {mode === 'unlock' ? 'Authenticate to access your somiti' : 'Set a 4-6 digit PIN'}
                </Text>
            </View>

            {/* Dots */}
            <View style={styles.dots}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <View key={i} style={[styles.dot, i < displayPin.length && styles.dotFilled]} />
                ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Biometric button */}
            {mode === 'unlock' && biometricType && (
                <TouchableOpacity style={styles.bioBtn} onPress={handleBiometric} disabled={loadingBio}>
                    {loadingBio ? <ActivityIndicator color="#2563eb" /> : (
                        <Ionicons name={biometricType === 'fingerprint' ? 'finger-print' : 'scan'} size={40} color="#2563eb" />
                    )}
                    <Text style={styles.bioText}>
                        {biometricType === 'fingerprint' ? 'Touch ID' : 'Face ID'}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Number Pad */}
            <View style={styles.keypad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) => {
                    if (d === '') return <View key={i} style={styles.key} />;
                    if (d === '⌫') return (
                        <TouchableOpacity key={i} style={styles.key} onPress={deleteDigit}>
                            <Text style={styles.keyText}>⌫</Text>
                        </TouchableOpacity>
                    );
                    return (
                        <TouchableOpacity key={i} style={styles.key} onPress={() => digit(d)}>
                            <Text style={styles.keyText}>{d}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', padding: 24 },
    header: { alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginTop: 16 },
    subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
    dots: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#e2e8f0' },
    dotFilled: { backgroundColor: '#2563eb' },
    error: { color: '#ef4444', fontSize: 14, marginBottom: 16 },
    bioBtn: { alignItems: 'center', marginBottom: 24, padding: 12 },
    bioText: { color: '#2563eb', fontSize: 14, marginTop: 4, fontWeight: '500' },
    keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 280, gap: 8 },
    key: { width: 80, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
    keyText: { fontSize: 24, fontWeight: '500', color: '#1e293b' },
});
