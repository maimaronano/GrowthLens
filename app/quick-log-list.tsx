// app/quick-log-list.tsx
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import type { QuickLog } from "../src/domain/quick-log";
import { formatDuration } from "../src/domain/quick-log";
import { loadQuickLogs } from "../src/storage/quickLogStorage";

export default function QuickLogListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [logs, setLogs] = useState<QuickLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<QuickLog["type"] | "all">("all");

  const reloadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadQuickLogs();
      setLogs(data);
    } catch (e) {
      console.error("Failed to load logs:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadLogs();
    }, [reloadLogs])
  );

  const filteredLogs = filterType === "all"
    ? logs
    : logs.filter(log => log.type === filterType);

  const getLogIcon = (log: QuickLog): string => {
    if (log.type === "sleep") return "😴";
    if (log.type === "diaper") return "🩲";
    if (log.type === "feeding") return "🍼";
    return "";
  };

  const getLogTitle = (log: QuickLog): string => {
    if (log.type === "sleep") return log.action;
    if (log.type === "diaper") return log.diaperType;
    if (log.type === "feeding") return log.feedingType;
    return "";
  };

  const renderItem = ({ item }: { item: QuickLog }) => (
    <View
      style={{
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.cardSoft,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: palette.text }}>
          {getLogIcon(item)} {getLogTitle(item)}
        </Text>
        <Text style={{ fontSize: 12, color: palette.muted }}>
          {new Date(item.timestamp).toLocaleString("ja-JP", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {item.type === "sleep" && item.duration && (
        <Text style={{ fontSize: 14, color: palette.accentText, fontWeight: "700" }}>
          睡眠時間: {formatDuration(item.duration)}
        </Text>
      )}

      {item.type === "feeding" && item.duration && (
        <Text style={{ fontSize: 14, color: palette.text }}>
          授乳時間: {item.duration}分
        </Text>
      )}

      {item.type === "feeding" && item.amount && (
        <Text style={{ fontSize: 14, color: palette.text }}>
          ミルク量: {item.amount}ml
        </Text>
      )}

      {item.note && (
        <Text style={{ fontSize: 14, color: palette.text, marginTop: 8 }}>
          {item.note}
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={{ padding: 32, alignItems: "center" }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>⚡</Text>
      <Text style={{ color: palette.muted, fontSize: 16, textAlign: "center", lineHeight: 24 }}>
        {filterType === "all"
          ? "まだ記録がありません\nクイック記録タブから記録しましょう"
          : "この種類の記録がありません"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={["top"]}>
      <View style={{ flex: 1 }}>
        {/* ヘッダー */}
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable onPress={() => router.back()}>
              <Text style={{ fontSize: 16, color: palette.tint, fontWeight: "700" }}>← 戻る</Text>
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: "800", color: palette.text }}>⚡ 記録一覧</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* フィルター */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              { type: "all" as const, label: "すべて", emoji: "📋" },
              { type: "sleep" as const, label: "睡眠", emoji: "😴" },
              { type: "diaper" as const, label: "おむつ", emoji: "🩲" },
              { type: "feeding" as const, label: "授乳", emoji: "🍼" },
            ].map(({ type, label, emoji }) => (
              <Pressable
                key={type}
                onPress={() => setFilterType(type)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: filterType === type ? palette.tint : palette.border,
                  backgroundColor: filterType === type ? palette.accentSurface : palette.card,
                }}
              >
                <Text
                  style={{
                    color: filterType === type ? palette.accentText : palette.text,
                    fontWeight: "700",
                    fontSize: 14,
                  }}
                >
                  {emoji} {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ fontSize: 13, color: palette.muted }}>
            {filteredLogs.length}件の記録
          </Text>
        </View>

        {/* ログ一覧 */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={palette.tint} />
            <Text style={{ marginTop: 16, color: palette.muted }}>読み込み中...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLogs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0 }}
            ListEmptyComponent={renderEmpty}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
