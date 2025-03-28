import { Button, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  containerScreen: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 12,
    padding: 24,
  },
  containerMain: {
    flex: 1,
    flexDirection: "column",
  },
  containerDevices: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    padding: 12,
  },
  containerButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 24,
  },
  containerConnectedDevice: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#f0f0f0",
  },
  viewDevice: {
    flexDirection: "row",
  },

  textTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default styles;
