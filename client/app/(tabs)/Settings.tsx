import {  Modal, ScrollView, Switch, TouchableOpacity, View , TextInput} from "react-native";
import { Theme } from "./TaskTab";
import { Text } from "react-native-gesture-handler";
import { styles } from "./styles";

export interface AppSettings {
  notificationsEnabled: boolean;
  notificationTime: string;
  notificationPanel: 'Banner' | 'Alert' | 'Modal';
  darkMode: boolean;
  showSunday: boolean;
  soundEnabled: boolean;
  notificationTone: 'Default' | 'Chime' | 'Bell';
}


interface SettingsProps {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  visible,
  onClose,
  theme,
  settings,
  onSettingsChange,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={[styles.settingsModal, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.modalTitle, { color: theme.text }]}>Settings</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Enable Notifications</Text>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(val) =>
                  onSettingsChange({ ...settings, notificationsEnabled: val })
                }
                trackColor={{ false: theme.emptyCell, true: theme.primary }}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Notification Time</Text>
              <TextInput
                style={[styles.timeInput, { color: theme.text, borderColor: theme.border }]}
                value={settings.notificationTime}
                onChangeText={(val) =>
                  onSettingsChange({ ...settings, notificationTime: val })
                }
                placeholder="09:00"
                placeholderTextColor={theme.subText}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Panel Type</Text>
              <View style={styles.buttonGroup}>
                {['Banner', 'Alert', 'Modal'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor:
                          settings.notificationPanel === type
                            ? theme.primary
                            : theme.emptyCell,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() =>
                      onSettingsChange({
                        ...settings,
                        notificationPanel: type as AppSettings['notificationPanel'],
                      })
                    }
                  >
                    <Text
                      style={{
                        color:
                          settings.notificationPanel === type ? '#000' : theme.text,
                        fontSize: 12,
                      }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Appearance */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
              <Switch
                value={settings.darkMode}
                onValueChange={(val) => onSettingsChange({ ...settings, darkMode: val })}
                trackColor={{ false: theme.emptyCell, true: theme.primary }}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Show Sunday in Dashboard
              </Text>
              <Switch
                value={settings.showSunday}
                onValueChange={(val) => onSettingsChange({ ...settings, showSunday: val })}
                trackColor={{ false: theme.emptyCell, true: theme.primary }}
              />
            </View>
          </View>

          {/* Sound */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sound & Tone</Text>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Sound Enabled</Text>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(val) => onSettingsChange({ ...settings, soundEnabled: val })}
                trackColor={{ false: theme.emptyCell, true: theme.primary }}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Notification Tone</Text>
              <View style={styles.buttonGroup}>
                {['Default', 'Chime', 'Bell'].map((tone) => (
                  <TouchableOpacity
                    key={tone}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor:
                          settings.notificationTone === tone
                            ? theme.primary
                            : theme.emptyCell,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() =>
                      onSettingsChange({
                        ...settings,
                        notificationTone: tone as AppSettings['notificationTone'],
                      })
                    }
                  >
                    <Text
                      style={{
                        color:
                          settings.notificationTone === tone ? '#000' : theme.text,
                        fontSize: 12,
                      }}
                    >
                      {tone}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: theme.primary }]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
