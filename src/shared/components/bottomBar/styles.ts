import { StyleSheet } from "react-native";
import { theme } from "../../styles";
export const styles = StyleSheet.create({
  bottomNav: {
    height: "12%",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: theme.colors.background,
    paddingTop: 10,
    paddingBottom: 50,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
});
