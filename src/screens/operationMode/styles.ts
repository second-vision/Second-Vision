import { StyleSheet } from "react-native";
import { theme } from "../../shared/styles";
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
	container: {
		flex: 1,
		justifyContent: "space-between",
	},
	scrollContent: {
		paddingVertical: 40,
	},
	operationMode: {
		marginHorizontal: 20,
		marginVertical: 10,
		display: "flex",
		gap: 15,
	},
	operationModeTitle: {
		color: theme.colors.primary,
		fontWeight: "800",
		
		paddingVertical: 5,
	},
	operationModeText: {
		color: theme.colors.primary,
	},
	inputOperationMode: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 15,
		padding: 15,
		borderRadius: 10,
		backgroundColor: theme.colors.backgroundVariant,
		gap: 10,
		borderColor: theme.colors.black,
		borderStyle: "solid",
		borderWidth: 1,
	},
	operationModeButton: {
		padding: 15,
		backgroundColor: theme.colors.primary,
		borderRadius: 10,
	},
	operationModeButtonText: {
		color: theme.colors.backgroundVariant,
		textAlign: "center",
	},
	operationCard: {
		flexDirection: "row",
		alignItems: "center",
		height: 80,
		padding: 16,
		borderRadius: 5,
		backgroundColor: theme.colors.backgroundVariant,
		gap: 10,
		...boxShadow,
	},
	cardTitle: {
		flex: 1,
		color: theme.colors.primary,
		fontWeight: "800",
		paddingHorizontal: 10,
		
	},
	cardText: {
		flex: 3,
		maxWidth: "80%",
	
	},
	radio: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.secundary,
        marginRight: 10,
		padding: 2,
		alignItems: "center",
		justifyContent: "center"
    },
    radioSelected: {
        height: 10,
        width: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.secundary,
        
        backgroundColor: theme.colors.secundary, // Cor para o botão selecionado
    },
	radioInternal:{
		height: 10,
        width: 10,
        borderRadius: 10,
       
        backgroundColor: theme.colors.background
	}
});