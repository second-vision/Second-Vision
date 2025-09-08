import { StyleSheet } from "react-native";
import { theme } from "../../shared/styles";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.black,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
