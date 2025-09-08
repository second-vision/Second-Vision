import { StyleSheet } from "react-native";
import { theme } from "../../shared/styles";
export const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "space-between",
	},
	scrollContent: {
		paddingVertical: 40,
	},
	interval: {
		marginHorizontal: 20,
	},
	intervalTitle: {
		color: theme.colors.primary,
		fontWeight: "800",
		paddingVertical: 15,
	},
	intervalText: {
		color: theme.colors.primary,
	},
	inputInterval: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 15,
		padding: 15,
		borderRadius: 12,
		backgroundColor: theme.colors.backgroundVariant,
		gap: 10,
		borderColor: theme.colors.black,
		borderStyle: "solid",
		borderWidth: 1,
	},
	intervalButton: {
		padding: 15,
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
	},
	intervalButtonText: {
		color: theme.colors.backgroundVariant,
		textAlign: "center",
	},
});