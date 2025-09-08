import { StyleSheet } from "react-native";
import { theme } from "../../styles";
export const styles = StyleSheet.create({

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: theme.colors.background,
    paddingVertical: 10,
    
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    
 
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 5, 
  paddingHorizontal: 20,
 
  },

  navText: { fontSize: 12, color: theme.colors.text, marginTop: 5 },
});
