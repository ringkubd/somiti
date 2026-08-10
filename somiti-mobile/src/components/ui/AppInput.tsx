import React, { forwardRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface AppInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
    { label, error, containerStyle, leftIcon, rightIcon, style, ...rest },
    ref
) {
    return (
        <View style={[styles.wrapper, containerStyle]}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <View style={[styles.field, error && styles.fieldError, style]}>
                {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
                <TextInput
                    ref={ref}
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    {...rest}
                />
                {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
});

const styles = StyleSheet.create({
    wrapper: { marginBottom: spacing.lg },
    label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
    },
    fieldError: { borderColor: colors.danger },
    iconLeft: { marginRight: spacing.sm },
    iconRight: { marginLeft: spacing.sm },
    input: {
        flex: 1,
        paddingVertical: spacing.md + 1,
        fontSize: 16,
        color: colors.text,
    },
    error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});

export default AppInput;