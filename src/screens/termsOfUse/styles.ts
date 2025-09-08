import { StyleSheet } from "react-native";
import { theme } from "../../shared/styles";
export const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 30,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: theme.colors.primary,
  },
  sectionText: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  arrayButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 30,
  },
  Button: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 10,
  },
  ButtonText: {
    color: theme.colors.background,
  },
  ButtonReject: {
    backgroundColor: theme.colors.tertiary,
    padding: 10,
    borderRadius: 10,
  },
});
