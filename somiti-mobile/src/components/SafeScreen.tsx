import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeScreenProps {
    children: React.ReactNode;
    style?: any;
}

export default function SafeScreen({ children, style }: SafeScreenProps) {
    return (
        <SafeAreaView style={[styles.safe, style]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <View style={styles.content}>{children}</View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    content: { flex: 1 },
});
