import React from "react";
import { Text, View, Pressable, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Device } from "react-native-ble-plx";

const { width } = Dimensions.get("window");

interface HeaderProps {
	toggleMenu: () => void;
	props: string;
	sendShutdownCommand: (device: Device) => void;
	device: Device | null;
}

export const Header: React.FC<HeaderProps> = ({ toggleMenu, props, sendShutdownCommand, device  }) => {
	const navigation = useNavigation();
	const route = useRoute();

	const handleShutdownCommand = async () => {
		if(device){
		await sendShutdownCommand(device);
		}
	  };

	if (route.name == "BluetoothOn") {
		return (
			<View style={[styles.headerOptions]}>
				<Pressable 
					onPress={toggleMenu}
					style={[styles.information,  ]}
					accessibilityLabel="Abrir menu de informações"
					accessibilityRole="button"
          
				>
					<Ionicons
						name="information-circle-outline"
						size={35}
						color="#001268"
						style={[styles.information2]}
					/>
				</Pressable>
				<Text style={[styles.textFont,]}>{props}</Text>
        <Text style={[styles.information,]}></Text>
			</View>
		);

	}else if (route.name == "Home"){
	
		return (
			<View style={[styles.headerOptions]}>
				<Pressable 
					onPress={toggleMenu}
					style={[styles.information,  ]}
					accessibilityLabel="Abrir menu de informações"
					accessibilityRole="button"
          
				>
					<Ionicons
						name="information-circle-outline"
						size={35}
						color="#001268"
						style={[styles.information2]}
					/>
				</Pressable>
				<Text style={[styles.textFont,]}>{props}</Text>
					<Pressable 
					style={[styles.information3,  ]}
					onPress={handleShutdownCommand}
					accessibilityLabel="Desligar Sistema"
					accessibilityRole="button">
					<Ionicons name="power" size={32} color="#001268" />
					</Pressable>
			</View>
		);}else{
			return (
				<View style={[styles.headerOptions]}>
					<Pressable 
						onPress={toggleMenu}
						style={[styles.information,  ]}
						accessibilityLabel="Abrir menu de informações"
						accessibilityRole="button"
			  
					>
						<Ionicons
							name="information-circle-outline"
							size={35}
							color="#001268"
							style={[styles.information2]}
						/>
					</Pressable>
					<Text style={[styles.textFont,]}>{props}</Text>
					<Text style={[styles.information,]}></Text>
				</View>
			);
		}
	
};

const styles = StyleSheet.create({
	headerOptions: {
		flexDirection: "row",
    	justifyContent: 'space-between',
		alignItems: "center",
    	paddingHorizontal: 20,
		top: 10
	},
	information: {
    	width: '25%',
		alignSelf: "flex-start",
	},
	information2: {
		alignSelf: "flex-start",
	},
	information3:{
		width: '25%',
		alignSelf: "flex-start",
		alignItems: "flex-end"
	},
	textFont: {
    	width: '49%',
    	textAlign: 'center',
		fontWeight: "bold",
		fontSize: width * 0.05,
		color: "#001268",
	},

});