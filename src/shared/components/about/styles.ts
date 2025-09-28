import {  StyleSheet } from "react-native";
import { theme } from "../../styles";
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
    paddingTop: 8,
    flex: 1,
    backgroundColor: theme.colors.modal,
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
    backgroundColor: theme.colors.line,
    marginBottom: 10,
    marginTop: 10,
  },
  textTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },
  bullet: {
    lineHeight: 22,
    marginRight: 10,
  },
  itemText: {
    flex: 1,
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
  modalScrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20, // garante espaço no final do scroll
    paddingTop: 0,
    paddingRight: 20,
    paddingLeft: 20,
  },
});
