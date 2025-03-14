import { Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Poppins",
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1.3,
    marginBottom: 60,
  },
  text: {
    fontSize: width * 0.044,
    fontWeight: "medium",
  },
  headerText: {
    fontSize: width * 0.055,
    marginBottom: 10,
    color: "#0A398A",
    fontWeight: "medium",
  },
  textBlue: {
    width: "100%",
    paddingLeft: 40,
    bottom: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    width: "70%",
  },
  scanButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderColor: "#0a398a",
    backgroundColor: "#0A398A",
    borderWidth: 2,
    margin: 10,
    borderRadius: 10,
    flex: 1,
    top: 30,
  },
  scanButtonText: {
    fontSize: width * 0.04,
    letterSpacing: 0.25,
    color: "#fff",
  },
});
