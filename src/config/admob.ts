// src/config/admob.ts
import { Platform } from "react-native";

// テスト用広告ユニットID（本番環境では実際のIDに置き換える必要があります）
export const ADMOB_CONFIG = {
  // バナー広告
  banner: {
    ios: __DEV__ ? "ca-app-pub-3940256099942544/2934735716" : "YOUR_IOS_BANNER_ID",
    android: __DEV__ ? "ca-app-pub-3940256099942544/6300978111" : "YOUR_ANDROID_BANNER_ID",
  },
  // インタースティシャル広告（全画面広告）
  interstitial: {
    ios: __DEV__ ? "ca-app-pub-3940256099942544/4411468910" : "YOUR_IOS_INTERSTITIAL_ID",
    android: __DEV__ ? "ca-app-pub-3940256099942544/1033173712" : "YOUR_ANDROID_INTERSTITIAL_ID",
  },
  // リワード広告（報酬型広告）
  rewarded: {
    ios: __DEV__ ? "ca-app-pub-3940256099942544/1712485313" : "YOUR_IOS_REWARDED_ID",
    android: __DEV__ ? "ca-app-pub-3940256099942544/5224354917" : "YOUR_ANDROID_REWARDED_ID",
  },
} as const;

/**
 * プラットフォームに応じた広告ユニットIDを取得
 */
export function getAdUnitId(adType: keyof typeof ADMOB_CONFIG): string {
  const platform = Platform.OS === "ios" ? "ios" : "android";
  return ADMOB_CONFIG[adType][platform];
}

/**
 * 本番環境用の広告IDが設定されているかチェック
 */
export function isProductionAdConfigured(): boolean {
  if (__DEV__) return true; // 開発環境では常にtrue
  
  const platform = Platform.OS === "ios" ? "ios" : "android";
  return !ADMOB_CONFIG.banner[platform].startsWith("YOUR_");
}
