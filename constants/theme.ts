/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#f39ac7";
const tintColorDark = "#ffb8d8";

export const Colors = {
  light: {
    text: "#3f2f3c",
    muted: "#7d6b75",
    background: "#fff7f2",
    card: "#ffffff",
    cardSoft: "#fff0f6",
    border: "#f2dce8",
    accentSurface: "#ffe5ef",
    accentText: "#7b294f",
    danger: "#f9c5c5",
    dangerBorder: "#f4a3a3",
    tint: tintColorLight,
    icon: "#9b7b8b",
    tabIconDefault: "#c2a9b6",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#f4edf0",
    muted: "#c7b7c2",
    background: "#201c22",
    card: "#2b242c",
    cardSoft: "#332933",
    border: "#3f313c",
    accentSurface: "#3a2b33",
    accentText: "#ffd9e7",
    danger: "#704848",
    dangerBorder: "#8c5b5b",
    tint: tintColorDark,
    icon: "#c2a9b6",
    tabIconDefault: "#9d8a95",
    tabIconSelected: tintColorDark,
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
