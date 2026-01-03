import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  QuickLog,
  QuickLogStorageData,
  ActiveSleep,
} from "../domain/quick-log";
import {
  STORAGE_KEY_QUICK_LOGS,
  STORAGE_KEY_ACTIVE_SLEEP,
  QUICK_LOG_SCHEMA_VERSION,
} from "../domain/quick-log";

/**
 * クイック記録を読み込む
 */
export async function loadQuickLogs(): Promise<QuickLog[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_QUICK_LOGS);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // 旧形式（配列のみ）の場合は新形式に移行
    if (Array.isArray(parsed)) {
      const logs = parsed as QuickLog[];
      await saveQuickLogs(logs);
      return sortLogs(logs);
    }

    // 新形式
    const data = parsed as QuickLogStorageData;
    return sortLogs(data.logs || []);
  } catch (error) {
    console.error("Failed to load quick logs:", error);
    return [];
  }
}

/**
 * クイック記録を保存する
 */
export async function saveQuickLogs(logs: QuickLog[]): Promise<void> {
  try {
    const data: QuickLogStorageData = {
      version: QUICK_LOG_SCHEMA_VERSION,
      logs: logs,
    };
    await AsyncStorage.setItem(STORAGE_KEY_QUICK_LOGS, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save quick logs:", error);
    throw new Error("クイック記録の保存に失敗しました");
  }
}

/**
 * クイック記録を追加
 */
export async function addQuickLog(log: QuickLog): Promise<void> {
  const logs = await loadQuickLogs();
  logs.unshift(log);
  await saveQuickLogs(logs);
}

/**
 * クイック記録を更新
 */
export async function updateQuickLog(id: string, updates: Partial<QuickLog>): Promise<void> {
  const logs = await loadQuickLogs();
  const index = logs.findIndex((log) => log.id === id);
  
  if (index === -1) {
    throw new Error("記録が見つかりません");
  }
  
  logs[index] = { ...logs[index], ...updates } as QuickLog;
  await saveQuickLogs(logs);
}

/**
 * クイック記録を削除
 */
export async function deleteQuickLog(id: string): Promise<void> {
  const logs = await loadQuickLogs();
  const filtered = logs.filter((log) => log.id !== id);
  await saveQuickLogs(filtered);
}

/**
 * 日付降順でソート
 */
function sortLogs(logs: QuickLog[]): QuickLog[] {
  return [...logs].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA;
  });
}

/**
 * 進行中の睡眠を保存
 */
export async function saveActiveSleep(sleep: ActiveSleep | null): Promise<void> {
  try {
    if (sleep === null) {
      await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_SLEEP);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_SLEEP, JSON.stringify(sleep));
    }
  } catch (error) {
    console.error("Failed to save active sleep:", error);
  }
}

/**
 * 進行中の睡眠を読み込む
 */
export async function loadActiveSleep(): Promise<ActiveSleep | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_SLEEP);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSleep;
  } catch (error) {
    console.error("Failed to load active sleep:", error);
    return null;
  }
}

/**
 * 特定タイプの最新記録を取得
 */
export async function getLatestLog(type: QuickLog["type"]): Promise<QuickLog | null> {
  const logs = await loadQuickLogs();
  const typedLogs = logs.filter(log => log.type === type);
  return typedLogs[0] || null;
}

/**
 * 今日の記録を取得
 */
export async function getTodayLogs(): Promise<QuickLog[]> {
  const logs = await loadQuickLogs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= today;
  });
}
