import React from "react";
import { View } from "react-native";
import { Text } from "react-native-gesture-handler";
import { styles } from "./styles";
import { Theme } from "./TaskTab";

interface AnalyticsStats {
  weekCompleted: number;
  monthCompleted: number;
  weekPercent: number;
  monthPercent: number;
  currentStreak: number;
  weekTotal: number;
  monthTotal: number;
  customCompleted?: number;
  customPercent?: number;
  customTotal?: number;
}

interface AnalyticsViewProps {
  theme: Theme;
  stats: AnalyticsStats;
  selectedView: "weekly" | "monthly" | "custom";
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  theme,
  stats,
  selectedView,
}) => {
  const completed =
    selectedView === "weekly"
      ? stats.weekCompleted
      : selectedView === "monthly"
      ? stats.monthCompleted
      : stats.customCompleted ?? 0;
  const percent =
    selectedView === "weekly"
      ? stats.weekPercent
      : selectedView === "monthly"
      ? stats.monthPercent
      : stats.customPercent ?? 0;
  const total =
    selectedView === "weekly"
      ? stats.weekTotal
      : selectedView === "monthly"
      ? stats.monthTotal
      : stats.customTotal ?? 0;
  const labelPrefix =
    selectedView === "custom" ? "Custom Range" : selectedView === "weekly" ? "Weekly" : "Monthly";

  return (
    <>
      <View style={styles.statsGrid}>
        {[
          { label: `${labelPrefix} Tasks Completed`, value: completed },
          { label: `${labelPrefix} Completion Rate`, value: `${percent}%` },
          { label: "Day Streak", value: stats.currentStreak },
          { label: `${labelPrefix} Total Tasks`, value: total },
        ].map((item, idx) => (
          <View key={idx} style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Overall Progress</Text>
        <View style={[styles.progressBar, { backgroundColor: theme.emptyCell }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percent}%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.subText }]}>
          {completed} of {total} tasks completed
        </Text>
      </View>
    </>
  );
};