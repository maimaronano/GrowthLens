// app/log-list.tsx
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BannerAdComponent } from "@/components/ads/banner-ad";

import type { GrowthLog, LogTag } from "../src/domain/log";
import { TAGS } from "../src/domain/log";
import { loadLogs } from "../src/storage/logStorage";

export default function LogListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [logs, setLogs] = useState<GrowthLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<GrowthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<LogTag | "すべて">("すべて");

  // ログを読み込む
  const reloadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadLogs();
      setLogs(data);
      filterLogs(data, selectedTag);
    } catch (e) {
      console.error("Failed to load logs:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedTag]);

  // タグで絞り込み
  const filterLogs = (allLogs: GrowthLog[], tag: LogTag | "すべて") => {
    if (tag === "すべて") {
      setFilteredLogs(allLogs);
    } else {
      setFilteredLogs(allLogs.filter((log) => log.tag === tag));
    }
  };

  // 初回読み込み
  useFocusEffect(
    useCallback(() => {
      reloadLogs();
    }, [reloadLogs])
  );

  // タグ変更時
  const onTagChange = (tag: LogTag | "すべて") => {
    setSelectedTag(tag);
    filterLogs(logs, tag);
  };

  const onLogPress = (logId: string) => {
    router.push(`/log-detail?id=${logId}`);
  };

  const renderItem = ({ item }: { item: GrowthLog }) => (
    <Pressable
      onPress={() => onLogPress(item.id)}
      style={{
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.cardSoft,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <Text style={{ color: palette.muted, fontSize: 12 }}>
          {new Date(item.createdAt).toLocaleString("ja-JP")}
        </Text>
        <Text style={{ color: palette.accentText, fontSize: 12, fontWeight: "800" }}>
          {item.tag}
        </Text>
      </View>

      {item.photoLabel ? (
        <Text style={{ color: palette.muted, marginBottom: 4 }}>📷 {item.photoLabel}</Text>
      ) : null}

      <Text style={{ color: palette.text, lineHeight: 20 }} numberOfLines={3}>
        {item.note}
      </Text>

      <Text style={{ color: palette.tint, fontSize: 12, fontWeight: "700", marginTop: 6 }}>
        タップして編集 →
      </Text>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={{ padding: 32, alignItems: "center" }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
      <Text style={{ color: palette.muted, fontSize: 16, textAlign: "center", lineHeight: 24 }}>
        {selectedTag === "すべて" 
          ? "まだ記録がありません\nホーム画面から記録を追加しましょう"
          : `「${selectedTag}」の記録がありません`}
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
            <Text style={{ fontSize: 20, fontWeight: "800", color: palette.text }}>📚 記録一覧</Text>
            <View style={{ width: 60 }} />
          </View>

          <Text style={{ fontSize: 15, color: palette.muted, lineHeight: 22 }}>
            タグで絞り込んで記録を確認できます
          </Text>

          {/* タグフィルター */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <Pressable
              onPress={() => onTagChange("すべて")}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: selectedTag === "すべて" ? palette.tint : palette.border,
                backgroundColor: selectedTag === "すべて" ? palette.accentSurface : palette.card,
              }}
            >
              <Text
                style={{
                  color: selectedTag === "すべて" ? palette.accentText : palette.text,
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                すべて
              </Text>
            </Pressable>

            {TAGS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => onTagChange(tag)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: selectedTag === tag ? palette.tint : palette.border,
                  backgroundColor: selectedTag === tag ? palette.accentSurface : palette.card,
                }}
              >
                <Text
                  style={{
                    color: selectedTag === tag ? palette.accentText : palette.text,
                    fontWeight: "700",
                    fontSize: 14,
                  }}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ fontSize: 13, color: palette.muted }}>
            {filteredLogs.length}件の記録
          </Text>

          {/* バナー広告 */}
          <BannerAdComponent />
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
