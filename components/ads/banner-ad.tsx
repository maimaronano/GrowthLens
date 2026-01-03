// components/ads/banner-ad.tsx
import React from "react";
import { Platform, View, Text } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// 一時的にAdMobを無効化（prebuildが必要）
// import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
// import { getAdUnitId } from "../../src/config/admob";

type BannerAdComponentProps = {
  size?: any; // BannerAdSize
  showLabel?: boolean;
};

/**
 * バナー広告コンポーネント（一時的に無効化）
 * 実機ビルド時に有効化してください
 */
export function BannerAdComponent({ 
  showLabel = true 
}: BannerAdComponentProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  // Web環境または開発環境では広告を表示しない
  if (Platform.OS === "web" || __DEV__) {
    return (
      <View style={{ alignItems: "center", marginVertical: 8 }}>
        {showLabel && (
          <Text style={{ 
            fontSize: 10, 
            color: palette.muted, 
            marginBottom: 4,
            textAlign: "center" 
          }}>
            広告（実機ビルド時に表示）
          </Text>
        )}
        <View style={{
          height: 50,
          backgroundColor: palette.cardSoft,
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
        }}>
          <Text style={{ fontSize: 12, color: palette.muted }}>
            💰 AdMob広告エリア
          </Text>
        </View>
      </View>
    );
  }

  return null;
  
  /* 実機ビルド時にコメントを外す
  const adUnitId = getAdUnitId("banner");
  
  return (
    <View style={{ alignItems: "center", marginVertical: 8 }}>
      {showLabel && (
        <Text style={{ 
          fontSize: 10, 
          color: palette.muted, 
          marginBottom: 4,
          textAlign: "center" 
        }}>
          広告
        </Text>
      )}
      
      <BannerAd
        unitId={adUnitId}
        size={size}
        onAdLoaded={() => {
          console.log("Banner ad loaded");
        }}
        onAdFailedToLoad={(error) => {
          console.warn("Banner ad failed to load:", error);
        }}
      />
    </View>
  );
  */
}
