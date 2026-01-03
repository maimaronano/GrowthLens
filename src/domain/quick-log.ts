// クイック記録用のデータ型定義

// 睡眠記録
export type SleepAction = "寝た" | "起きた";
export type SleepLog = {
  id: string;
  type: "sleep";
  action: SleepAction;
  timestamp: string; // ISO
  duration?: number; // 睡眠時間（ミリ秒）、起きた時のみ
  note?: string;
};

// おむつ記録
export type DiaperType = "おしっこ" | "うんち" | "両方";
export type DiaperLog = {
  id: string;
  type: "diaper";
  diaperType: DiaperType;
  timestamp: string; // ISO
  note?: string;
};

// 授乳記録
export type FeedingType = "左" | "右" | "ミルク";
export type FeedingLog = {
  id: string;
  type: "feeding";
  feedingType: FeedingType;
  timestamp: string; // ISO
  duration?: number; // 授乳時間（分）
  amount?: number; // ミルク量（ml）
  note?: string;
};

// 全クイック記録の統合型
export type QuickLog = SleepLog | DiaperLog | FeedingLog;

// ストレージキー
export const STORAGE_KEY_QUICK_LOGS = "@growthlens/quick-logs";
export const STORAGE_KEY_ACTIVE_SLEEP = "@growthlens/active-sleep";

// スキーマバージョン
export const QUICK_LOG_SCHEMA_VERSION = 1;

export type QuickLogStorageData = {
  version: number;
  logs: QuickLog[];
};

// 進行中の睡眠記録
export type ActiveSleep = {
  id: string;
  startTime: string; // ISO
};

// ID生成
export function generateQuickLogId(): string {
  return `quick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 経過時間を計算（ミリ秒）
export function calculateDuration(startTime: string, endTime: string = new Date().toISOString()): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return end - start;
}

// 経過時間を人間が読みやすい形式に変換
export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
}

// 前回からの間隔を計算
export function calculateInterval(logs: QuickLog[], type: QuickLog["type"]): string | null {
  const typedLogs = logs.filter(log => log.type === type);
  if (typedLogs.length === 0) return null;
  
  const latest = typedLogs[0];
  const now = Date.now();
  const lastTime = new Date(latest.timestamp).getTime();
  const interval = now - lastTime;
  
  return formatDuration(interval);
}
