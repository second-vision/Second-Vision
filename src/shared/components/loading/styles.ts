import { StyleSheet } from "react-native";
import { theme } from "../../styles";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.black,
  },
  loadingText:{
      marginTop: 10,
    fontSize: 16,
    color: theme.colors.background,
    textAlign: 'center'
  }

});
