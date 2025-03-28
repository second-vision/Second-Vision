import { useNavigation, useRoute } from "@react-navigation/native";
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import { styles } from "./styles";
const { width } = Dimensions.get("window");
export const Devices = () => {
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
};
