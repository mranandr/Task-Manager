import { TouchableOpacity, View } from "react-native";
import { Theme } from "./TaskTab";
import { Text } from "react-native-gesture-handler";
import { styles } from "./styles";
import { AppSettings } from "./Settings";

interface CalendarItem {
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
  const dayLabels = settings.showSunday
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['M', 'T', 'W', 'T', 'F', 'S'];

  const filteredMonthData = settings.showSunday
    ? monthData
    : monthData.filter((_, idx) => idx % 7 !== 0);

  return (
    <View>
      <View style={styles.dayLabels}>
        {dayLabels.map((day, idx) => (
          <Text key={idx} style={[styles.dayLabel, { color: theme.subText }]}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendar}>
        {filteredMonthData.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.dayCell,
              {
                backgroundColor: item.day === null
                  ? 'transparent'
                  : item.completed
                  ? theme.primary
                  : theme.emptyCell,
              },
            ]}
            disabled={item.day === null}
            onPress={() => onDayPress(item)}
          >
            {item.day !== null && (
              <>
                <Text
                  style={[
                    styles.dayText,
                    { color: item.completed ? '#000' : theme.subText },
                  ]}
                >
                  {item.day}
                </Text>
                {item.taskCount > 0 && (
                  <Text
                    style={[
                      styles.taskCount,
                      { color: item.completed ? '#000' : theme.primary },
                    ]}
                  >
                    {item.completedCount}/{item.taskCount}
                  </Text>
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};