// app/log-detail.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import type { GrowthLog, LogTag } from "../src/domain/log";
import { TAGS, validateLog, VALIDATION } from "../src/domain/log";
import { loadLogs, updateLog, deleteLog } from "../src/storage/logStorage";

export default function LogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [log, setLog] = useState<GrowthLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 編集用の状態
  const [note, setNote] = useState("");
  const [photoLabel, setPhotoLabel] = useState("");
  const [tag, setTag] = useState<LogTag>("探索");
  const [error, setError] = useState("");

  // ログを読み込み
  useEffect(() => {
    (async () => {
      try {
        const logs = await loadLogs();
        const found = logs.find((l) => l.id === id);
        if (found) {
          setLog(found);
          setNote(found.note);
          setPhotoLabel(found.photoLabel || "");
          setTag(found.tag);
        } else {
          Alert.alert("エラー", "ログが見つかりません", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      } catch (e) {
        console.error("Failed to load log:", e);
        Alert.alert("エラー", "ログの読み込みに失敗しました", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSave = async () => {
    if (saving) return; // 連打防止

    setError("");

    const validation = validateLog({ note, photoLabel, tag });
    if (!validation.valid) {
      setError(validation.error || "入力内容を確認してください");
      return;
    }

    setSaving(true);
    try {
      await updateLog(id, {
        note: note.trim(),
        photoLabel: photoLabel.trim() || undefined,
        tag,
      });
      Alert.alert("成功", "ログを更新しました", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      console.error("Failed to update log:", e);
      setError("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert(
      "削除の確認",
      "このログを削除しますか？この操作は取り消せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLog(id);
              Alert.alert("削除しました", "", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (e) {
              console.error("Failed to delete log:", e);
              Alert.alert("エラー", "削除に失敗しました");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={palette.tint} />
          <Text style={{ marginTop: 16, color: palette.muted }}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!log) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: palette.muted }}>ログが見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cardStyle = {
    padding: 20,
    borderRadius: 24,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#00000012",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14 }}>
        {/* ヘッダー */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable onPress={() => router.back()}>
            <Text style={{ fontSize: 16, color: palette.tint, fontWeight: "700" }}>← 戻る</Text>
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: "800", color: palette.text }}>📝 ログ編集</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={{ fontSize: 13, color: palette.muted }}>
          作成日時: {new Date(log.createdAt).toLocaleString("ja-JP")}
        </Text>

        {/* エラー表示 */}
        {error ? (
          <View style={{ ...cardStyle, backgroundColor: palette.danger, borderColor: palette.dangerBorder }}>
            <Text style={{ color: palette.text, fontWeight: "700" }}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* 編集フォーム */}
        <View style={{ ...cardStyle, gap: 12 }}>
          <Text style={{ fontSize: 13, color: palette.muted }}>写真（仮ラベル・任意）</Text>
          <TextInput
            value={photoLabel}
            onChangeText={setPhotoLabel}
            placeholder="例：公園の滑り台"
            placeholderTextColor={palette.muted}
            maxLength={VALIDATION.PHOTO_LABEL_MAX_LENGTH}
            style={{
              borderWidth: 2,
              borderColor: palette.border,
              padding: 14,
              borderRadius: 16,
              backgroundColor: palette.cardSoft,
              color: palette.text,
              fontSize: 15,
            }}
          />
          <Text style={{ fontSize: 11, color: palette.muted, textAlign: "right" }}>
            {photoLabel.length}/{VALIDATION.PHOTO_LABEL_MAX_LENGTH}
          </Text>

          <Text style={{ fontSize: 13, color: palette.muted, marginTop: 8 }}>タグ</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {TAGS.map((t) => {
              const active = t === tag;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTag(t)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: active ? palette.tint : palette.border,
                    backgroundColor: active ? palette.accentSurface : palette.card,
                  }}
                >
                  <Text style={{ color: active ? palette.accentText : palette.text, fontWeight: "700", fontSize: 15 }}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={{ fontSize: 13, color: palette.muted, marginTop: 8 }}>メモ（必須）</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="例：今日は指差しが増えた"
            placeholderTextColor={palette.muted}
            maxLength={VALIDATION.NOTE_MAX_LENGTH}
            style={{
              borderWidth: 2,
              borderColor: palette.border,
              padding: 14,
              borderRadius: 16,
              backgroundColor: palette.cardSoft,
              color: palette.text,
              fontSize: 15,
              minHeight: 100,
            }}
            multiline
            textAlignVertical="top"
          />
          <Text style={{ fontSize: 11, color: palette.muted, textAlign: "right" }}>
            {note.length}/{VALIDATION.NOTE_MAX_LENGTH}
          </Text>
        </View>

        {/* アクションボタン */}
        <Pressable
          onPress={onSave}
          disabled={saving}
          style={{
            backgroundColor: saving ? palette.border : palette.tint,
            padding: 16,
            borderRadius: 20,
            alignItems: "center",
            shadowColor: "#00000020",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ fontSize: 16, color: "#FFFFFF", fontWeight: "800" }}>💾 保存する</Text>
          )}
        </Pressable>

        <Pressable
          onPress={onDelete}
          disabled={saving}
          style={{
            backgroundColor: "#FFCCCB",
            padding: 14,
            borderRadius: 20,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#FFB3B3",
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text style={{ color: palette.text, fontWeight: "800" }}>🗑️ 削除</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
