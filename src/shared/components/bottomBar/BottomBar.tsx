import React from "react";
import { View, TouchableOpacity } from "react-native";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@/app/types/types";
//import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
//import FontAwesome from '@expo/vector-icons/FontAwesome';
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

interface IBottomBarProps {
  interval: number | null;
  mode: number | null;
  hostspot: number | null;
  deviceInfo: string | null;
}

export const BottomBar: React.FC<IBottomBarProps> = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("HomeStack")}
          accessibilityLabel="Página inicial"
          accessibilityHint="Navega para a tela principal"
        >
          <Ionicons name="home-outline" color={"#0A398A"} size={30} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("IntervalTimeStack")}
          accessibilityLabel="Intervalo de fala"
          accessibilityHint="Navega para a tela de definição de intervalo"
        >
          <Ionicons name="timer-outline" color={"#0A398A"} size={30} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("OperationModeStack")}
          accessibilityLabel="Modo de operação"
          accessibilityHint="Navega para a tela de modos de operação"
        >
          <SimpleLineIcons name="pencil" size={28} color={"#0A398A"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("SettingsStack")}
          accessibilityLabel="Configurações"
          accessibilityHint="Navega para a tela de configurações"
        >
          <Ionicons name="settings-outline" color={"#0A398A"} size={30} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
