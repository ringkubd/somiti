import React from 'react';
import { StatusBar, View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
    children: React.ReactNode;
    style?: any;
    scroll?: boolean;
}

export default function ScreenLayout({ children, style }: ScreenLayoutProps) {
    return (
        <SafeAreaView style={[styles.safe, style]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" translucent={false} />
            <View style={styles.content}>
                {children}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    },
    content: {
        flex: 1,
    },
});
