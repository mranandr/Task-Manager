import { Animated, Modal, TouchableOpacity, View } from "react-native";
import { Theme } from "./TaskTab";
import { Text } from "react-native-gesture-handler";
import { styles } from "./styles";
import React from "react";

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  message: string;
  panelType: "Banner" | "Alert" | "Modal";
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  visible,
  onClose,
  theme,
  message,
  panelType,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  if (panelType === "Banner") {
    return (
      <Animated.View
        style={[
          styles.banner,
          {
            backgroundColor: theme.primary,
            opacity: fadeAnim,
            top: 50,
            shadowOpacity: 0.3,
            shadowRadius: 5,
          },
        ]}
      >
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
        <Animated.View
          style={[
            styles.notificationContent,
            {
              backgroundColor: theme.cardBg,
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.notificationText, { color: theme.text }]}>{message}</Text>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={{ color: "#000", fontWeight: "600" }}>Dismiss</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
