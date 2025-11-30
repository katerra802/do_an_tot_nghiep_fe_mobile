import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

export type ThemedTextInputProps = TextInputProps & {
    lightColor?: string;
    darkColor?: string;
};

export default function ThemedTextInput({ style, placeholderTextColor, lightColor, darkColor, ...props }: ThemedTextInputProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const placeholderColor = placeholderTextColor || (color ? color : undefined);

    return (
        <TextInput
            {...props}
            placeholderTextColor={placeholderColor}
            style={[{ color }, style]}
        />
    );
}
