import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  SectionList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { AppText } from "../appText/AppText";
import { FontSizes } from "@/src/shared/constants/fontSizes";
import { theme } from "../../styles";
interface AboutProps {
  visible: boolean;
  onClose: () => void;
}

export const About: React.FC<AboutProps> = ({ visible, onClose }) => {
  const itens = [
    "Modo Híbrido: identifica tanto objetos possivelmente perigosos quanto textos estáticos.",
    "Modo Objeto: identifica apenas objetos.",
    "Modo Texto: identifica apenas textos estáticos.",
  ];

  const itensOBJOffline = [
    { id: "1", texto: "Pessoa" },
    { id: "2", texto: "Bicicleta" },
    { id: "3", texto: "Carro" },
    { id: "4", texto: "Moto" },
    { id: "5", texto: "Ônibus" },
    { id: "6", texto: "Trem" },
    { id: "7", texto: "Caminhão" },
    { id: "8", texto: "Semáforo" },
    { id: "9", texto: "Placa de Pare" },
    { id: "10", texto: "Hidrante" },
  ];

  const itensOBJOnline = [
    { id: "1", texto: "Pessoa" },
    { id: "2", texto: "Bicicleta" },
    { id: "3", texto: "Carro" },
    { id: "4", texto: "Moto" },
    { id: "5", texto: "Ônibus" },
    { id: "6", texto: "Trem" },
    { id: "7", texto: "Caminhão" },
    { id: "8", texto: "Semáforo" },
    { id: "9", texto: "Placa de Pare" },
    { id: "10", texto: "Hidrante" },
  ];

  const splitInPairs = (data: any[]) => {
    const pairs: any[] = [];
    for (let i = 0; i < data.length; i += 2) {
      pairs.push(data.slice(i, i + 2));
    }
    return pairs;
  };

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
          style={{ position: "absolute", top: 32, left: 20 }}
          onPress={onClose}
          accessibilityLabel="Fechar"
          accessibilityHint="Fecha o modal sobre informações"
        >
          <Ionicons name="close-circle-outline" size={30} color={theme.colors.black} />
        </TouchableOpacity>

        <View style={styles.modalInfo}>
          <Image
            source={require("../../assets/images/logo_preta.png")}
            style={styles.imageSessaoInfo}
            resizeMode="contain"
            accessibilityLabel="Logo"
            accessibilityHint="Logo do aplicativo"
          />
        </View>

        <SectionList
          sections={[
            {
              title: "Objetos do modo offline",
              data: splitInPairs(itensOBJOffline),
            },
            {
              title: "Objetos do modo online",
              data: splitInPairs(itensOBJOnline),
            },
          ]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row" }}>
              {item.map((obj: any) => (
                <View key={obj.id} style={styles.itemContainerFlat}>
                  <AppText baseSize={FontSizes.Normal} style={styles.bullet}>{"\u2022"}</AppText>
                  <AppText baseSize={FontSizes.Small}style={styles.itemText}>{obj.texto}</AppText>
                </View>
              ))}
            </View>
          )}
          renderSectionHeader={({ section }) => (
            <View>
              <AppText style={styles.line} />
              <AppText baseSize={FontSizes.Normal} style={styles.textTitle}>{section.title}</AppText>
            </View>
          )}
          contentContainerStyle={styles.modalScrollContainer}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View>
              <AppText baseSize={FontSizes.Normal} style={styles.textTitle} accessibilityRole="header">
                Tutorial de uso do sistema.
              </AppText>
              <AppText baseSize={FontSizes.Small} accessibilityRole="text">
                Primeiro, certifique-se de que a câmera está conectada ao
                dispositivo e que a bateria está carregada. Em seguida, acione a
                alavanca fisica para ligá-lo. Dentro do aplicativo, habilite o
                Bluetooth caso não esteja ativo, clique no botão de escanear
                Bluetooth para encontrar o dispositivo. Se os passos anteriores
                foram realizados corretamente, ele exibirá o dispositivo para
                conexão. Basta clicar para se conectar. Após isso, você estará
                na tela principal de controle do dispositivo e no recebimento
                das informações.
              </AppText>
              <AppText style={styles.line} />
              <AppText baseSize={FontSizes.Small} accessibilityRole="text">
                No rodapé da tela, você encontrará opções para regular o
                intervalo da fala das informações e para alterar o modo de
                operação do sistema. Existem três modos disponíveis:
              </AppText>
              <View accessibilityRole="list">
                {itens.map((item, index) => (
                  <View
                    key={index}
                    style={styles.itemContainer}
                    accessible={true}
                  >
                    <AppText baseSize={FontSizes.Normal} accessibilityRole="text" style={styles.bullet}>
                      {"\u2022"}
                    </AppText>
                    <AppText baseSize={FontSizes.Small} accessibilityRole="text" style={styles.itemText}>
                      {item}
                    </AppText>
                  </View>
                ))}
              </View>
              <AppText style={styles.line} />
              <AppText baseSize={FontSizes.Small} accessibilityRole="text">
                Na tela principal, são exibidas informações sobre o sistema,
                como a porcentagem restante da bateria do dispositivo físico, se
                o sistema está ligado ou desligado, o tempo de intervalo de
                fala, o modo de operação ativo no momento e o modo de
                processamento, que pode ser online ou offline, o online
                necessita de internet pois utiliza um identificador hospedado em
                nuvem, a vantagem desse modo é a alta variedade de objetos.
              </AppText>
            </View>
          }
        />
      </View>
    </Modal>
  );
};
