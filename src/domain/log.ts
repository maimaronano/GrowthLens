export type LogTag = "探索" | "集中" | "自己主張" | "ことば" | "睡眠" | "食事";

export type GrowthLog = {
  id: string;
  createdAt: string; // ISO
  tag: LogTag;
  note: string;
  photoLabel?: string;
};

// データスキーマのバージョン管理
export const SCHEMA_VERSION = 1;

export type StorageData = {
  version: number;
  logs: GrowthLog[];
};

export const STORAGE_KEY_LOGS = "@growthlens/logs";

export const TAGS: LogTag[] = ["探索", "集中", "自己主張", "ことば", "睡眠", "食事"];

export const STORAGE_KEY_INTRO = "@growthlens/introSeen";

// バリデーション定数
export const VALIDATION = {
  NOTE_MIN_LENGTH: 1,
  NOTE_MAX_LENGTH: 2000,
  PHOTO_LABEL_MAX_LENGTH: 100,
} as const;

// バリデーション関数
export function validateNote(note: string): { valid: boolean; error?: string } {
  const trimmed = note.trim();
  
  if (trimmed.length < VALIDATION.NOTE_MIN_LENGTH) {
    return { valid: false, error: "メモを入力してください" };
  }
  
  if (trimmed.length > VALIDATION.NOTE_MAX_LENGTH) {
    return { valid: false, error: `メモは${VALIDATION.NOTE_MAX_LENGTH}文字以内で入力してください` };
  }
  
  return { valid: true };
}

export function validatePhotoLabel(label: string): { valid: boolean; error?: string } {
  if (label.length > VALIDATION.PHOTO_LABEL_MAX_LENGTH) {
    return { valid: false, error: `写真ラベルは${VALIDATION.PHOTO_LABEL_MAX_LENGTH}文字以内で入力してください` };
  }
  
  return { valid: true };
}

// ログのバリデーション
export function validateLog(log: Partial<GrowthLog>): { valid: boolean; error?: string } {
  if (!log.note) {
    return { valid: false, error: "メモは必須です" };
  }
  
  const noteValidation = validateNote(log.note);
  if (!noteValidation.valid) {
    return noteValidation;
  }
  
  if (log.photoLabel) {
    const labelValidation = validatePhotoLabel(log.photoLabel);
    if (!labelValidation.valid) {
      return labelValidation;
    }
  }
  
  if (!log.tag || !TAGS.includes(log.tag as LogTag)) {
    return { valid: false, error: "有効なタグを選択してください" };
  }
  
  return { valid: true };
}
