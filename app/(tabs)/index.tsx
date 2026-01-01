// app/(tabs)/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import type { GrowthLog, LogTag } from "../../src/domain/log";
import { STORAGE_KEY_INTRO, TAGS } from "../../src/domain/log";
import { loadLogs, saveLogs } from "../../src/storage/logStorage";

// ---- UI: Tag selector (button chips) ----
function TagSelector({
  value,
  onChange,
}: {
  value: LogTag;
  onChange: (t: LogTag) => void;
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
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? "#2563eb" : "#e2e8f0",
              backgroundColor: active ? "#2563eb" : "#fff",
            }}
          >
            <Text style={{ color: active ? "#fff" : "#0f172a", fontWeight: "700" }}>
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
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "700" }}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      {/* 初回起動の説明カード */}
      {showIntro && (
        <View
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: "#eff6ff",
            gap: 10,
            borderWidth: 1,
            borderColor: "#bfdbfe",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800" }}>GrowthLens へようこそ</Text>

          <Text style={{ color: "#1e3a8a" }}>
            このアプリは、子どもの「できた・できない」ではなく、
            日々のちょっとした変化や気づきを記録するためのものです。
          </Text>

          <Text style={{ color: "#1e3a8a" }}>
            ・記録は端末内にのみ保存されます{"\n"}
            ・診断や評価は行いません{"\n"}
            ・比較や共有はありません
          </Text>

          <Pressable
            onPress={onCloseIntro}
            style={{
              backgroundColor: "#2563eb",
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>はじめる</Text>
          </Pressable>
        </View>
      )}

      <Text style={{ fontSize: 22, fontWeight: "800" }}>Home（Growth Signal）</Text>
      <Text style={{ color: "#64748b" }}>タグ＋一言で記録。端末内に保存されます（MVP）</Text>

      <View style={{ padding: 12, borderRadius: 12, backgroundColor: "#f1f5f9" }}>
        <Text style={{ fontWeight: "800" }}>成長シグナル（簡易）</Text>
        <Text style={{ marginTop: 6, color: "#475569" }}>{signal}</Text>
      </View>

      <View style={{ padding: 12, borderRadius: 12, backgroundColor: "white", gap: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "800" }}>今日の記録</Text>

        <Text style={{ fontSize: 12, color: "#334155" }}>写真（仮ラベル・任意）</Text>
        <TextInput
          value={photoLabel}
          onChangeText={setPhotoLabel}
          placeholder="例：公園の滑り台"
          style={{ borderWidth: 1, borderColor: "#e2e8f0", padding: 12, borderRadius: 12 }}
        />

        <Text style={{ fontSize: 12, color: "#334155" }}>タグ</Text>
        <TagSelector value={tag} onChange={setTag} />

        <Text style={{ fontSize: 12, color: "#334155" }}>一言メモ（必須）</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="例：今日は指差しが増えた"
          style={{ borderWidth: 1, borderColor: "#e2e8f0", padding: 12, borderRadius: 12 }}
          multiline
        />

        <Pressable
          onPress={onAdd}
          style={{
            backgroundColor: "#2563eb",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "800" }}>記録する</Text>
        </Pressable>

        {/* 危険操作：全削除（赤） */}
        <Pressable
          onPress={onClearAll}
          disabled={logs.length === 0}
          style={{
            backgroundColor: logs.length === 0 ? "#fecaca" : "#dc2626",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: logs.length === 0 ? "#fca5a5" : "#b91c1c",
            opacity: logs.length === 0 ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "white", fontWeight: "800" }}>すべて削除</Text>
        </Pressable>
      </View>

      <View style={{ padding: 12, borderRadius: 12, backgroundColor: "white", gap: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "800" }}>
          記録一覧（最新が上）{" "}
          <Text style={{ color: "#64748b", fontSize: 12 }}>({logs.length}件)</Text>
        </Text>

        {logs.length === 0 ? (
          <Text style={{ color: "#64748b" }}>まだ記録がありません</Text>
        ) : (
          logs.map((l) => (
            <View
              key={l.id}
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e2e8f0",
                gap: 6,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                <Text style={{ color: "#64748b", fontSize: 12 }}>
                  {new Date(l.createdAt).toLocaleString()}
                </Text>
                <Text style={{ color: "#2563eb", fontSize: 12, fontWeight: "800" }}>{l.tag}</Text>
              </View>

              {l.photoLabel ? <Text style={{ color: "#64748b" }}>📷 {l.photoLabel}</Text> : null}

              <Text>{l.note}</Text>

              <Pressable
                onPress={() => onDeleteOne(l.id)}
                style={{
                  marginTop: 4,
                  alignSelf: "flex-end",
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: "#f1f5f9",
                }}
              >
                <Text style={{ color: "#0f172a", fontWeight: "700" }}>削除</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <Text style={{ color: "#94a3b8", fontSize: 12 }}>
        ※ MVP：写真はまだ保存しません（ラベルのみ）。後でカメラ/ギャラリー対応できます。
      </Text>
    </ScrollView>
  );
}
