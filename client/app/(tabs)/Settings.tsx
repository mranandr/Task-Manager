import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
} from "react-native";
import { NotificationPanel } from "./Notification";
import type { Theme } from "./TaskTab";

export interface AppSettings {
  amPm: "AM" | "PM";
  notificationsEnabled: boolean;
  notificationTime: string;
  notificationPanel: "Banner" | "Alert" | "Modal";
  darkMode: boolean;
  showSunday: boolean;
  soundEnabled: boolean;
  notificationTone: "Default" | "Chime" | "Bell";
}

export interface SettingsProps {
  amPm: "AM" | "PM";
  notificationsEnabled: boolean;
  notificationTime: string;
  notificationPanel: "Banner" | "Alert" | "Modal";
  darkMode: boolean;
  showSunday: boolean;
  soundEnabled: boolean;
  notificationTone: "Default" | "Chime" | "Bell";
}

export interface ModernSettingsProps {
  settings: SettingsProps;
  onSettingsChange: (settings: SettingsProps) => void;
  theme: Theme;
}

export const Settings: React.FC<ModernSettingsProps> = ({
  settings,
  onSettingsChange,
  theme,
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPanelPicker, setShowPanelPicker] = useState(false);
  const [tempHour, setTempHour] = useState("09");
  const [tempMinute, setTempMinute] = useState("00");
  const [tempAmPm, setTempAmPm] = useState<"AM" | "PM">("AM");
  const [tempPanel, setTempPanel] = useState(settings.notificationPanel);
  const [lastNotifiedAt, setLastNotifiedAt] = useState<string | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Initialize temp values when settings change
  useEffect(() => {
    const [h, m] = settings.notificationTime.split(":");
    setTempHour(h || "09");
    setTempMinute(m || "00");
    setTempAmPm(settings.amPm);
  }, [settings.notificationTime, settings.amPm]);

  // Notification Timer Logic
  useEffect(() => {
    if (!settings.notificationsEnabled) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const checkTime = () => {
      const [rawHours, rawMinutes] = settings.notificationTime
        .split(":")
        .map((p) => parseInt(p, 10));

      if (isNaN(rawHours) || isNaN(rawMinutes)) return;

      let hours = rawHours;
      if (settings.amPm === "PM" && rawHours < 12) hours += 12;
      if (settings.amPm === "AM" && rawHours === 12) hours = 0;

      const now = new Date();
      const nowKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${hours}:${rawMinutes}`;

      if (now.getHours() === hours && now.getMinutes() === rawMinutes) {
        if (lastNotifiedAt !== nowKey) {
          setNotificationMessage("⏰ Reminder: Stay productive and check your tasks!");
          setNotificationVisible(true);
          setLastNotifiedAt(nowKey);
        }
      }
    };

    checkTime();
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    timeoutId = setTimeout(() => {
      checkTime();
      intervalId = setInterval(checkTime, 60 * 1000);
    }, msToNextMinute);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [settings.notificationsEnabled, settings.notificationTime, settings.amPm, lastNotifiedAt]);

  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    type = "switch",
  }: {
    icon: string;
    label: string;
    value: boolean | string;
    onPress: () => void;
    type?: "switch" | "text";
  }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={type === "switch" ? undefined : onPress}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: theme.cardBg,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>
        <Text style={{ color: theme.text, fontSize: 15, fontWeight: "500" }}>{label}</Text>
      </View>

      {type === "switch" ? (
        <Switch
          value={Boolean(value)}
          onValueChange={onPress}
          trackColor={{ true: theme.primary, false: theme.emptyCell }}
        />
      ) : (
        <Text style={{ color: theme.primary, fontWeight: "600", fontSize: 14 }}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingVertical: 16,
          paddingHorizontal: 16,
          flexGrow: 1,
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 28,
            fontWeight: "800",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          ⚙️ Settings
        </Text>

        <Text
          style={{
            color: theme.subText,
            fontSize: 14,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Customize your task tracking experience
        </Text>

        {/* Notifications Section */}
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
          🔔 Notifications
        </Text>

        <SettingRow
          icon="📬"
          label="Enable Notifications"
          value={settings.notificationsEnabled}
          onPress={() =>
            onSettingsChange({
              ...settings,
              notificationsEnabled: !settings.notificationsEnabled,
            })
          }
        />

        {settings.notificationsEnabled && (
          <>
            <SettingRow
              icon="⏰"
              label="Notification Time"
              value={`${settings.notificationTime} ${settings.amPm}`}
              onPress={() => setShowTimePicker(true)}
              type="text"
            />

            <SettingRow
              icon="📱"
              label="Panel Style"
              value={settings.notificationPanel}
              onPress={() => setShowPanelPicker(true)}
              type="text"
            />
          </>
        )}

        {/* Appearance Section */}
        <Text
          style={{
            color: theme.text,
            fontSize: 16,
            fontWeight: "700",
            marginVertical: 12,
          }}
        >
          🎨 Appearance
        </Text>

        <SettingRow
          icon="🌙"
          label="Dark Mode"
          value={settings.darkMode}
          onPress={() => onSettingsChange({ ...settings, darkMode: !settings.darkMode })}
        />

        <SettingRow
          icon="📅"
          label="Show Sunday"
          value={settings.showSunday}
          onPress={() => onSettingsChange({ ...settings, showSunday: !settings.showSunday })}
        />
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Set Notification Time
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 20 }}>
              {/* Hour Picker */}
              <ScrollView style={{ maxHeight: 150, width: 60 }}>
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setTempHour(h)}
                    style={{
                      padding: 10,
                      backgroundColor: tempHour === h ? `${theme.primary}33` : "transparent",
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: tempHour === h ? theme.primary : theme.text,
                        textAlign: "center",
                        fontWeight: tempHour === h ? "700" : "400",
                      }}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={{ color: theme.text, fontSize: 24, alignSelf: "center" }}>:</Text>

              {/* Minute Picker */}
              <ScrollView style={{ maxHeight: 150, width: 60 }}>
                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setTempMinute(m)}
                    style={{
                      padding: 10,
                      backgroundColor: tempMinute === m ? `${theme.primary}33` : "transparent",
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: tempMinute === m ? theme.primary : theme.text,
                        textAlign: "center",
                        fontWeight: tempMinute === m ? "700" : "400",
                      }}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* AM/PM Picker */}
              <View style={{ justifyContent: "center" }}>
                {["AM", "PM"].map((period) => (
                  <TouchableOpacity
                    key={period}
                    onPress={() => setTempAmPm(period as "AM" | "PM")}
                    style={{
                      padding: 10,
                      backgroundColor: tempAmPm === period ? `${theme.primary}33` : "transparent",
                      borderRadius: 8,
                      marginBottom: 4,
                      width: 60,
                    }}
                  >
                    <Text
                      style={{
                        color: tempAmPm === period ? theme.primary : theme.text,
                        textAlign: "center",
                        fontWeight: tempAmPm === period ? "700" : "400",
                      }}
                    >
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={{
                  flex: 1,
                  backgroundColor: theme.emptyCell,
                  borderRadius: 12,
                  paddingVertical: 14,
                }}
              >
                <Text style={{ color: theme.text, textAlign: "center", fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onSettingsChange({
                    ...settings,
                    notificationTime: `${tempHour}:${tempMinute}`,
                    amPm: tempAmPm,
                  });
                  setShowTimePicker(false);
                }}
                style={{
                  flex: 1,
                  backgroundColor: theme.primary,
                  borderRadius: 12,
                  paddingVertical: 14,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                  Set Time
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Panel Style Modal */}
      <Modal visible={showPanelPicker} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Select Panel Style
            </Text>

            {["Banner", "Alert", "Modal"].map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setTempPanel(opt as SettingsProps["notificationPanel"])}
                style={{
                  backgroundColor: tempPanel === opt ? `${theme.primary}33` : theme.background,
                  borderWidth: 2,
                  borderColor: tempPanel === opt ? theme.primary : theme.border,
                  paddingVertical: 14,
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: tempPanel === opt ? theme.primary : theme.text,
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 16,
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowPanelPicker(false)}
                style={{
                  flex: 1,
                  backgroundColor: theme.emptyCell,
                  borderRadius: 12,
                  paddingVertical: 14,
                }}
              >
                <Text style={{ color: theme.text, textAlign: "center", fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onSettingsChange({ ...settings, notificationPanel: tempPanel });
                  setShowPanelPicker(false);
                }}
                style={{
                  flex: 1,
                  backgroundColor: theme.primary,
                  borderRadius: 12,
                  paddingVertical: 14,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                  Set
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notification Panel */}
      <NotificationPanel
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        theme={theme}
        message={notificationMessage}
        panelType={settings.notificationPanel}
      />
    </View>
  );
};

export default Settings;