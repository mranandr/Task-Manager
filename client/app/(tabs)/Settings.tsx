import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles"; 
import { darkTheme, lightTheme, Theme } from "./TaskTab";

interface SettingsProps {
  notificationsEnabled: boolean;
  notificationTime: string; 
  amPm: "AM" | "PM";
  notificationPanel: "Banner" | "Alert" | "Modal";
  darkMode: boolean;
  showSunday: boolean;
  soundEnabled: boolean;
  notificationTone: "Default" | "Chime" | "Bell";
}

interface SettingsComponentProps {
  theme: Theme; 
  settings: SettingsProps;
  onSettingsChange: (newSettings: SettingsProps) => void;
}

// 👇 Props for Section (reusable layout container)
interface SectionProps {
  title: string;
  children: React.ReactNode;
}


export const Settings: React.FC<SettingsComponentProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const theme = settings.darkMode ? darkTheme : lightTheme;

  const showPreview = () => {
    setPreviewVisible(true);
    setTimeout(() => setPreviewVisible(false), 2500);
  };

  const Section: React.FC<SectionProps> = ({ title, children }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          borderWidth: 1,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 3,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: theme.primary,
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );

  return (
    <View style={[styles.settingsPageContainer, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={settings.darkMode ? "light-content" : "dark-content"} />
      <Text style={[styles.pageTitle, { color: theme.primary }]}>⚙️ Settings</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 🔔 Notifications Section */}
        <Section title="Notifications">
          <Text style={[styles.label, { color: theme.text }]}>Enable Notifications</Text>
          <View style={{ borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
            <Picker
              selectedValue={settings.notificationsEnabled ? "Enabled" : "Disabled"}
              style={[styles.pickerCompact, { backgroundColor: theme.emptyCell, color: theme.text }]}
              dropdownIconColor={theme.text}
              onValueChange={(val) =>
                onSettingsChange({ ...settings, notificationsEnabled: val === "Enabled" })
              }
            >
              <Picker.Item label="Enabled" value="Enabled" />
              <Picker.Item label="Disabled" value="Disabled" />
            </Picker>
          </View>

          {settings.notificationsEnabled && (
            <>
              <Text style={[styles.label, { color: theme.text }]}>Notification Time</Text>
              <View style={styles.timePickerRow}>
                <Picker
                  selectedValue={settings.notificationTime.split(":")[0]}
                  style={[styles.pickerCompact, { backgroundColor: theme.emptyCell, color: theme.text }]}
                  dropdownIconColor={theme.text}
                  onValueChange={(hour) => {
                    const [, minute] = settings.notificationTime.split(":");
                    onSettingsChange({ ...settings, notificationTime: `${hour}:${minute}` });
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const h = String(i + 1).padStart(2, "0");
                    return <Picker.Item key={h} label={h} value={h} />;
                  })}
                </Picker>

                <Picker
                  selectedValue={settings.notificationTime.split(":")[1]}
                  style={[styles.pickerCompact, { backgroundColor: theme.emptyCell, color: theme.text }]}
                  dropdownIconColor={theme.text}
                  onValueChange={(minute) => {
                    const [hour] = settings.notificationTime.split(":");
                    onSettingsChange({ ...settings, notificationTime: `${hour}:${minute}` });
                  }}
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const m = String(i).padStart(2, "0");
                    return <Picker.Item key={m} label={m} value={m} />;
                  })}
                </Picker>

                <Picker
                  selectedValue={settings.amPm}
                  style={[styles.pickerCompact, { backgroundColor: theme.emptyCell, color: theme.text }]}
                  dropdownIconColor={theme.text}
                  onValueChange={(val) => onSettingsChange({ ...settings, amPm: val })}
                >
                  <Picker.Item label="AM" value="AM" />
                  <Picker.Item label="PM" value="PM" />
                </Picker>
              </View>

              <Text style={[styles.label, { color: theme.text, marginTop: 12 }]}>Panel Type</Text>
              <Picker
                selectedValue={settings.notificationPanel}
                style={[styles.pickerCompact, { backgroundColor: theme.emptyCell, color: theme.text }]}
                dropdownIconColor={theme.text}
                onValueChange={(val) => {
                  onSettingsChange({
                    ...settings,
                    notificationPanel: val,
                  });
                  showPreview();
                }}
              >
                <Picker.Item label="Banner" value="Banner" />
                <Picker.Item label="Alert" value="Alert" />
                <Picker.Item label="Modal" value="Modal" />
              </Picker>
            </>
          )}
        </Section>

        {/* 🎨 Appearance Section */}
        <Section title="Appearance">
          <Text style={[styles.label, { color: theme.text }]}>Theme</Text>
          <Picker
            selectedValue={settings.darkMode ? "Dark" : "Light"}
            style={[styles.pickerCompact, { backgroundColor: theme.emptyCell, color: theme.text }]}
            dropdownIconColor={theme.text}
            onValueChange={(val) =>
              onSettingsChange({ ...settings, darkMode: val === "Dark" })
            }
          >
            <Picker.Item label="Light" value="Light" />
            <Picker.Item label="Dark" value="Dark" />
          </Picker>

          <Text style={[styles.label, { color: theme.text, marginTop: 12 }]}>Show Sunday</Text>
          <Picker
            selectedValue={settings.showSunday ? "Yes" : "No"}
            style={[styles.pickerCompact, { backgroundColor: theme.emptyCell, color: theme.text }]}
            dropdownIconColor={theme.text}
            onValueChange={(val) =>
              onSettingsChange({ ...settings, showSunday: val === "Yes" })
            }
          >
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>
        </Section>

        {/* 🔊 Sound Section */}
        <Section title="Sound">
          <Text style={[styles.label, { color: theme.text }]}>Sound Enabled</Text>
          <Picker
            selectedValue={settings.soundEnabled ? "Enabled" : "Disabled"}
            style={[styles.pickerCompact, { backgroundColor: theme.emptyCell, color: theme.text }]}
            dropdownIconColor={theme.text}
            onValueChange={(val) =>
              onSettingsChange({ ...settings, soundEnabled: val === "Enabled" })
            }
          >
            <Picker.Item label="Enabled" value="Enabled" />
            <Picker.Item label="Disabled" value="Disabled" />
          </Picker>

          <Text style={[styles.label, { color: theme.text, marginTop: 12 }]}>Notification Tone</Text>
          <Picker
            selectedValue={settings.notificationTone}
            style={[styles.pickerCompact, { backgroundColor: theme.emptyCell, color: theme.text }]}
            dropdownIconColor={theme.text}
            onValueChange={(val) =>
              onSettingsChange({ ...settings, notificationTone: val })
            }
          >
            <Picker.Item label="Default" value="Default" />
            <Picker.Item label="Chime" value="Chime" />
            <Picker.Item label="Bell" value="Bell" />
          </Picker>
        </Section>

        {/* ✅ Save Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: theme.primary, marginTop: 16 },
          ]}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
            Save Settings
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
