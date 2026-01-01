// components/ads/banner-ad.tsx
import React from "react";
import { Platform, View, Text } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAdUnitId } from "../../src/config/admob";

type BannerAdComponentProps = {
  size?: BannerAdSize;
  showLabel?: boolean;
};

/**
 * バナー広告コンポーネント
 * - 画面下部や記事の間に表示される広告
 * - サイズはBannerAdSizeで指定可能
 */
export function BannerAdComponent({ 
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
  showLabel = true 
}: BannerAdComponentProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const [adError, setAdError] = React.useState<string | null>(null);
  const [adLoaded, setAdLoaded] = React.useState(false);

  // Web環境では広告を表示しない
  if (Platform.OS === "web") {
    return null;
  }

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
          setAdLoaded(true);
          setAdError(null);
        }}
        onAdFailedToLoad={(error) => {
          console.warn("Banner ad failed to load:", error);
          setAdError(error.message);
          setAdLoaded(false);
        }}
      />

      {adError && __DEV__ && (
        <Text style={{ 
          fontSize: 10, 
          color: "red", 
          marginTop: 4,
          textAlign: "center" 
        }}>
          広告の読み込みに失敗しました
        </Text>
      )}
    </View>
  );
}
