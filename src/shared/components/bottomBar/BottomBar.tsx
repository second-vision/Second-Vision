import React from "react";
import { View, TouchableOpacity } from "react-native";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "../../styles";
import { usePathname, useRouter } from "expo-router";

interface IBottomBarProps {
  interval: number | null;
  mode: number | null;
  hostspot: number | null;
  deviceInfo: string | null;
}

export const BottomBar: React.FC<IBottomBarProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (screenName: string) => pathname === screenName;

  return (
    <View style={styles.bottomNav}>
      {/* Home */}
      <TouchableOpacity
        style={[
          styles.navItem,
          isActive("/home-stack") && {
            backgroundColor: theme.colors.primary,
            borderRadius: 30,
          },
        ]}
        onPress={() => router.navigate("/home-stack")}
        accessibilityLabel="Página inicial"
        accessibilityHint="Navega para a tela principal"
      >
        <Ionicons
          name={isActive("/home-stack") ? "home" : "home-outline"}
          color={
            isActive("HomeStack")
              ? theme.colors.background
              : theme.colors.primary
          }
          size={30}
        />
      </TouchableOpacity>

      {/* Interval */}
      <TouchableOpacity
        style={[
          styles.navItem,
          isActive("Iinterval-time-stack") && {
            backgroundColor: theme.colors.primary,
            borderRadius: 30,
          },
        ]}
        onPress={() => router.navigate("/interval-time-stack")}
        accessibilityLabel="Intervalo de fala"
        accessibilityHint="Navega para a tela de definição de intervalo"
      >
        <Ionicons
          name={isActive("interval-time-stack") ? "timer" : "timer-outline"}
          color={
            isActive("interval-time-stack")
              ? theme.colors.background
              : theme.colors.primary
          }
          size={30}
        />
      </TouchableOpacity>

      {/* Mode */}
      <TouchableOpacity
        style={[
          styles.navItem,
          isActive("operation-mode-stack") && {
            backgroundColor: theme.colors.primary,
            borderRadius: 30,
          },
        ]}
        onPress={() => router.navigate("/operation-mode-stack")}
        accessibilityLabel="Modo de operação"
        accessibilityHint="Navega para a tela de modos de operação"
      >
        {isActive("operation-mode-stack") ? (
          <MaterialCommunityIcons
            name="pencil"
            size={30}
            color={theme.colors.background}
          />
        ) : (
          <SimpleLineIcons
            name="pencil"
            size={28}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity
        style={[
          styles.navItem,
          isActive("settings-stack") && {
            backgroundColor: theme.colors.primary,
            borderRadius: 30,
          },
        ]}
        onPress={() => router.navigate("/settings-stack")}
        accessibilityLabel="Configurações"
        accessibilityHint="Navega para a tela de configurações"
      >
        <Ionicons
          name={isActive("settings-stack") ? "settings" : "settings-outline"}
          color={
            isActive("SettingsStack")
              ? theme.colors.background
              : theme.colors.primary
          }
          size={30}
        />
      </TouchableOpacity>
    </View>
  );
};
