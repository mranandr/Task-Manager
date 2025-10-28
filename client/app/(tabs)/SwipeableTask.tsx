import React, { useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
import { styles } from './styles';
import { Theme } from './TaskTab';

interface TaskItem {
  id: string;
  name: string;
  completed: boolean;
}

interface SwipeableTaskProps {
  task: TaskItem;
  dateKey: string;
  theme: Theme;
  onToggle: (dateKey: string, taskId: string) => void;
  onSelect: (task: TaskItem & { dateKey: string }) => void;
}
const { width } = Dimensions.get('window');

export const SwipeableTask: React.FC<SwipeableTaskProps> = ({
  task,
  dateKey,
  theme,
  onToggle,
  onSelect,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => pan.setValue({ x: gestureState.dx, y: 0 }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          Animated.parallel([
            Animated.timing(pan, { toValue: { x: width, y: 0 }, duration: 200, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: false }),
          ]).start(() => {
            if (!task.completed) onToggle(dateKey, task.id);
            pan.setValue({ x: 0, y: 0 });
            opacity.setValue(1);
          });
        } else if (gestureState.dx < -100) {
          Animated.parallel([
            Animated.timing(pan, { toValue: { x: -width, y: 0 }, duration: 200, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: false }),
          ]).start(() => {
            if (task.completed) onToggle(dateKey, task.id);
            pan.setValue({ x: 0, y: 0 });
            opacity.setValue(1);
          });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const backgroundColor = pan.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [theme.danger || 'red', 'transparent', theme.success || 'green'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.swipeContainer}>
      <Animated.View style={[styles.swipeBackground, { backgroundColor }]}>
        <Text style={styles.swipeText}>
          {/* Use a ref to track the last gesture direction instead of pan.x['_value'] */}
          {task.completed ? '✗ Incomplete' : '✓ Complete'}
        </Text>
      </Animated.View>
      <Animated.View
        style={[{ transform: [{ translateX: pan.x }] }, { opacity }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.taskCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          onPress={() => onSelect({ ...task, dateKey })}
        >
          <View style={styles.taskContent}>
            <View
              style={[
                styles.taskCheckbox,
                {
                  backgroundColor: task.completed ? theme.primary : 'transparent',
                  borderColor: task.completed ? theme.primary : theme.border,
                },
              ]}
            >
              {task.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[
                styles.taskName,
                {
                  color: theme.text,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                  opacity: task.completed ? 0.6 : 1,
                },
              ]}
            >
              {task.name}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
