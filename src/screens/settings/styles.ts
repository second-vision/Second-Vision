import { StyleSheet } from "react-native";
import { theme } from "../../shared/styles";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  containerConfig: {
    padding: 20,
  },
  scrollContent: {
    paddingVertical: 40,
  },

  title: {
    fontWeight: "700",
    color: theme.colors.primary,
  },
  subtitle: {
    color: theme.colors.text,
    marginBottom: 10,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  sliderLabel: {
    fontSize: 30,
    fontWeight: "bold",
    color: theme.colors.primary,

  },
  mais:{
    textAlign: "right",
  },
  slider: {
    flex: 1,

  },
  section: {
    marginBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  resetText: {
    color: theme.colors.background,
    marginLeft: 8,
    fontWeight: "600",
  },
});
