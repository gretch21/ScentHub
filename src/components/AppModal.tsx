import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { appFont } from "./ui";

type AppModalProps = {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function AppModal({
  visible,
  icon = "checkmark-circle-outline",
  iconColor = Colors.gold,
  title,
  message,
  confirmText = "OK",
  confirmColor = Colors.primary,
  showCancel = false,
  onConfirm,
  onCancel,
}: AppModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View
            style={[styles.iconCircle, { backgroundColor: iconColor + "22" }]}
          >
            <Ionicons name={icon} size={28} color={iconColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {showCancel && (
              <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.confirmButton,
                {
                  backgroundColor: confirmColor,
                  flex: showCancel ? 1 : undefined,
                  width: showCancel ? undefined : "100%",
                },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderTopWidth: 4,
    borderTopColor: Colors.gold,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontFamily: appFont,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 20,
  },
  buttonRow: { flexDirection: "row", gap: 10, width: "100%" },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    color: Colors.textDark,
    fontWeight: "700",
    fontFamily: appFont,
    fontSize: 14,
  },
  confirmButton: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: appFont,
    fontSize: 14,
  },
});
