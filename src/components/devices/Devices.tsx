import React from "react";
import {  useRoute } from "@react-navigation/native";
import {
  View,
  Image,
  Dimensions,
} from "react-native";
import { styles } from "./style";
const { width } = Dimensions.get("window");
export function Devices() {
  const route = useRoute();

  return (
    <View style={styles.titulo}>
      <Image
        source={require("../../assets/images/Logo.png")}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel="Logo da aplicação"
      />
    </View>
  );
}
