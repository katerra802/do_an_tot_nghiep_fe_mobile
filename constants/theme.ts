/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#f5f5f5',
    cardBackground: '#ffffff',
    inputBackground: '#ffffff',
    tint: tintColorLight,
    primary: '#2E7D32',
    success: '#4CAF50',
    danger: '#d32f2f',
    warning: '#FF9800',
    info: '#2196F3',
    border: '#ddd',
    divider: '#f0f0f0',
    muted: '#666',
    label: '#555',
    placeholder: '#999',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: '#000',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0a0a0a',
    cardBackground: '#1a1a1a',
    inputBackground: '#222',
    tint: tintColorDark,
    primary: '#66BB6A',
    success: '#66BB6A',
    danger: '#ef9a9a',
    warning: '#FFB74D',
    info: '#64B5F6',
    border: '#333',
    divider: '#2a2a2a',
    muted: '#9BA1A6',
    label: '#aaa',
    placeholder: '#666',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: '#000',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
