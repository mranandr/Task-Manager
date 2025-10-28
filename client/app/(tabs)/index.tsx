import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SwipeableTask } from "./SwipeableTask";
import { Modal, TouchableOpacity, View, Text, TextInput } from "react-native";
import { styles } from "./styles";
import { Settings } from "./Settings"; 
import { NotificationPanel } from "./Notification";
import { CalendarView } from "./Calendar";
import { AnalyticsView } from "./AnalyticsStats";
import { CustomDateRangePicker } from "./CustomDatePicker";

interface SettingsType {
  notificationsEnabled: boolean;
  notificationTime: string;
  notificationPanel: "Modal" | "Banner" | "Alert";
  darkMode: boolean;
  showSunday: boolean;
  soundEnabled: boolean;
  notificationTone: "Default" | "Chime" | "Bell"; 
}


interface Task {
  id: string;
  name: string;
  completed: boolean;
  dateKey?: string;
}

interface CustomDateRange {
  from: string;
  to: string;
}

interface MonthDataItem {
  day: number | null;
  completed: boolean;
  dateKey?: string;
  taskCount: number;      
  completedCount: number; 
}


interface Stats {
  weekCompleted: number;
  weekTotal: number;
  weekPercent: number;
  monthCompleted: number;
  monthTotal: number;
  monthPercent: number;
  customCompleted: number;
  customTotal: number;
  customPercent: number;
  currentStreak: number;
}

interface GetFirstDayOfMonth {
  (year: number, month: number): number;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Dashboard() {
const [settings, setSettings] = useState<SettingsType>({
  notificationsEnabled: true,
  notificationTime: '09:00',
  notificationPanel: 'Modal',
  darkMode: true,
  showSunday: false,
  soundEnabled: true,
  notificationTone: 'Default', 
});


  const [showSettings, setShowSettings] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks'>('dashboard');
  const [selectedView, setSelectedView] = useState<'weekly' | 'monthly' | 'custom'>('monthly');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({ from: '', to: '' });

  const [tasks, setTasks] = useState<Record<string, Task[]>>(() => {
    const initialTasks: Record<string, Task[]> = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      initialTasks[dateKey] = [
        { id: `${dateKey}-1`, name: 'Morning workout', completed: Math.random() > 0.5 },
        { id: `${dateKey}-2`, name: 'Read 30 pages', completed: Math.random() > 0.5 },
        { id: `${dateKey}-3`, name: 'Meditate', completed: Math.random() > 0.5 },
      ];
    }
    
    return initialTasks;
  });

  const theme = {
    background: settings.darkMode ? '#0a0a0a' : '#f5f5f5',
    cardBg: settings.darkMode ? '#1a1a1a' : '#ffffff',
    text: settings.darkMode ? '#ffffff' : '#1a1a1a',
    subText: settings.darkMode ? '#888888' : '#666666',
    primary: '#ff8c42',
    primaryDark: '#e67e3c',
    emptyCell: settings.darkMode ? '#2a2a2a' : '#e0e0e0',
    border: settings.darkMode ? '#333333' : '#d0d0d0',
    success: '#4caf50',
    danger: '#f44336',
  };

  useEffect(() => {
    if (settings.notificationsEnabled) {
      const checkNotifications = () => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (currentTime === settings.notificationTime) {
          const todayTasks = tasks[selectedDate] || [];
          const incompleteTasks = todayTasks.filter(t => !t.completed).length;
          if (incompleteTasks > 0) {
            setNotificationMessage(`You have ${incompleteTasks} task${incompleteTasks > 1 ? 's' : ''} remaining today!`);
            setShowNotification(true);
          }
        }
      };
      checkNotifications(); 
      const interval = setInterval(checkNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [settings, tasks, selectedDate]);

  const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth: GetFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const getMonthData = (): MonthDataItem[] => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const monthData: MonthDataItem[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      monthData.push({ day: null, completed: false, taskCount: 0, completedCount: 0 });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateTasks = tasks[dateKey] || [];
      const completedCount = dateTasks.filter(t => t.completed).length;
      const allCompleted = dateTasks.length > 0 && completedCount === dateTasks.length;
      
      monthData.push({
        day,
        completed: allCompleted,
        dateKey,
        taskCount: dateTasks.length,
        completedCount: completedCount,
      });
    }

    return monthData;
  };

  const calculateStats = (fromDate: string | null = null, toDate: string | null = null): Stats => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const startDate = fromDate ? new Date(fromDate) : weekAgo;
    const endDate = toDate ? new Date(toDate) : today;

    let weekCompleted = 0, weekTotal = 0;
    let monthCompleted = 0, monthTotal = 0;
    let customCompleted = 0, customTotal = 0;

    Object.keys(tasks).forEach(dateKey => {
      const date = new Date(dateKey);
      const dateTasks = tasks[dateKey] || [];
      const completed = dateTasks.filter(t => t.completed).length;
      const total = dateTasks.length;

      if (date >= weekAgo && date <= today) {
        weekTotal += total;
        weekCompleted += completed;
      }
      if (date >= monthAgo && date <= today) {
        monthTotal += total;
        monthCompleted += completed;
      }
      if (fromDate && toDate && date >= startDate && date <= endDate) {
        customTotal += total;
        customCompleted += completed;
      }
    });

    return {
      weekCompleted,
      weekTotal,
      weekPercent: weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0,
      monthCompleted,
      monthTotal,
      monthPercent: monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0,
      customCompleted,
      customTotal,
      customPercent: customTotal > 0 ? Math.round((customCompleted / customTotal) * 100) : 0,
      currentStreak: calculateStreak(),
    };
  };

