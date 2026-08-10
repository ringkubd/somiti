import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface SafeScreenProps {
    children: React.ReactNode;
    style?: any;
}

export default function SafeScreen({ children, style }: SafeScreenProps) {
    return (
        <SafeAreaView style={[styles.safe, style]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
            <View style={styles.content}>{children}</View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    content: { flex: 1 },
});
