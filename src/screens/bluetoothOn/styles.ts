import { StyleSheet } from "react-native";

const boxShadow = {
  shadowColor: "#000",
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
    marginTop: 40
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
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
    backgroundColor: "#F6F7F8",
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
    backgroundColor: "#0a398a",
    margin: 10,
    borderRadius: 12,
    flex: 1,
    ...boxShadow,
  },
  scanButtonText: {
    fontSize: 16,
    letterSpacing: 0.25,
    color: "#FFFFFF",
  },
  peripheralName: {
    fontSize: 16,
    textAlign: "center",
  },
});
