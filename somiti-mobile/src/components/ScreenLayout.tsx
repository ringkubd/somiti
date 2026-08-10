import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface ScreenLayoutProps {
    children: React.ReactNode;
    style?: any;
    scroll?: boolean;
}

export default function ScreenLayout({ children, style }: ScreenLayoutProps) {
    return (
        <SafeAreaView style={[styles.safe, style]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.bg} translucent={false} />
            <View style={styles.content}>
                {children}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        flex: 1,
    },
});
