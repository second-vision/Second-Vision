import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
const numColumns = width > 600 ? 3 : 2;

export const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  imageSessaoInfo: {
    width: "30%",
    height: undefined,
    aspectRatio: 1.3,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f3f3ff",
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    padding: 0,
  },
  modalInfo: {
    flexDirection: "row",
    justifyContent: "center",
  },
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "#ccc",
    marginBottom: 10,
    marginTop: 10,
  },
  textInfo: {
    paddingTop: 0,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
  },
  textTitle: {
    fontWeight: "bold",
    fontSize: width * 0.04,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },
  bullet: {
    fontSize: width * 0.04,
    lineHeight: 22,
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    fontSize: width * 0.035,
    lineHeight: 22,
    fontWeight: "bold",
  },
  itemContainerFlat: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flex: 1,
    fontWeight: "bold",
  },
});
