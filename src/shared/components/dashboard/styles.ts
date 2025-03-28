import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

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
  dashboard: {
    marginHorizontal: 20,
  },
  dashboardTitle: {
    color: "#001268",
    fontWeight: "800",
    fontSize: width * 0.04,
    paddingVertical: 15,
  },
  campos: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  info: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  nivel: {
    color: "#001268",
    fontWeight: "900",
    fontSize: width * 0.05,
  },
  category: {
    fontWeight: "light",
  },
  operationMode: {
    marginTop: 20,
  },
  operationCard: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#F6F7F8",
    ...boxShadow,
  },
  cardTitle: {
    flex: 1,
    color: "#001268",
    fontWeight: "800",
    fontSize: width * 0.04,
    paddingHorizontal: 6,
  },
  cardText: {
    flex: 3,
    fontSize: width * 0.03,
    maxWidth: "80%",
  },
});
