import React from 'react';
import { SafeAreaView, StatusBar, View, StyleSheet, Platform } from 'react-native';

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
