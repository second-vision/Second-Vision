import React from "react";
import { View, TouchableOpacity } from "react-native";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from "../../styles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NavigationProp } from "@/app/types/types";

interface IBottomBarProps {
  interval: number | null;
  mode: number | null;
  hostspot: number | null;
  deviceInfo: string | null;
}

export const BottomBar: React.FC<IBottomBarProps> = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const isActive = (screenName: string) => route.name === screenName;

  return (
    <View style={styles.bottomNav}>
      {/* Home */}
      <TouchableOpacity
        style={[
          styles.navItem,
          isActive("HomeStack") && { backgroundColor: theme.colors.primary, borderRadius: 30 },
        ]}
        onPress={() => navigation.navigate("HomeStack")}
        accessibilityLabel="Página inicial"
        accessibilityHint="Navega para a tela principal"
      >
        <Ionicons
          name={isActive("HomeStack") ? "home" : "home-outline"}
          color={isActive("HomeStack") ? theme.colors.background : theme.colors.primary}
          size={30}
        />
      </TouchableOpacity>

      {/* Interval */}
      <TouchableOpacity
        style={[
          styles.navItem,
          isActive("IntervalTimeStack") && { backgroundColor: theme.colors.primary, borderRadius: 30 },
        ]}
        onPress={() => navigation.navigate("IntervalTimeStack")}
        accessibilityLabel="Intervalo de fala"
        accessibilityHint="Navega para a tela de definição de intervalo"
      >
        <Ionicons
          name={isActive("IntervalTimeStack") ? "timer" : "timer-outline"}
          color={isActive("IntervalTimeStack") ? theme.colors.background : theme.colors.primary}
          size={30}
        />
      </TouchableOpacity>

      {/* Mode */}
      <TouchableOpacity
        style={[
          styles.navItem,
          isActive("OperationModeStack") && { backgroundColor: theme.colors.primary, borderRadius: 30 },
        ]}
        onPress={() => navigation.navigate("OperationModeStack")}
        accessibilityLabel="Modo de operação"
        accessibilityHint="Navega para a tela de modos de operação"
      >
        <MaterialCommunityIcons
          name={isActive("SettingsStack") ? "pencil-outline" : "pencil"}
          size={30}
          color={isActive("OperationModeStack") ? theme.colors.background : theme.colors.primary}
        />
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity
        style={[
          styles.navItem,
          isActive("SettingsStack") && { backgroundColor: theme.colors.primary, borderRadius: 30 },
        ]}
        onPress={() => navigation.navigate("SettingsStack")}
        accessibilityLabel="Configurações"
        accessibilityHint="Navega para a tela de configurações"
      >
        <Ionicons
          name={isActive("SettingsStack") ? "settings" : "settings-outline"}
          color={isActive("SettingsStack") ? theme.colors.background : theme.colors.primary}
          size={30}
        />
      </TouchableOpacity>
    </View>
  );
};
