import { Animated, Modal, TouchableOpacity, View } from "react-native";
import { Theme } from "./TaskTab";
import { Text } from "react-native-gesture-handler";
import { styles } from "./styles";
import { useState } from "react";
import { TextInput } from "react-native";
interface CustomDateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  onApply: (fromDate: string, toDate: string) => void;
}


export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  visible,
  onClose,
  theme,
  onApply,
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Select Date Range</Text>

          <Text style={[styles.label, { color: theme.subText }]}>From Date</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.subText}
            value={fromDate}
            onChangeText={setFromDate}
          />

          <Text style={[styles.label, { color: theme.subText, marginTop: 12 }]}>To Date</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.subText}
            value={toDate}
            onChangeText={setToDate}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.emptyCell }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                onApply(fromDate, toDate);
                onClose();
              }}
            >
              <Text style={[styles.modalButtonText, { color: '#000' }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};