import { StyleSheet } from "react-native";
import { theme } from "../../shared/styles";
const boxShadow = {
  shadowColor: theme.colors.black,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    marginTop: 40,
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 90,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.backgroundVariant,
    ...boxShadow,
  },
  noPeripherals: {
    margin: 5,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    width: "100%",
  },
  scanButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary,
    margin: 10,
    borderRadius: 12,
    flex: 1,
    ...boxShadow,
  },
  scanButtonText: {
    letterSpacing: 0.25,
    color: theme.colors.background,
  },
  peripheralName: {
    textAlign: "center",
  },
});
