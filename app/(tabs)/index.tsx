// app/(tabs)/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import type { GrowthLog, LogTag } from "../../src/domain/log";
import { STORAGE_KEY_INTRO, TAGS } from "../../src/domain/log";
import { loadLogs, saveLogs } from "../../src/storage/logStorage";

// ---- UI: Tag selector (button chips) ----
function TagSelector({
  value,
  onChange,
  palette,
}: {
  value: LogTag;
  onChange: (t: LogTag) => void;
  palette: (typeof Colors)["light"];
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {TAGS.map((t) => {
        const active = t === value;
        return (
          <Pressable
            key={t}
            onPress={() => onChange(t)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: active ? palette.tint : palette.border,
              backgroundColor: active ? palette.accentSurface : palette.card,
              shadowColor: "#00000015",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
            }}
          >
            <Text style={{ color: active ? palette.accentText : palette.text, fontWeight: "700", fontSize: 15 }}>
              {t}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---- Simple signal (MVP) ----
function makeSimpleSignal(logs: GrowthLog[]) {
  if (logs.length < 2) return "記録が増えるとシグナルが出ます";
  const [latest, prev] = logs;
  if (latest.tag !== prev.tag) return `焦点が「${prev.tag} → ${latest.tag}」に変化`;
  if ((latest.note?.length ?? 0) > (prev.note?.length ?? 0) + 20)
    return "観測メモが詳細になっています（気づき↑）";
  return `「${latest.tag}」が継続しています（安定）`;
}

// React Native では crypto.randomUUID が無いことがあるので自前ID
function newId() {
  return `id-${Date.now()}-${Math.random()}`;
}

export default function HomeScreen() {
  const [note, setNote] = useState("");
  const [photoLabel, setPhotoLabel] = useState("");
  const [tag, setTag] = useState<LogTag>("探索");
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [logs, setLogs] = useState<GrowthLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回起動説明カード
  const [showIntro, setShowIntro] = useState(false);

  // 起動時：端末から読み込み（logs + introSeen）
  useEffect(() => {
    (async () => {
      try {
        const data = await loadLogs();
        setLogs(data);

        const introSeen = await AsyncStorage.getItem(STORAGE_KEY_INTRO);
        if (!introSeen) setShowIntro(true);
      } catch (e) {
        console.warn("Failed to load logs:", e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // logs が変わるたび保存（読み込み完了後のみ）
  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      try {
        await saveLogs(logs);
      } catch (e) {
        console.warn("Failed to save logs:", e);
      }
    })();
  }, [logs, isLoaded]);

  const signal = useMemo(() => makeSimpleSignal(logs), [logs]);

  const onCloseIntro = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_INTRO, "true");
    } finally {
      setShowIntro(false);
    }
  };

  const onAdd = () => {
    const trimmed = note.trim();
    if (!trimmed) return;

    const newLog: GrowthLog = {
      id: newId(),
      createdAt: new Date().toISOString(),
      tag,
      note: trimmed,
      photoLabel: photoLabel.trim() || undefined,
    };

    setLogs([newLog, ...logs]);

    // 入力リセット
    setNote("");
    setPhotoLabel("");
    setTag("探索");
  };

  const onDeleteOne = (id: string) => {
    setLogs(logs.filter((l) => l.id !== id));
  };

  const onClearAll = () => {
    if (logs.length === 0) return;

    Alert.alert(
      "すべて削除しますか？",
      "この操作は取り消せません。端末内の記録がすべて削除されます。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "すべて削除",
          style: "destructive",
          onPress: () => {
            setLogs([]); // 保存は useEffect(saveLogs) が担当
          },
        },
      ]
    );
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: palette.text }}>読み込み中...</Text>
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 14 }}
      >
      {/* 初回起動の説明カード */}
      {showIntro && (
        <View
          style={{
            ...cardStyle,
            gap: 12,
            backgroundColor: palette.cardSoft,
            borderColor: palette.border,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "800", color: palette.text }}>👶 GrowthLens へようこそ</Text>

          <Text style={{ color: palette.muted, lineHeight: 22 }}>
            このアプリは、子どもの「できた・できない」ではなく、
            日々のちょっとした変化や気づきを記録するためのものです。
          </Text>

          <Text style={{ color: palette.muted, lineHeight: 22 }}>
            ・記録は端末内にのみ保存されます{"\n"}
            ・診断や評価は行いません{"\n"}
            ・比較や共有はありません
          </Text>

          <Pressable
            onPress={onCloseIntro}
            style={{
              backgroundColor: palette.tint,
              paddingVertical: 14,
              borderRadius: 20,
              alignItems: "center",
              shadowColor: "#00000020",
              shadowOpacity: 0.12,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text style={{ fontSize: 16, color: "#FFFFFF", fontWeight: "800" }}>はじめる</Text>
          </Pressable>
        </View>
      )}

      <Text style={{ fontSize: 28, fontWeight: "800", color: palette.text, letterSpacing: 0.5 }}>
        🏠 ホーム
      </Text>
      <Text style={{ fontSize: 15, color: palette.muted, lineHeight: 22 }}>
        赤ちゃんの成長の瞬間を記録しましょう
      </Text>

      <View
        style={{
          ...cardStyle,
          backgroundColor: palette.accentSurface,
          borderColor: palette.border,
          gap: 6,
        }}
      >
        <Text style={{ fontWeight: "800", color: palette.accentText }}>✨ 成長シグナル（簡易）</Text>
        <Text style={{ marginTop: 6, color: palette.text, lineHeight: 22 }}>{signal}</Text>
      </View>

      <View style={{ ...cardStyle, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: palette.text }}>✏️ 今日の記録</Text>

        <Text style={{ fontSize: 13, color: palette.muted }}>写真（仮ラベル・任意）</Text>
        <TextInput
          value={photoLabel}
          onChangeText={setPhotoLabel}
          placeholder="例：公園の滑り台"
          placeholderTextColor={palette.muted}
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

        <Text style={{ fontSize: 13, color: palette.muted }}>タグ</Text>
        <TagSelector value={tag} onChange={setTag} palette={palette} />

        <Text style={{ fontSize: 13, color: palette.muted }}>一言メモ（必須）</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="例：今日は指差しが増えた"
          placeholderTextColor={palette.muted}
          style={{
            borderWidth: 2,
            borderColor: palette.border,
            padding: 14,
            borderRadius: 16,
            backgroundColor: palette.cardSoft,
            color: palette.text,
            fontSize: 15,
          }}
          multiline
        />

        <Pressable
          onPress={onAdd}
          style={{
            backgroundColor: palette.tint,
            padding: 16,
            borderRadius: 20,
            alignItems: "center",
            shadowColor: "#00000020",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text style={{ fontSize: 16, color: "#FFFFFF", fontWeight: "800" }}>📝 記録する</Text>
        </Pressable>

        {/* 危険操作：全削除（赤） */}
        <Pressable
          onPress={onClearAll}
          disabled={logs.length === 0}
          style={{
            backgroundColor: logs.length === 0 ? palette.danger : "#FFCCCB",
            padding: 14,
            borderRadius: 20,
            alignItems: "center",
            borderWidth: 1,
            borderColor: logs.length === 0 ? palette.dangerBorder : "#FFB3B3",
            opacity: logs.length === 0 ? 0.6 : 1,
          }}
        >
          <Text style={{ color: palette.text, fontWeight: "800" }}>すべて削除</Text>
        </Pressable>
      </View>

      <View style={{ ...cardStyle, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: palette.text }}>
          📚 記録一覧 {" "}
          <Text style={{ color: palette.muted, fontSize: 14 }}>({logs.length}件)</Text>
        </Text>

        {logs.length === 0 ? (
          <Text style={{ color: palette.muted, lineHeight: 22 }}>まだ記録がありません</Text>
        ) : (
          logs.map((l) => (
            <View
              key={l.id}
              style={{
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: palette.border,
                gap: 6,
                backgroundColor: palette.cardSoft,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                <Text style={{ color: palette.muted, fontSize: 12 }}>
                  {new Date(l.createdAt).toLocaleString()}
                </Text>
                <Text style={{ color: palette.accentText, fontSize: 12, fontWeight: "800" }}>
                  {l.tag}
                </Text>
              </View>

              {l.photoLabel ? <Text style={{ color: palette.muted }}>📷 {l.photoLabel}</Text> : null}

              <Text style={{ color: palette.text, lineHeight: 20 }}>{l.note}</Text>

              <Pressable
                onPress={() => onDeleteOne(l.id)}
                style={{
                  marginTop: 4,
                  alignSelf: "flex-end",
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  backgroundColor: palette.card,
                  borderWidth: 1,
                  borderColor: palette.border,
                }}
              >
                <Text style={{ color: palette.text, fontWeight: "700" }}>削除</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <Text style={{ color: palette.muted, fontSize: 12, lineHeight: 18 }}>
        ※ MVP：写真はまだ保存しません（ラベルのみ）。後でカメラ/ギャラリー対応できます。
      </Text>
    </ScrollView>
    </SafeAreaView>
  );
}
