import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
	View,
	Image,
	Dimensions,
	StyleSheet,
	TouchableHighlight,
} from "react-native";
const { width } = Dimensions.get("window");
export function Devices() {
	const route = useRoute();

	return (
		<View style={styles.titulo}>
			<Image
				//source={require("../../assets/images/Logo.png")}
				style={styles.image}
				resizeMode="contain"
				accessibilityLabel="Logo da aplicação"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	image: {
		width: "60%",
		height: undefined,
		aspectRatio: 1.3,
	},
	titulo: {
		justifyContent: "center",
		alignItems: "center",
	},
});