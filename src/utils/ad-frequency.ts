// src/utils/ad-frequency.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const AD_FREQUENCY_KEY = "@growthlens/ad-frequency";

type AdFrequencyData = {
  logSaveCount: number;
  lastInterstitialTimestamp: number;
  dailyAdCount: number;
  lastAdDate: string;
};

/**
 * 広告表示頻度を管理するユーティリティ
 */
export class AdFrequencyManager {
  private static instance: AdFrequencyManager;
  private data: AdFrequencyData = {
    logSaveCount: 0,
    lastInterstitialTimestamp: 0,
    dailyAdCount: 0,
    lastAdDate: new Date().toDateString(),
  };

  private constructor() {}

  static getInstance(): AdFrequencyManager {
    if (!this.instance) {
      this.instance = new AdFrequencyManager();
    }
    return this.instance;
  }

  /**
   * データを読み込む
   */
  async load(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(AD_FREQUENCY_KEY);
      if (raw) {
        this.data = JSON.parse(raw);
        // 日付が変わっていたらカウントをリセット
        const today = new Date().toDateString();
        if (this.data.lastAdDate !== today) {
          this.data.dailyAdCount = 0;
          this.data.lastAdDate = today;
          await this.save();
        }
      }
    } catch (e) {
      console.error("Failed to load ad frequency data:", e);
    }
  }

  /**
   * データを保存する
   */
  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(AD_FREQUENCY_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Failed to save ad frequency data:", e);
    }
  }

  /**
   * ログ保存回数をインクリメント
   */
  async incrementLogSave(): Promise<void> {
    this.data.logSaveCount++;
    await this.save();
  }

  /**
   * インタースティシャル広告を表示すべきか判定
   * - 5回に1回の頻度
   * - 最後の表示から1分以上経過
   * - 1日の上限（10回）に達していない
   */
  async shouldShowInterstitial(): Promise<boolean> {
    await this.load();

    const now = Date.now();
    const oneMinute = 60 * 1000;
    const maxDailyAds = 10;

    // 条件チェック
    const frequencyCheck = this.data.logSaveCount % 5 === 0 && this.data.logSaveCount > 0;
    const timeCheck = now - this.data.lastInterstitialTimestamp > oneMinute;
    const dailyLimitCheck = this.data.dailyAdCount < maxDailyAds;

    return frequencyCheck && timeCheck && dailyLimitCheck;
  }

  /**
   * インタースティシャル広告を表示したことを記録
   */
  async recordInterstitialShown(): Promise<void> {
    this.data.lastInterstitialTimestamp = Date.now();
    this.data.dailyAdCount++;
    await this.save();
  }

  /**
   * 統計情報を取得
   */
  async getStats(): Promise<AdFrequencyData> {
    await this.load();
    return { ...this.data };
  }

  /**
   * データをリセット（テスト用）
   */
  async reset(): Promise<void> {
    this.data = {
      logSaveCount: 0,
      lastInterstitialTimestamp: 0,
      dailyAdCount: 0,
      lastAdDate: new Date().toDateString(),
    };
    await this.save();
  }
}
