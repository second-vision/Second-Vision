import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");


export const styles = StyleSheet.create({
  headerOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    top: 10,
  },
  information: {
    width: "25%",
    alignSelf: "flex-start",
    
  },
  information2: {
    alignSelf: "flex-start",
  },
  information3: {
    width: "25%",
    alignSelf: "flex-start",
    alignItems: "flex-end",
  },
  textFont: {
    width: "50%",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: width * 0.05,
    color: "#001268",
   
  },
});
