import { TouchableOpacity, View, Dimensions } from "react-native";
import { Theme } from "./TaskTab";
import { Text } from "react-native-gesture-handler";
import { styles } from "./styles";
import { AppSettings } from "./Settings";

const { width } = Dimensions.get('window');

interface CalendarItem {
  dateKey?: string;
  day: number | null;
  completed: boolean;
  taskCount: number;
  completedCount: number;
}

interface CalendarViewProps {
  theme: Theme;
  monthData: CalendarItem[];
  onDayPress: (item: CalendarItem) => void;
  settings: AppSettings;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  theme,
  monthData,
  onDayPress,
  settings,
}) => {
  // Dynamic day labels based on Sunday setting
  const dayLabels = settings.showSunday
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate cell width based on number of columns
  const numColumns = settings.showSunday ? 7 : 6;
  const cellWidth = (width - 80) / numColumns;

  return (
    <View>
      {/* Day Labels */}
      <View style={styles.dayLabels}>
        {dayLabels.map((day, idx) => (
          <View key={idx} style={{ width: cellWidth, alignItems: 'center' }}>
            <Text style={[styles.dayLabel, { color: theme.subText }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {monthData.map((item, idx) => {
          // Skip Sunday if showSunday is false
          if (!settings.showSunday && item.day !== null && item.dateKey) {
            const cellDate = new Date(item.dateKey);
            if (cellDate.getDay() === 0) return null;
          }

          // Determine cell color based on completion status
          let cellColor = 'transparent';
          if (item.day !== null) {
            if (item.completed) {
              cellColor = theme.success || theme.primary; // Green for all complete
            } else if (item.taskCount > 0) {
              cellColor = theme.warning || '#f59e0b'; // Orange for partial
            } else {
              cellColor = theme.emptyCell; // Gray for no tasks
            }
          }

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dayCell,
                {
                  width: cellWidth,
                  height: cellWidth,
                  backgroundColor: cellColor,
                  opacity: item.day === null ? 0 : 1,
                },
              ]}
              disabled={item.day === null}
              onPress={() => item.day !== null && onDayPress(item)}
              activeOpacity={0.7}
            >
              {item.day !== null && (
                <>
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: item.completed || item.taskCount > 0 ? '#fff' : theme.text,
                        fontWeight: item.completed ? 'bold' : '600',
                      },
                    ]}
                  >
                    {item.day}
                  </Text>
                  {item.taskCount > 0 && (
                    <Text
                      style={[
                        styles.taskCount,
                        {
                          color: item.completed || item.taskCount > 0 ? '#fff' : theme.primary,
                          fontSize: 9,
                          marginTop: 2,
                        },
                      ]}
                    >
                      {item.completedCount}/{item.taskCount}
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { marginTop: 16 }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: theme.success || theme.primary }]} />
          <Text style={[styles.legendText, { color: theme.subText }]}>Complete</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: theme.warning || '#f59e0b' }]} />
          <Text style={[styles.legendText, { color: theme.subText }]}>Partial</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: theme.emptyCell }]} />
          <Text style={[styles.legendText, { color: theme.subText }]}>None</Text>
        </View>
      </View>
    </View>
  );
};