// components/ads/interstitial-ad.tsx
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import { getAdUnitId } from "../../src/config/admob";

/**
 * インタースティシャル広告（全画面広告）フック
 * - 画面遷移時や特定のアクション後に表示
 * - ユーザー体験を損なわないよう、表示タイミングに注意
 */
export function useInterstitialAd() {
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Web環境では広告を表示しない
    if (Platform.OS === "web") return;

    const adUnitId = getAdUnitId("interstitial");
    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true, // GDPR対応: 非パーソナライズ広告
    });

    // 広告読み込み完了
    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
      console.log("Interstitial ad loaded");
    });

    // 広告表示完了
    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      console.log("Interstitial ad closed");
      // 次回用に新しい広告をロード
      ad.load();
    });

    // 広告読み込み失敗
    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn("Interstitial ad error:", error);
      setLoaded(false);
    });

    // 初回読み込み
    ad.load();
    setInterstitial(ad);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const show = async () => {
    if (loaded && interstitial) {
      try {
        await interstitial.show();
      } catch (error) {
        console.warn("Failed to show interstitial ad:", error);
      }
    } else {
      console.log("Interstitial ad not ready yet");
    }
  };

  return { show, loaded };
}
