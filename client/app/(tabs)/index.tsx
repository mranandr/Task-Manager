import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  TextInput,
  Modal,
} from "react-native";
import { styles } from "./styles";
import { SwipeableTask } from "./SwipeableTask";
import { CalendarView } from "./Calendar";
import { AnalyticsView } from "./AnalyticsStats";
import { Settings } from "./Settings";
import { NotificationPanel } from "./Notification";
import { CustomDateRangePicker } from "./CustomDatePicker";
import { SafeAreaView } from 'react-native-safe-area-context';
import { darkTheme, lightTheme } from "./TaskTab";

interface Task {
  id: string;
  name: string;
  completed: boolean;
  dateKey: string;
  completedAt?: string;
  createdAt: string;
}

interface SettingsProps {
  amPm: "AM" | "PM";
  notificationsEnabled: boolean;
  notificationTime: string;
  notificationPanel: "Banner" | "Alert" | "Modal";
  darkMode: boolean;
  showSunday: boolean;
  soundEnabled: boolean;
  notificationTone: "Default" | "Chime" | "Bell";
}



export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "tasks" | "settings"
  >("dashboard");

  const [settings, setSettings] = useState<SettingsProps>({
  amPm: "AM",
  notificationsEnabled: true,
  notificationTime: "09:00",
  notificationPanel: "Banner", 
  darkMode: false,
  showSunday: true,
  soundEnabled: true,
  notificationTone: "Default",
});

const generateInitialTasks = (): Record<string, Task[]> => {
  const initial: Record<string, Task[]> = {};
  const today = new Date();
  const taskTemplates = [
    "Morning workout",
    "Read 30 pages",
    "Meditate 10 min",
    "Drink 8 glasses of water",
    "Review daily goals",
    "Evening walk",
  ];

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const numTasks = Math.floor(Math.random() * 4) + 2;
    initial[key] = taskTemplates.slice(0, numTasks).map((name, idx) => {
      const completed = Math.random() > 0.4;
      const createdTime = new Date(d.getTime() + idx * 1000);
      const completedTime = completed
        ? new Date(createdTime.getTime() + Math.random() * 7200000)
        : undefined;

      return {
        id: `${key}-${idx}`,
        name,
        completed,
        dateKey: key,
        createdAt: createdTime.toISOString(),
        completedAt: completedTime?.toISOString(),
      };
    });
  }
  return initial;
};

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedView, setSelectedView] = useState<
    "weekly" | "monthly" | "custom"
  >("monthly");
  const [customDateRange, setCustomDateRange] = useState({ from: "", to: "" });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [previewVisible, setPreviewVisible] = React.useState(false);


React.useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 400,
    useNativeDriver: true,
  }).start();
}, []);


  const [tasks, setTasks] = useState<Record<string, Task[]>>(
    generateInitialTasks
  );

const theme = settings.darkMode ? darkTheme : lightTheme;

  const stats = useMemo(() => {
    const today = new Date();
    const todayKey = today.toISOString().split("T")[0];
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    let weekCompleted = 0;
    let weekTotal = 0;
    let monthCompleted = 0;
    let monthTotal = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalCompletionTime = 0;
    let completionCount = 0;
    const hourlyDistribution = new Array(24).fill(0);

    // Calculate streaks by checking consecutive days
    const sortedDates = Object.keys(tasks)
      .sort()
      .reverse();
    let streakBroken = false;

    for (const dateKey of sortedDates) {
      const date = new Date(dateKey);
      const dateTasks = tasks[dateKey] || [];
      const completed = dateTasks.filter((t) => t.completed).length;
      const total = dateTasks.length;
      const allCompleted = total > 0 && completed === total;

      // Streak calculation
      if (allCompleted) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
        if (!streakBroken && date <= today) {
          currentStreak = tempStreak;
        }
      } else {
        if (!streakBroken && date < today) {
          streakBroken = true;
        }
        tempStreak = 0;
      }

      // Week and month stats
      if (date >= weekAgo && date <= today) {
        weekCompleted += completed;
        weekTotal += total;
      }
      if (date >= monthAgo && date <= today) {
        monthCompleted += completed;
        monthTotal += total;
      }

      // Completion time analysis
      dateTasks.forEach((task) => {
        if (task.completed && task.completedAt && task.createdAt) {
          const created = new Date(task.createdAt);
          const completedTime = new Date(task.completedAt);
          const timeToComplete =
            (completedTime.getTime() - created.getTime()) / (1000 * 60);
          totalCompletionTime += timeToComplete;
          completionCount++;

          const hour = completedTime.getHours();
          hourlyDistribution[hour]++;
        }
      });
    }

    const avgCompletionTime =
      completionCount > 0 ? Math.round(totalCompletionTime / completionCount) : 0;
    const mostProductiveHour = hourlyDistribution.indexOf(
      Math.max(...hourlyDistribution)
    );

    // Today's stats
    const todayTasks = tasks[todayKey] || [];
    const todayCompleted = todayTasks.filter((t) => t.completed).length;

    return {
      todayCompleted,
      todayTotal: todayTasks.length,
      todayPercent: todayTasks.length
        ? Math.round((todayCompleted / todayTasks.length) * 100)
        : 0,
      weekCompleted,
      weekTotal,
      weekPercent: weekTotal ? Math.round((weekCompleted / weekTotal) * 100) : 0,
      monthCompleted,
      monthTotal,
      monthPercent: monthTotal
        ? Math.round((monthCompleted / monthTotal) * 100)
        : 0,
      currentStreak,
      longestStreak,
      avgCompletionTime,
      mostProductiveHour:
        mostProductiveHour >= 0 ? `${mostProductiveHour}:00` : "N/A",
    };
  }, [tasks]);

  // Fixed monthData to properly handle Sunday toggle
  const monthData = useMemo(() => {
    const days = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const md: any[] = [];

    // Adjust first day based on showSunday setting
    // If showSunday is false, treat Monday as day 0
    const adjustedFirstDay = settings.showSunday
      ? firstDay
      : firstDay === 0
      ? 6
      : firstDay - 1;

    // Add empty cells before the first day
    for (let i = 0; i < adjustedFirstDay; i++) {
      md.push({ day: null, completed: false, taskCount: 0, completedCount: 0 });
    }

    // Add actual days
    for (let d = 1; d <= days; d++) {
      const key = `${selectedYear}-${String(selectedMonth + 1).padStart(
        2,
        "0"
      )}-${String(d).padStart(2, "0")}`;
      const dateTasks = tasks[key] || [];
      const completedCount = dateTasks.filter((t) => t.completed).length;
      const allCompleted = dateTasks.length > 0 && completedCount === dateTasks.length;
      
      md.push({
        day: d,
        completed: allCompleted,
        dateKey: key,
        taskCount: dateTasks.length,
        completedCount,
      });
    }
    return md;
  }, [selectedYear, selectedMonth, tasks, settings.showSunday]);

