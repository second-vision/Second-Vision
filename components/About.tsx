import React from "react";
import {
	Text,
	View,
	Image,
	StyleSheet,
	TouchableOpacity,
	Modal,
	Dimensions,
	FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AboutProps {
	visible: boolean;
	onClose: () => void;
}
const { width } = Dimensions.get("window");
const numColumns = width > 600 ? 3 : 2; 

export const About: React.FC<AboutProps> = ({ visible, onClose }) => {

	const itens = [
		'Modo Híbrido: identifica tanto objetos possivelmente perigosos quanto textos estáticos.',
		'Modo Objeto: identifica apenas objetos.',
		'Modo Texto: identifica apenas textos estáticos.',
	  ];

	  const itensOBJ = [
		{ id: '1', texto: 'Pessoa' },
		{ id: '2', texto: 'Bicicleta' },
		{ id: '3', texto: 'Carro' },
		{ id: '4', texto: 'Moto' },
		{ id: '5', texto: 'Ônibus' },
		{ id: '6', texto: 'Trem' },
		{ id: '7', texto: 'Caminhão' },
		{ id: '8', texto: 'Semáforo' },
		{ id: '9', texto: 'Placa de Pare' },
		{ id: '10', texto: 'Hidrante' },

	  ];

	  const renderItem = ({ item }: any) => (
		<View style={styles.itemContainerFlat}>
		  <Text style={styles.bullet}>{'\u2022'}</Text>
		  <Text style={styles.itemText}>{item.texto}</Text>
		</View>
	  );
	

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
			accessibilityViewIsModal={true} 
		>
			<View style={styles.modalContainer}>
				<TouchableOpacity
					style={[{ position: "absolute" }, { top: 20 }, { left: 20 }]}
					onPress={onClose}
					accessibilityLabel="Fechar"
					accessibilityHint="Fecha o modal sobre informações"
				>
					<Ionicons name="close-circle-outline" size={30} color="black" />
				</TouchableOpacity>
				<View style={styles.modalInfo}>
					<Image
						//source={require("../../assets/images/LogoPreta.png")}
						style={styles.imageSessaoInfo}
						resizeMode="contain"
						accessibilityLabel="Logo"
						accessibilityHint="Logo do aplicativo"
					/>
				</View>
				<View style={styles.textInfo}>
					<Text style={styles.textTitle} accessibilityRole="text">Tutorial de uso do sistema.</Text>
					<Text accessibilityRole="text">
					Primeiro, certifique-se de que a câmera está conectada ao dispositivo e que a bateria está carregada. 
					Em seguida, pressione o botão para ligá-lo. Dentro do aplicativo, clique no botão de escanear Bluetooth para encontrar o dispositivo. 
					Se os passos anteriores foram realizados corretamente, ele exibirá o dispositivo para conexão. 
					Basta clicar para se conectar. Após isso, você estará na tela principal de controle do dispositivo e no recebimento das informações.
					</Text>
					<Text style={styles.line} />
					<Text accessibilityRole="text">
					No rodapé da tela, você encontrará opções para regular o intervalo da fala das informações e para alterar o modo de operação do sistema. Existem três modos disponíveis:
					</Text>
					{itens.map((item, index) => (
						<View key={index} style={styles.itemContainer}>
						<Text accessibilityRole="text" style={styles.bullet}>{'\u2022'}</Text>
						<Text accessibilityRole="text" style={styles.itemText}>{item}</Text>
						</View>
					))}
					<Text style={styles.line} />
					<Text accessibilityRole="text">
					Na tela principal, são exibidas informações sobre o sistema, como a porcentagem restante da bateria do dispositivo físico, se o sistema está ligado ou desligado, o tempo de intervalo de fala e o modo de operação ativo no momento. 
					Abaixo encontra-se uma lista dos objetos que o nosso sistema identifica.
					</Text>
					<FlatList
							data={itensOBJ}
							renderItem={renderItem}
							keyExtractor={(item) => item.id}
							numColumns={numColumns} 
							contentContainerStyle={styles.container}
							accessibilityRole="text"
							/>
					<Text style={styles.line} />
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	
	container: {
		padding: 10,
	  }
	,imageSessaoInfo: {
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
	textTitle:{
		fontWeight: "bold",
		fontSize: width * 0.04, 
		marginBottom: 10,
	},
	itemContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginTop: 10,
	  },
	  bullet: {
		fontSize:width * 0.04,
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
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		flex: 1, 
		fontWeight: "bold",
		
	  },
});