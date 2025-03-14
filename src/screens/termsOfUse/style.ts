import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#001268",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: "#001268",
  },
  sectionText: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  arrayButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 20,
  },
  Button: {
    backgroundColor: "#001268",
    padding: 10,
    borderRadius: 10,
  },
  ButtonText: {
    color: "#FFFFFF",
  },
  ButtonReject: {
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 10,
  },
});
