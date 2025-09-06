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
		paddingVertical: 40,
	},
	operationMode: {
		marginHorizontal: 20,
		marginVertical: 10,
		display: "flex",
		gap: 15,
	},
	operationModeTitle: {
		color: "#001268",
		fontWeight: "800",
		fontSize: width * 0.04,
		paddingVertical: 5,
	},
	operationModeText: {
		color: "#001268",
	},
	inputOperationMode: {
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
	operationModeButton: {
		padding: 15,
		backgroundColor: "#001268",
		borderRadius: 10,
	},
	operationModeButtonText: {
		color: "#F6F7F8",
		textAlign: "center",
	},
	operationCard: {
		flexDirection: "row",
		alignItems: "center",
		height: 80,
		padding: 16,
		borderRadius: 5,
		backgroundColor: "#F6F7F8",
		gap: 10,
		...boxShadow,
	},
	cardTitle: {
		flex: 1,
		color: "#001268",
		fontWeight: "800",
		fontSize: width * 0.04,
		paddingHorizontal: 10,
		
	},
	cardText: {
		flex: 3,
		fontSize: width * 0.03,
		maxWidth: "80%",
	
	},
	radio: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#0082FC',
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
        borderColor: '#0082FC',
        
        backgroundColor: '#0082FC', // Cor para o botão selecionado
    },
	radioInternal:{
		height: 10,
        width: 10,
        borderRadius: 10,
       
        backgroundColor: '#FFFFFF'
	}
});