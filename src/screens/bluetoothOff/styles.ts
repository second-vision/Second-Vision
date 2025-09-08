import { StyleSheet } from "react-native";
import { theme } from "../../shared/styles";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Poppins",
    marginTop: 30,
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1.3,
    marginBottom: 60,
  },
  text: {
    fontWeight: "medium",
  },
  headerText: {
    marginBottom: 10,
    color: theme.colors.primary,
    fontWeight: "medium",
  },
  textBlue: {
    bottom: 20,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    width: "85%",
    justifyContent: "center",
  },
  scanButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    margin: 10,
    borderRadius: 12,
    flex: 1,
    top: 30,
  },
  scanButtonText: {
    letterSpacing: 0.25,
    color: theme.colors.background,
  },
});
