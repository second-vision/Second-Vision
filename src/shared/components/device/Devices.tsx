import { View, Image } from "react-native";
import { styles } from "./styles";

export const Devices = () => {
  return (
    <View style={styles.titulo}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel="Logo da aplicação"
      />
    </View>
  );
};
