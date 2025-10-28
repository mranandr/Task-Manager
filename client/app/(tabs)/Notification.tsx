import { Animated, Modal, TouchableOpacity, View } from "react-native";
import { Theme } from "./TaskTab";
import { Text } from "react-native-gesture-handler";
import { styles } from "./styles";

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  message: string;
  panelType: 'Banner' | 'Alert' | 'Modal';
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  visible,
  onClose,
  theme,
  message,
  panelType,
}) => {
  if (!visible) return null;

  if (panelType === 'Banner') {
    return (
      <Animated.View style={[styles.banner, { backgroundColor: theme.primary }]}>
        <Text style={styles.bannerText}>{message}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.bannerClose}>✕</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.notificationOverlay}>
        <View style={[styles.notificationContent, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.notificationText, { color: theme.text }]}>{message}</Text>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={{ color: '#000', fontWeight: '600' }}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};