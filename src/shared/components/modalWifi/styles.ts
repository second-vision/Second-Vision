import { StyleSheet } from "react-native";
import { theme } from "../../styles";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: theme.colors.black,
  },
  modalContent: {
    margin: 20,
    padding: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
    borderRadius: 6,
    borderColor: theme.colors.line,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  alignCloseButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.closeButton,
    justifyContent: "center",
    alignItems: "center",
  },

  sendButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,

    borderRadius: 10,
  },
  sendButtonText: {
    letterSpacing: 0.25,
    color: theme.colors.background,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  iconButton: {
    padding: 5,
  },
});
