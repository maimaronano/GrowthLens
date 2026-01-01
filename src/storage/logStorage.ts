import AsyncStorage from "@react-native-async-storage/async-storage";
import { GrowthLog, STORAGE_KEY_LOGS } from "../domain/log";

export async function loadLogs(): Promise<GrowthLog[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_LOGS);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as GrowthLog[];
  parsed.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return parsed;
}

export async function saveLogs(logs: GrowthLog[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
}
