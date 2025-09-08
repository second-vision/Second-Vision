import { StyleSheet } from "react-native";
import { theme } from "../../styles";
const boxShadow = {
  shadowColor: theme.colors.black,
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
    color: theme.colors.primary,
    fontWeight: "800",
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
    color: theme.colors.primary,
    fontWeight: "900",
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
    backgroundColor: theme.colors.backgroundVariant,
    ...boxShadow,
  },
  cardTitle: {
    flex: 1,
    color: theme.colors.primary,
    fontWeight: "800",
    paddingHorizontal: 6,
  },
  cardText: {
    flex: 3,
    maxWidth: "80%",
  },
});
