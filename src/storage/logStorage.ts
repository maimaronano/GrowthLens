import AsyncStorage from "@react-native-async-storage/async-storage";
import { GrowthLog, STORAGE_KEY_LOGS, SCHEMA_VERSION, StorageData } from "../domain/log";

/**
 * ログを読み込む（堅牢化版）
 * - JSONパースエラーを検知して復旧
 * - スキーマバージョンをチェック
 * - 日付降順でソート
 */
export async function loadLogs(): Promise<GrowthLog[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // 旧形式（配列のみ）の場合は新形式に移行
    if (Array.isArray(parsed)) {
      const logs = parsed as GrowthLog[];
      // 新形式で保存し直す
      await saveLogs(logs);
      return sortLogs(logs);
    }

    // 新形式（バージョン付き）
    const data = parsed as StorageData;
    
    // バージョンチェック（将来のマイグレーション用）
    if (data.version !== SCHEMA_VERSION) {
      console.warn(`Schema version mismatch: ${data.version} (expected ${SCHEMA_VERSION})`);
      // TODO: 必要に応じてマイグレーション処理を追加
    }

    return sortLogs(data.logs || []);
  } catch (error) {
    console.error("Failed to load logs, returning empty array:", error);
    // JSONが壊れている場合は空配列を返す（データロスを防ぐためバックアップを残す）
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_LOGS);
      if (raw) {
        // 壊れたデータをバックアップ
        const backupKey = `${STORAGE_KEY_LOGS}_backup_${Date.now()}`;
        await AsyncStorage.setItem(backupKey, raw);
        console.log(`Backed up corrupted data to ${backupKey}`);
      }
    } catch (backupError) {
      console.error("Failed to backup corrupted data:", backupError);
    }
    return [];
  }
}

/**
 * ログを保存する（堅牢化版）
 * - スキーマバージョンを含めて保存
 * - エラー時は例外をthrow
 */
export async function saveLogs(logs: GrowthLog[]): Promise<void> {
  try {
    const data: StorageData = {
      version: SCHEMA_VERSION,
      logs: logs,
    };
    await AsyncStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save logs:", error);
    throw new Error("ログの保存に失敗しました。空き容量を確認してください。");
  }
}

/**
 * ログを日付降順でソート
 */
function sortLogs(logs: GrowthLog[]): GrowthLog[] {
  return [...logs].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // 降順
  });
}

/**
 * 特定のログを更新
 */
export async function updateLog(id: string, updates: Partial<GrowthLog>): Promise<void> {
  const logs = await loadLogs();
  const index = logs.findIndex((log) => log.id === id);
  
  if (index === -1) {
    throw new Error("ログが見つかりません");
  }
  
  logs[index] = { ...logs[index], ...updates };
  await saveLogs(logs);
}

/**
 * 特定のログを削除
 */
export async function deleteLog(id: string): Promise<void> {
  const logs = await loadLogs();
  const filtered = logs.filter((log) => log.id !== id);
  await saveLogs(filtered);
}

/**
 * すべてのログを削除
 */
export async function clearAllLogs(): Promise<void> {
  await saveLogs([]);
}