  const calculateStreak = (): number => {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dateTasks = tasks[dateKey] || [];
      const allCompleted = dateTasks.length > 0 && dateTasks.every(t => t.completed);
      
      if (allCompleted) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const addTask = (): void => {
    if (newTaskName.trim()) {
      const newTask: Task = {
        id: `${selectedDate}-${Date.now()}`,
        name: newTaskName.trim(),
        completed: false,
      };
      
      setTasks(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), newTask],
      }));
      
      setNewTaskName('');
      setShowAddTask(false);
    }
  };

  const toggleTaskCompletion = (dateKey: string, taskId: string): void => {
    setTasks(prev => {
      const updated = { ...prev };
      if (updated[dateKey]) {
        updated[dateKey] = updated[dateKey].map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
      }
      return updated;
    });
  };

  const deleteTask = (dateKey?: string, taskId?: string): void => {
    if (!dateKey || !taskId) return;
    setTasks(prev => {
      const updated = { ...prev };
      if (updated[dateKey]) {
        updated[dateKey] = updated[dateKey].filter(t => t.id !== taskId);
      }
      return updated;
    });
    setSelectedTask(null);
  };

  const handleCustomDateRange = (from: string, to: string): void => {
    setCustomDateRange({ from, to });
    setSelectedView('custom');
    setShowDatePicker(false);
  };

  const monthData = getMonthData();
  const selectedDateTasks = tasks[selectedDate] || [];
  
  const stats = selectedView === 'custom' && customDateRange.from && customDateRange.to
    ? calculateStats(customDateRange.from, customDateRange.to)
    : calculateStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Task Tracker</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={() => setShowSettings(true)}
          >
            <Text style={{ color: theme.primary, fontSize: 20 }}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
          >
            <Text style={{ color: theme.primary, fontSize: 20 }}>
              {settings.darkMode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'dashboard' ? theme.primary : theme.cardBg,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'dashboard' ? '#000' : theme.text }]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'tasks' ? theme.primary : theme.cardBg,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'tasks' ? '#000' : theme.text }]}>
            Tasks
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'dashboard' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Month Selector */}
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <View style={styles.monthSelector}>
              <TouchableOpacity
                onPress={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
                style={[styles.monthButton, { borderColor: theme.border }]}
              >
                <Text style={{ color: theme.primary, fontSize: 20 }}>←</Text>
              </TouchableOpacity>
              
              <Text style={[styles.monthText, { color: theme.text }]}>
                {monthNames[selectedMonth]} {selectedYear}
              </Text>
              
              <TouchableOpacity
                onPress={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
                style={[styles.monthButton, { borderColor: theme.border }]}
              >
                <Text style={{ color: theme.primary, fontSize: 20 }}>→</Text>
              </TouchableOpacity>
            </View>

          <CalendarView
        theme={theme} 
       monthData={monthData}
        settings={settings}
        onDayPress={(item) => {
          // Use item.dateKey if CalendarItem has it, otherwise use item.day or another unique identifier
          if ('dateKey' in item && item.dateKey) {
            if (typeof item.dateKey === 'string') {
              setSelectedDate(item.dateKey);
              setActiveTab('tasks');
            }
          }
        }}
        />



            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: theme.emptyCell }]} />
                <Text style={[styles.legendText, { color: theme.subText }]}>Incomplete</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: theme.primary }]} />
                <Text style={[styles.legendText, { color: theme.subText }]}>All Done</Text>
              </View>
            </View>
          </View>

          {/* Analytics Section */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Analytics</Text>

          {/* View Selector */}
          <View style={styles.viewSelector}>
            {['weekly', 'monthly', 'custom'].map((view) => (
              <TouchableOpacity
                key={view}
                style={[
                  styles.viewButton,
                  {
                    backgroundColor: selectedView === view ? theme.primary : theme.cardBg,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => {
                  if (view === 'custom') {
                    setShowDatePicker(true);
                  } else {
                    setSelectedView(view as 'weekly' | 'monthly' | 'custom');
                  }
                }}
              >
                <Text
                  style={[
                    styles.viewButtonText,
                    { color: selectedView === view ? '#000' : theme.text },
                  ]}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedView === 'custom' && customDateRange.from && customDateRange.to && (
            <Text style={[styles.dateRangeText, { color: theme.subText }]}>
              {customDateRange.from} to {customDateRange.to}
            </Text>
          )}

          <AnalyticsView
            theme={theme} 
            stats={stats} 
            selectedView={selectedView === 'custom' ? 'monthly' : selectedView} 
          />
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Date Selector for Tasks */}
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <View style={styles.dateNavigation}>
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: theme.border }]}
                onPress={() => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() - 1);
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
              >
                <Text style={{ color: theme.primary }}>← Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: theme.border }]}
                onPress={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                }}
              >
                <Text style={{ color: theme.primary }}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: theme.border }]}
                onPress={() => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() + 1);
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
              >
                <Text style={{ color: theme.primary }}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add Task Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowAddTask(true)}
          >
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>Add New Task</Text>
          </TouchableOpacity>

          {/* Tasks List */}
          <View style={styles.tasksContainer}>
            {selectedDateTasks.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.cardBg }]}>
                <Text style={[styles.emptyStateText, { color: theme.subText }]}>
                  No tasks for this day
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.subText }]}>
                  Tap the + button to add a task
                </Text>
              </View>
            ) : (
              selectedDateTasks.map(task => (
<SwipeableTask
  key={task.id}
  task={task}
  dateKey={selectedDate}
  theme={theme}
  onToggle={toggleTaskCompletion}
  onSelect={() => deleteTask(selectedDate, task.id)} 
/>


              ))
            )}
          </View>

          {/* Task Summary */}
          {selectedDateTasks.length > 0 && (
            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Today's Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryText, { color: theme.subText }]}>Total Tasks:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{selectedDateTasks.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryText, { color: theme.subText }]}>Completed:</Text>
                <Text style={[styles.summaryValue, { color: theme.success }]}>
                  {selectedDateTasks.filter(t => t.completed).length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryText, { color: theme.subText }]}>Remaining:</Text>
                <Text style={[styles.summaryValue, { color: theme.danger }]}>
                  {selectedDateTasks.filter(t => !t.completed).length}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <Settings
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <CustomDateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        theme={theme}
        onApply={handleCustomDateRange}
      />

      {/* Notification Panel */}
      <NotificationPanel
        visible={showNotification}
        onClose={() => setShowNotification(false)}
        theme={theme}
        message={notificationMessage}
        panelType={settings.notificationPanel as 'Banner' | 'Alert' | 'Modal'}
      />

      {/* Add Task Modal */}
      <Modal
        visible={showAddTask}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddTask(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Task</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Enter task name..."
              placeholderTextColor={theme.subText}
              value={newTaskName}
              onChangeText={setNewTaskName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.emptyCell }]}
                onPress={() => {
                  setNewTaskName('');
                  setShowAddTask(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={addTask}
              >
                <Text style={[styles.modalButtonText, { color: '#000' }]}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedTask !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTask(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Task Details</Text>
            <Text style={[styles.taskDetailName, { color: theme.text }]}>
              {selectedTask?.name}
            </Text>
            <View style={styles.taskDetailStatus}>
              <Text style={[styles.taskDetailLabel, { color: theme.subText }]}>Status:</Text>
              <Text style={[
                styles.taskDetailValue,
                { color: selectedTask?.completed ? theme.success : theme.danger }
              ]}>
                {selectedTask?.completed ? '✓ Completed' : '✗ Not Completed'}
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.danger }]}
                onPress={() => deleteTask(selectedTask?.dateKey, selectedTask?.id)}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  if (selectedTask?.dateKey && selectedTask?.id) {
                    toggleTaskCompletion(selectedTask.dateKey, selectedTask.id);
                  }
                  setSelectedTask(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#000' }]}>
                  {selectedTask?.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: theme.border }]}
              onPress={() => setSelectedTask(null)}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}