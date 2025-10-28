
import { View } from "react-native";
import { Theme } from "./TaskTab";
import { Text } from "react-native-gesture-handler";
import { styles } from "./styles";
interface AnalyticsStats {
  weekCompleted: number;
  monthCompleted: number;
  weekPercent: number;
  monthPercent: number;
  currentStreak: number;
  weekTotal: number;
  monthTotal: number;
}

interface AnalyticsViewProps {
  theme: Theme;
  stats: AnalyticsStats;
  selectedView: 'weekly' | 'monthly';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  theme,
  stats,
  selectedView,
}) => (
  <>
    <View style={styles.statsGrid}>
      {[
        { label: 'Tasks Completed', value: selectedView === 'weekly' ? stats.weekCompleted : stats.monthCompleted },
        { label: 'Completion Rate', value: `${selectedView === 'weekly' ? stats.weekPercent : stats.monthPercent}%` },
        { label: 'Day Streak', value: stats.currentStreak },
        { label: 'Total Tasks', value: selectedView === 'weekly' ? stats.weekTotal : stats.monthTotal },
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
              width: `${selectedView === 'weekly' ? stats.weekPercent : stats.monthPercent}%`,
              backgroundColor: theme.primary,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: theme.subText }]}>
        {selectedView === 'weekly' ? stats.weekCompleted : stats.monthCompleted} of{' '}
        {selectedView === 'weekly' ? stats.weekTotal : stats.monthTotal} tasks completed
      </Text>
    </View>
  </>
);



