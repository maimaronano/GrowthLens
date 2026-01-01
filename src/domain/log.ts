export type LogTag = "探索" | "集中" | "自己主張" | "ことば" | "睡眠" | "食事";

export type GrowthLog = {
  id: string;
  createdAt: string; // ISO
  tag: LogTag;
  note: string;
  photoLabel?: string;
};

export const STORAGE_KEY_LOGS = "@growthlens/logs";

export const TAGS: LogTag[] = ["探索", "集中", "自己主張", "ことば", "睡眠", "食事"];

export const STORAGE_KEY_INTRO = "@growthlens/introSeen";
