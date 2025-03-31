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
	container: {
		flex: 1,
		justifyContent: "space-between",
	},
	scrollContent: {
		paddingVertical: 20,
	},
	interval: {
		marginHorizontal: 20,
	},
	intervalTitle: {
		color: "#001268",
		fontWeight: "800",
		fontSize: width * 0.04,
		paddingVertical: 15,
	},
	intervalText: {
		color: "#001268",
	},
	inputInterval: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 15,
		padding: 15,
		borderRadius: 10,
		backgroundColor: "#F6F7F8",
		gap: 10,
		borderColor: "#000",
		borderStyle: "solid",
		borderWidth: 1,
	},
	intervalButton: {
		padding: 10,
		backgroundColor: "#001268",
		borderRadius: 10,
	},
	intervalButtonText: {
		color: "#F6F7F8",
		textAlign: "center",
	},
});