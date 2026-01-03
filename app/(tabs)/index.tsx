// app/(tabs)/index.tsx
// クイック記録画面 - ワンタップで睡眠、おむつ、授乳を記録
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import type { QuickLog, SleepLog, DiaperLog, FeedingLog, ActiveSleep } from "../../src/domain/quick-log";
import { generateQuickLogId, calculateDuration, formatDuration, calculateInterval } from "../../src/domain/quick-log";
import {
  loadQuickLogs,
  addQuickLog,
  saveActiveSleep,
  loadActiveSleep,
  getTodayLogs,
} from "../../src/storage/quickLogStorage";

export default function QuickRecordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [activeSleep, setActiveSleep] = useState<ActiveSleep | null>(null);
  const [sleepDuration, setSleepDuration] = useState<string>("0分");
  const [recentLogs, setRecentLogs] = useState<QuickLog[]>([]);
  const [feedingInterval, setFeedingInterval] = useState<string | null>(null);
  const [diaperInterval, setDiaperInterval] = useState<string | null>(null);

  // データを読み込む
  const loadData = useCallback(async () => {
    try {
      const [active, logs] = await Promise.all([
        loadActiveSleep(),
        getTodayLogs(),
      ]);

      setActiveSleep(active);
      setRecentLogs(logs);

      // 授乳とおむつの前回からの間隔を計算
      const allLogs = await loadQuickLogs();
      const feedingLogs = allLogs.filter(log => log.type === "feeding");
      const diaperLogs = allLogs.filter(log => log.type === "diaper");

      if (feedingLogs.length > 0) {
        const lastFeeding = new Date(feedingLogs[0].timestamp).getTime();
        const interval = Date.now() - lastFeeding;
        setFeedingInterval(formatDuration(interval));
      }

      if (diaperLogs.length > 0) {
        const lastDiaper = new Date(diaperLogs[0].timestamp).getTime();
        const interval = Date.now() - lastDiaper;
        setDiaperInterval(formatDuration(interval));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    loadData();
  }, [loadData]);

  // タブにフォーカスしたら再読み込み
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // 睡眠中の経過時間を更新
  useEffect(() => {
    if (!activeSleep) {
      setSleepDuration("0分");
      return;
    }

    const updateDuration = () => {
      const duration = calculateDuration(activeSleep.startTime);
      setSleepDuration(formatDuration(duration));
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, [activeSleep]);

  // 触覚フィードバック
  const hapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // 睡眠記録
  const onSleepAction = async (action: "寝た" | "起きた") => {
    hapticFeedback();

    try {
      if (action === "寝た") {
        const newSleep: ActiveSleep = {
          id: generateQuickLogId(),
          startTime: new Date().toISOString(),
        };
        await saveActiveSleep(newSleep);
        setActiveSleep(newSleep);

        const log: SleepLog = {
          id: newSleep.id,
          type: "sleep",
          action: "寝た",
          timestamp: newSleep.startTime,
        };
        await addQuickLog(log);
      } else {
        if (!activeSleep) {
          Alert.alert("エラー", "進行中の睡眠がありません");
          return;
        }

        const endTime = new Date().toISOString();
        const duration = calculateDuration(activeSleep.startTime, endTime);

        const log: SleepLog = {
          id: generateQuickLogId(),
          type: "sleep",
          action: "起きた",
          timestamp: endTime,
          duration,
        };
        await addQuickLog(log);
        await saveActiveSleep(null);
        setActiveSleep(null);
      }

      await loadData();
    } catch (error) {
      console.error("Failed to save sleep log:", error);
      Alert.alert("エラー", "記録の保存に失敗しました");
    }
  };

  // おむつ記録
  const onDiaperRecord = async (diaperType: "おしっこ" | "うんち" | "両方") => {
    hapticFeedback();

    try {
      const log: DiaperLog = {
        id: generateQuickLogId(),
        type: "diaper",
        diaperType,
        timestamp: new Date().toISOString(),
      };
      await addQuickLog(log);
      await loadData();
    } catch (error) {
      console.error("Failed to save diaper log:", error);
      Alert.alert("エラー", "記録の保存に失敗しました");
    }
  };

  // 授乳記録
  const onFeedingRecord = async (feedingType: "左" | "右" | "ミルク") => {
    hapticFeedback();

    try {
      const log: FeedingLog = {
        id: generateQuickLogId(),
        type: "feeding",
        feedingType,
        timestamp: new Date().toISOString(),
      };
      await addQuickLog(log);
      await loadData();
    } catch (error) {
      console.error("Failed to save feeding log:", error);
      Alert.alert("エラー", "記録の保存に失敗しました");
    }
  };

  const buttonStyle = (isActive = false) => ({
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: isActive ? palette.tint : palette.border,
    backgroundColor: isActive ? palette.accentSurface : palette.card,
    shadowColor: "#00000015",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: "center" as const,
  });

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
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: palette.text, letterSpacing: 0.5 }}>
          ⚡ クイック記録
        </Text>
        <Text style={{ fontSize: 15, color: palette.muted, lineHeight: 22 }}>
          ワンタップで記録。詳細は後から追加できます
        </Text>

        {/* 睡眠記録 */}
        <View style={{ ...cardStyle, gap: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: palette.text }}>😴 睡眠</Text>
          
          {activeSleep && (
            <View style={{ padding: 12, backgroundColor: palette.accentSurface, borderRadius: 12 }}>
              <Text style={{ fontSize: 14, color: palette.accentText, fontWeight: "700" }}>
                💤 睡眠中： {sleepDuration}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={() => onSleepAction("寝た")}
              disabled={!!activeSleep}
              style={{ flex: 1, ...buttonStyle(!activeSleep) }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: activeSleep ? palette.muted : palette.text }}>
                😴 寝た
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onSleepAction("起きた")}
              disabled={!activeSleep}
              style={{ flex: 1, ...buttonStyle(!!activeSleep) }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: !activeSleep ? palette.muted : palette.text }}>
                😊 起きた
              </Text>
            </Pressable>
          </View>
        </View>

        {/* おむつ記録 */}
        <View style={{ ...cardStyle, gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: palette.text }}>🩲 おむつ</Text>
            {diaperInterval && (
              <Text style={{ fontSize: 12, color: palette.muted }}>前回から {diaperInterval}</Text>
            )}
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={() => onDiaperRecord("おしっこ")}
              style={{ flex: 1, ...buttonStyle() }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: palette.text }}>💧</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: palette.text, marginTop: 4 }}>
                おしっこ
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onDiaperRecord("うんち")}
              style={{ flex: 1, ...buttonStyle() }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: palette.text }}>💩</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: palette.text, marginTop: 4 }}>
                うんち
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onDiaperRecord("両方")}
              style={{ flex: 1, ...buttonStyle() }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: palette.text }}>💧💩</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: palette.text, marginTop: 4 }}>
                両方
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 授乳記録 */}
        <View style={{ ...cardStyle, gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: palette.text }}>🍼 授乳</Text>
            {feedingInterval && (
              <Text style={{ fontSize: 12, color: palette.muted }}>前回から {feedingInterval}</Text>
            )}
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={() => onFeedingRecord("左")}
              style={{ flex: 1, ...buttonStyle() }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: palette.text }}>👈</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: palette.text, marginTop: 4 }}>
                左
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onFeedingRecord("右")}
              style={{ flex: 1, ...buttonStyle() }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: palette.text }}>👉</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: palette.text, marginTop: 4 }}>
                右
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onFeedingRecord("ミルク")}
              style={{ flex: 1, ...buttonStyle() }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: palette.text }}>🍼</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: palette.text, marginTop: 4 }}>
                ミルク
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 今日の記録 */}
        <View style={{ ...cardStyle, gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: palette.text }}>
              📋 今日の記録 ({recentLogs.length}件)
            </Text>
            <Pressable onPress={() => router.push("/quick-log-list")}>
              <Text style={{ color: palette.tint, fontSize: 14, fontWeight: "700" }}>すべて表示 →</Text>
            </Pressable>
          </View>

          {recentLogs.length === 0 ? (
            <Text style={{ color: palette.muted, textAlign: "center", paddingVertical: 16 }}>
              まだ記録がありません
            </Text>
          ) : (
            recentLogs.slice(0, 5).map((log) => (
              <View
                key={log.id}
                style={{
                  padding: 12,
                  backgroundColor: palette.cardSoft,
                  borderRadius: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: palette.text }}>
                    {log.type === "sleep" && `😴 ${log.action}`}
                    {log.type === "diaper" && `🩲 ${log.diaperType}`}
                    {log.type === "feeding" && `🍼 ${log.feedingType}`}
                  </Text>
                  <Text style={{ fontSize: 12, color: palette.muted, marginTop: 2 }}>
                    {new Date(log.timestamp).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                {log.type === "sleep" && log.duration && (
                  <Text style={{ fontSize: 12, color: palette.accentText, fontWeight: "700" }}>
                    {formatDuration(log.duration)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