useEffect(() => {
  if (!settings.notificationsEnabled) return;

  const checkTime = () => {
    const now = new Date();
    const [rawHours, rawMinutes] = settings.notificationTime.split(":").map(Number);

    // Convert to 24-hour format based on AM/PM
    let hours = rawHours;
    if (settings.amPm === "PM" && rawHours < 12) hours += 12;
    if (settings.amPm === "AM" && rawHours === 12) hours = 0;

    if (now.getHours() === hours && now.getMinutes() === rawMinutes) {
      const todayKey = now.toISOString().split("T")[0];
      const todayTasks = tasks[todayKey] || [];
      const remaining = todayTasks.filter((t) => !t.completed).length;

      if (remaining > 0) {
        setNotificationMessage(
          `⏰ You have ${remaining} task${remaining > 1 ? "s" : ""} remaining today!`
        );
        setNotificationVisible(true);
      }
    }
  };

  checkTime();
  const interval = setInterval(checkTime, 60000);

  return () => clearInterval(interval);
}, [settings.notificationsEnabled, settings.notificationTime, settings.amPm, tasks]);


  // Task operations
  const toggleTaskCompletion = useCallback((dateKey: string, taskId: string) => {
    setTasks((prev) => {
      const copy = { ...prev };
      copy[dateKey] = copy[dateKey].map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      );
      return copy;
    });
  }, []);

  const deleteTask = useCallback((dateKey?: string, taskId?: string) => {
    if (!dateKey || !taskId) return;
    setTasks((prev) => {
      const copy = { ...prev };
      copy[dateKey] = copy[dateKey].filter((t) => t.id !== taskId);
      return copy;
    });
    setNotificationMessage("🗑️ Task deleted");
    setNotificationVisible(true);
  }, []);

  const addTask = useCallback(() => {
    if (!newTaskName.trim()) return;

    setTasks((prev) => {
      const copy = { ...prev };
      if (!copy[selectedDate]) copy[selectedDate] = [];

      const newTask: Task = {
        id: `${selectedDate}-${Date.now()}`,
        name: newTaskName.trim(),
        completed: false,
        dateKey: selectedDate,
        createdAt: new Date().toISOString(),
      };

      copy[selectedDate] = [...copy[selectedDate], newTask];
      return copy;
    });

    setNewTaskName("");
    setShowAddTask(false);
    setNotificationMessage("✅ Task added successfully!");
    setNotificationVisible(true);
  }, [newTaskName, selectedDate]);

  const changeMonth = useCallback((direction: number) => {
    setSelectedMonth((prev) => {
      const newMonth = prev + direction;
      if (newMonth > 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      if (newMonth < 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return newMonth;
    });
  }, []);

const animateFade = useCallback(() => {
  fadeAnim.setValue(0);
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 400,
    useNativeDriver: true,
  }).start();
}, [fadeAnim]);


  useEffect(() => {
    animateFade();
  }, [activeTab, animateFade]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {/* Month Navigation */}
              <View style={[styles.card, { backgroundColor: theme.cardBg, marginTop: 12, padding: 16 }]}>
                <View style={styles.monthSelector}>
                  <TouchableOpacity
                    onPress={() => changeMonth(-1)}
                    style={[styles.monthButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                  >
                    <Text style={{ color: theme.text, fontSize: 18 }}>←</Text>
                  </TouchableOpacity>
                  <Text style={[styles.monthText, { color: theme.text }]}>
                    {new Date(selectedYear, selectedMonth).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                  <TouchableOpacity
                    onPress={() => changeMonth(1)}
                    style={[styles.monthButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                  >
                    <Text style={{ color: theme.text, fontSize: 18 }}>→</Text>
                  </TouchableOpacity>
                </View>

                <CalendarView
                  theme={theme}
                  monthData={monthData}
                  settings={settings}
                  onDayPress={(item) => {
                    if (item?.dateKey) {
                      setSelectedDate(item.dateKey);
                      setActiveTab("tasks");
                    }
                  }}
                />
              </View>

              {/* Analytics Section */}
              <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 10 }]}>
                  📈 Analytics & Insights
                </Text>
                <AnalyticsView
                  theme={theme}
                  stats={stats as any}
                  selectedView={selectedView}
                />
              </View>
            </ScrollView>
          </Animated.View>
        );

      case "tasks":
        const selectedDateTasks = tasks[selectedDate] || [];
        return (
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
              <View style={[styles.card, { backgroundColor: theme.cardBg, marginTop: 12, padding: 16 }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowAddTask(true)}
                    style={{
                      backgroundColor: theme.primary,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>+</Text>
                  </TouchableOpacity>
                </View>

                {selectedDateTasks.length === 0 ? (
                  <View style={[styles.emptyState, { backgroundColor: theme.cardBg, paddingVertical: 40 }]}>
                    <Text style={{ color: theme.subText, fontSize: 48, marginBottom: 12 }}>📝</Text>
                    <Text style={{ color: theme.subText, fontSize: 16 }}>No tasks for this day</Text>
                    <TouchableOpacity
                      onPress={() => setShowAddTask(true)}
                      style={{
                        marginTop: 16,
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        backgroundColor: theme.primary,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>Add Your First Task</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  selectedDateTasks.map((t) => (
                    <SwipeableTask
                      key={t.id}
                      task={t}
                      dateKey={selectedDate}
                      theme={theme}
                      onToggle={toggleTaskCompletion}
                      onSelect={() => deleteTask(selectedDate, t.id)}
                    />
                  ))
                )}
              </View>
            </ScrollView>
          </Animated.View>
        );

        
      case "settings":
        return (
          <Animated.View
            style={{
              opacity: fadeAnim,
              flex: 1,
              backgroundColor: theme.background,
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 140,
              }}
            >
<Settings
  theme={theme}
  settings={settings}
  onSettingsChange={setSettings}
/>
            </ScrollView>
          </Animated.View>
        );

    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background, flex: 1 }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Task Tracker</Text>
      </View>

      {renderContent()}

      {/* Bottom Tab Bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          backgroundColor: theme.cardBg,
          borderTopWidth: 1,
          borderColor: theme.border,
          paddingVertical: 10,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {[
          { key: "dashboard", icon: "🏠", label: "Home" },
          {
            key: "tasks",
            icon: (
              <Image
                source={require("../../assets/images/task-done_17790807.png")}
                style={{
                  width: 22,
                  height: 22,
                  tintColor: activeTab === "tasks" ? theme.primary : theme.subText,
                }}
              />
            ),
            label: "Tasks",
          },
          { key: "settings", icon: "⚙️", label: "Settings" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
          >
            {typeof tab.icon === "string" ? (
              <Text
                style={{
                  fontSize: 20,
                  color: activeTab === tab.key ? theme.primary : theme.subText,
                }}
              >
                {tab.icon}
              </Text>
            ) : (
              tab.icon
            )}
            <Text
              style={{
                fontSize: 12,
                color: activeTab === tab.key ? theme.primary : theme.subText,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Task Modal */}
      <Modal visible={showAddTask} transparent animationType="slide" onRequestClose={() => setShowAddTask(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Task</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Enter task name..."
              placeholderTextColor={theme.subText}
              value={newTaskName}
              onChangeText={setNewTaskName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.emptyCell }]}
                onPress={() => setShowAddTask(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={addTask}
                disabled={!newTaskName.trim()}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <NotificationPanel
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        theme={theme}
        message={notificationMessage}
        panelType={settings.notificationPanel}
      />

      <CustomDateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        theme={theme}
        onApply={(from, to) => {
          setCustomDateRange({ from, to });
          setSelectedView("custom");
          setShowDatePicker(false);
        }}
      />
    </SafeAreaView>
  );
}