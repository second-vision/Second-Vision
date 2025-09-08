import { StyleSheet } from "react-native";
import { theme } from "../../styles";
export const styles = StyleSheet.create({
  headerOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    top: 10,
  },
  information: {
    width: "25%",
    alignSelf: "flex-start",
    
  },
  information2: {
    alignSelf: "flex-start",
  },
  information3: {
    width: "25%",
    alignSelf: "flex-start",
    alignItems: "flex-end",
  },
  textFont: {
    width: "50%",
    textAlign: "center",
    fontWeight: "bold",
    color: theme.colors.primary,
   
  },
});
