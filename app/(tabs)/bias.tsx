// app/(tabs)/bias.tsx
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { GrowthLog, LogTag } from "../../src/domain/log";
import { TAGS } from "../../src/domain/log";
import { loadLogs } from "../../src/storage/logStorage";

const DAY = 86400000;

// ---- utility ----
function inLastDays(log: GrowthLog, days: number, now = Date.now()) {
  const t = new Date(log.createdAt).getTime();
  return now - t <= days * DAY;
}

function inRangeDays(log: GrowthLog, fromDays: number, toDays: number, now = Date.now()) {
  const t = new Date(log.createdAt).getTime();
  const diff = now - t;
  return diff > toDays * DAY && diff <= fromDays * DAY;
}

function countByTag(logs: GrowthLog[]) {
  const m: Record<LogTag, number> = {} as Record<LogTag, number>;
  for (const t of TAGS) m[t] = 0;
  for (const l of logs) m[l.tag]++;
  return m;
}

function avgNoteLen(logs: GrowthLog[]) {
  if (logs.length === 0) return 0;
  return Math.round(logs.reduce((a, b) => a + (b.note?.length ?? 0), 0) / logs.length);
}

// ---- Bias calculation ----
function buildBias(logs: GrowthLog[]) {
  const now = Date.now();

  const recent = logs.filter((l) => inLastDays(l, 7, now));
  const prev = logs.filter((l) => inRangeDays(l, 14, 7, now));

  // 記録頻度
  let frequency: string;
  if (recent.length === 0) frequency = "記録がほとんどありません";
  else if (recent.length <= 2) frequency = "少なめ";
  else if (recent.length <= 5) frequency = "2〜3日に1回（安定）";
  else frequency = "かなり頻繁";

  // 観測の偏り
  const counts = countByTag(recent);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topTag = sorted[0][1] > 0 ? sorted[0][0] : null;

  const bias =
    topTag != null
      ? `「${topTag}」の記録が多め`
      : "まだ傾向は見えていません";

  // メモの粒度
  const noteDelta = avgNoteLen(recent) - avgNoteLen(prev);
  let granularity: string;
  if (noteDelta >= 20) granularity = "最近、メモが詳しくなっています（気づき↑）";
  else if (noteDelta <= -20) granularity = "最近、メモが短めです";
  else granularity = "安定しています";

  // 総評（1文）
  let summary: string;
  if (recent.length === 0) {
    summary = "まずは1つ、気づいたことを記録してみましょう。";
  } else if (topTag && recent.length >= 3) {
    summary = `最近は「${topTag}」に注目して観察できています。`;
  } else {
    summary = "無理のないペースで、観察を続けられています。";
  }

  return { frequency, bias, granularity, summary };
}

// ---- screen ----
export default function BiasScreen() {
  const [logs, setLogs] = useState<GrowthLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const reload = useCallback(() => {
    (async () => {
      try {
        const data = await loadLogs();
        setLogs(data);
      } catch (e) {
        console.warn("Failed to load logs:", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const result = useMemo(() => buildBias(logs), [logs]);

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
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <Text style={{ fontSize: 28, fontWeight: "800", color: palette.text, letterSpacing: 0.5 }}>🔍 Bias Check</Text>
      <Text style={{ fontSize: 15, color: palette.muted, lineHeight: 22 }}>
        観測の傾向をやさしくフィードバックします
      </Text>

      {!loaded ? (
        <Text style={{ color: palette.muted }}>読み込み中...</Text>
      ) : (
        <>
          <View style={cardStyle}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: palette.text }}>📅 記録の頻度</Text>
            <Text style={{ marginTop: 8, color: palette.text, lineHeight: 20 }}>{result.frequency}</Text>
          </View>

          <View style={cardStyle}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: palette.text }}>🎯 観測の偏り</Text>
            <Text style={{ marginTop: 8, color: palette.text, lineHeight: 20 }}>{result.bias}</Text>
          </View>

          <View style={cardStyle}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: palette.text }}>📝 メモの粒度</Text>
            <Text style={{ marginTop: 8, color: palette.text, lineHeight: 20 }}>{result.granularity}</Text>
          </View>

          <View
            style={{
              ...cardStyle,
              backgroundColor: palette.accentSurface,
              marginTop: 6,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800", color: palette.accentText }}>💡 総評</Text>
            <Text style={{ marginTop: 8, color: palette.text, lineHeight: 22 }}>{result.summary}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}
