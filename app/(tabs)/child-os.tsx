// app/(tabs)/child-os.tsx
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { GrowthLog } from "../../src/domain/log";
import { loadLogs } from "../../src/storage/logStorage";

type Status = "上昇傾向" | "安定" | "揺らぎあり";

type ModuleView = {
  key: string;
  name: string;
  status: Status;
  hint: string;
};

const DAY = 86400000;

function inLastDays(log: GrowthLog, days: number, now = Date.now()) {
  const t = new Date(log.createdAt).getTime();
  return now - t <= days * DAY;
}

function inRangeDays(log: GrowthLog, fromDays: number, toDays: number, now = Date.now()) {
  // toDays < diff <= fromDays
  const t = new Date(log.createdAt).getTime();
  const diff = now - t;
  return diff > toDays * DAY && diff <= fromDays * DAY;
}

function countByTag(logs: GrowthLog[]) {
  const m: Record<string, number> = {};
  for (const l of logs) m[l.tag] = (m[l.tag] ?? 0) + 1;
  return m;
}

function statusFromDelta(delta: number): Status {
  if (delta >= 2) return "上昇傾向";
  if (delta <= -2) return "揺らぎあり";
  return "安定";
}

function avgNoteLen(logs: GrowthLog[]) {
  if (logs.length === 0) return 0;
  const sum = logs.reduce((a, b) => a + (b.note?.length ?? 0), 0);
  return Math.round(sum / logs.length);
}

function buildChildOS(logs: GrowthLog[]): ModuleView[] {
  const now = Date.now();

  // 直近7日 と その前7日（8〜14日前）
  const recent = logs.filter((l) => inLastDays(l, 7, now));
  const prev = logs.filter((l) => inRangeDays(l, 14, 7, now));

  const rc = countByTag(recent);
  const pc = countByTag(prev);

  const delta = (tag: string) => (rc[tag] ?? 0) - (pc[tag] ?? 0);

  const cognition = delta("探索") + delta("集中");
  const comm = delta("ことば");
  const emotion = delta("自己主張");
  const rhythm = delta("睡眠") + delta("食事");
  const focus = delta("集中");

  const noteDelta = avgNoteLen(recent) - avgNoteLen(prev);
  const metaDelta = noteDelta >= 20 ? 2 : noteDelta <= -20 ? -2 : 0;

  return [
    {
      key: "cog",
      name: "🧠 認知（探索・理解）",
      status: statusFromDelta(cognition),
      hint:
        cognition >= 2
          ? "探索/集中の観測が増えています"
          : cognition <= -2
          ? "探索/集中の観測が少なめです"
          : "最近は安定しています",
    },
    {
      key: "comm",
      name: "💬 コミュニケーション",
      status: statusFromDelta(comm),
      hint: comm >= 2 ? "「ことば」の記録が増加" : comm <= -2 ? "「ことば」が少なめ" : "安定",
    },
    {
      key: "emo",
      name: "❤️ 感情・自己主張",
      status: statusFromDelta(emotion),
      hint: emotion >= 2 ? "自己主張の変化が目立ちます" : emotion <= -2 ? "自己主張が少なめ" : "安定",
    },
    {
      key: "rhythm",
      name: "🌙 生活リズム（睡眠・食事）",
      status: statusFromDelta(rhythm),
      hint: rhythm >= 2 ? "生活系の観測が増加" : rhythm <= -2 ? "生活系が少なめ" : "安定",
    },
    {
      key: "focus",
      name: "🎯 集中・切替",
      status: statusFromDelta(focus),
      hint: focus >= 2 ? "集中の場面が増加" : focus <= -2 ? "集中が少なめ" : "安定",
    },
    {
      key: "meta",
      name: "👀 観測の粒度（親の気づき）",
      status: statusFromDelta(metaDelta),
      hint:
        noteDelta >= 20
          ? "最近メモが長くなっています（気づき↑）"
          : noteDelta <= -20
          ? "最近メモが短めです"
          : "安定",
    },
  ];
}

export default function ChildOSScreen() {
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

  // 初回読み込み
  useEffect(() => {
    reload();
  }, [reload]);

  // タブを開くたびに再読み込み（Homeで追加した内容が反映される）
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const modules = useMemo(() => buildChildOS(logs), [logs]);

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
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
      <Text style={{ fontSize: 28, fontWeight: "800", color: palette.text, letterSpacing: 0.5 }}>✨ Child OS</Text>
      <Text style={{ fontSize: 15, color: palette.muted, lineHeight: 22 }}>
        ホームの記録から自動生成（直近7日 vs 前7日）
      </Text>

      <View style={{ ...cardStyle, backgroundColor: palette.accentSurface }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: palette.accentText }}>📊 ログ件数</Text>
        <Text style={{ marginTop: 6, color: palette.text, fontSize: 18, fontWeight: "700" }}>
          {loaded ? `${logs.length} 件` : "読み込み中..."}
        </Text>
        <Text style={{ marginTop: 6, color: palette.muted, fontSize: 12, lineHeight: 18 }}>
          ホームで記録を追加してこのタブを開くと、状態が更新されます
        </Text>
      </View>

      {modules.map((m) => (
        <View key={m.key} style={cardStyle}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: palette.text }}>{m.name}</Text>
          <Text style={{ marginTop: 8, fontSize: 18, fontWeight: "800", color: palette.accentText }}>{m.status}</Text>
          <Text style={{ marginTop: 6, color: palette.text, lineHeight: 20 }}>{m.hint}</Text>
        </View>
      ))}

      <Text style={{ color: palette.muted, marginTop: 4, fontSize: 12, lineHeight: 18 }}>
        ※ MVPはルールベース。後で重み付け/AI要約に進化できます。
      </Text>
    </ScrollView>
    </SafeAreaView>
  );
}
