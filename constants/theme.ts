/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

// 赤ちゃん向けアプリの配色：柔らかいパステルカラー
const tintColorLight = "#FF9AA2";  // コーラルピンク（柔らかく温かみのある）
const tintColorDark = "#FFB3BA";   // ライトコーラル

export const Colors = {
  light: {
    text: "#5A5A5A",              // 柔らかいダークグレー（読みやすく優しい）
    muted: "#9E9E9E",            // ミディアムグレー
    background: "#FFF9F5",        // アイボリーベージュ（温かみのある背景）
    card: "#FFFFFF",             // ピュアホワイト
    cardSoft: "#FFF4E6",         // ライトピーチ（柔らかいカード背景）
    border: "#FFE4CC",           // ピーチベージュ（優しいボーダー）
    accentSurface: "#FFE8D6",    // アプリコットクリーム（アクセント背景）
    accentText: "#FF7F50",       // コーラルオレンジ（目立つアクセント）
    primary: "#FFB6B9",          // ベビーピンク（メインカラー）
    secondary: "#B4E7CE",        // ミントグリーン（サブカラー）
    tertiary: "#A8D8EA",         // ベビーブルー（第3カラー）
    sunshine: "#FFF9B0",         // レモンイエロー（ポジティブな要素）
    danger: "#FFCCCB",           // ライトレッド（優しい警告色）
    dangerBorder: "#FFB3B3",     // ピンキッシュレッド
    tint: tintColorLight,
    icon: "#B8B8B8",
    tabIconDefault: "#C5C5C5",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#E8E8E8",             // 明るいグレー
    muted: "#B0B0B0",            // ミディアムグレー
    background: "#2C2C2E",       // ダークグレー（優しいダーク背景）
    card: "#3A3A3C",             // ミディアムダークグレー
    cardSoft: "#48484A",         // ライトダークグレー
    border: "#58585A",           // グレーボーダー
    accentSurface: "#4A4446",    // ダークウォーム
    accentText: "#FFB3BA",       // ライトコーラル
    primary: "#FF9AA2",          // コーラルピンク
    secondary: "#8BC1B0",        // ダークミント
    tertiary: "#7DB8C7",         // ダークブルー
    sunshine: "#E6DC9A",         // ダークイエロー
    danger: "#D88A8A",           // ダークレッド
    dangerBorder: "#B87373",     // ダーカーレッド
    tint: tintColorDark,
    icon: "#A0A0A0",
    tabIconDefault: "#8A8A8A",
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
