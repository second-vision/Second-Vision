import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",

  },
  containerConfig: {
    padding: 20
  },
  scrollContent: {
		paddingVertical: 40,
	},

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0a398a",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  sliderLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a398a",
    marginHorizontal: 5,
  },
  slider: {
    width: 200,
    height: 40,
    
  },
  section: {
    marginBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a398a",
    padding: 12,
    borderRadius: 25,
    justifyContent: "center",
  },
  resetText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
});
