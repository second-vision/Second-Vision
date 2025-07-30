import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000aa',
  },
  loadingText:{
      marginTop: 10,
    fontSize: 16,
    color: '#ffffffff',
    textAlign: 'center'
  }

});
