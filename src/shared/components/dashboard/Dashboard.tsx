import { View, SafeAreaView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import React from "react";
import { useHomePropsContext } from "../../context";
import { FontSizes } from "@/src/shared/constants/fontSizes";
import { AppText } from "../appText/AppText";
import { theme } from "../../styles";
interface DashboardProps {
  isOn: boolean;
  intervalDash: number;
  batteryLevel: number;
  currentModeIndex: number;
  handleClickForRPi0: () => void;
  currentMode: {
    name: string;
    description: string;
  };
  currentHostspot: {
    name: string;
    description: string;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({
  isOn,
  intervalDash,
  batteryLevel,
  currentMode,
  currentHostspot,
  handleClickForRPi0,
}) => {
  let batteryIcon: any;
  if (batteryLevel === 100) {
    batteryIcon = "battery-full-outline";
  } else if (batteryLevel >= 50) {
    batteryIcon = "battery-half-outline";
  } else {
    batteryIcon = "battery-dead-outline";
  }
  const { deviceInfo } = useHomePropsContext();

  const systemIcon = isOn
    ? require("../../assets/images/on_icon.png")
    : require("../../assets/images/off_icon.png");

  return (
    <SafeAreaView>
      <View style={styles.dashboard}>
        <AppText baseSize={FontSizes.Large} style={styles.dashboardTitle} accessibilityRole="header">
          Estatísticas de Uso
        </AppText>

        <View style={styles.campos} accessibilityRole="summary">
          <View style={styles.info}>
            <Ionicons
              name={batteryIcon}
              size={35}
              color={theme.colors.primary}
              accessibilityLabel="Ícone da Bateria"
            />
            <AppText
            baseSize={FontSizes.Large}
              style={styles.nivel}
              accessibilityLabel={`Bateria: ${batteryLevel}%`}
              accessibilityRole="text"
            >
              {batteryLevel}%
            </AppText>
            <AppText baseSize={FontSizes.Normal} accessibilityRole="text">Bateria</AppText>
          </View>

          <View style={styles.info}>
            <Image
              source={systemIcon}
              style={[{ width: 36, height: 36 }]}
              accessibilityLabel={isOn ? "Sistema ligado" : "Sistema desligado"}
            />
            <AppText
              baseSize={FontSizes.Large}
              style={styles.nivel}
              accessibilityLabel={`Sistema: ${isOn ? "Ligado" : "Desligado"}`}
              accessibilityRole="text"
            >
              {isOn ? "Ligado" : "Desligado"}
            </AppText>
            <AppText baseSize={FontSizes.Normal} accessibilityRole="text">Sistema</AppText>
          </View>

          <View style={styles.info}>
            <Image
              source={require("../../assets/images/timer_icon.png")}
              style={[{ width: 30, height: 35 }]}
              accessibilityLabel="Ícone do temporizador"
            />
            <AppText
              baseSize={FontSizes.Large}
              style={styles.nivel}
              accessibilityRole="text"
              accessibilityLabel={`Intervalo: ${intervalDash / 1000} segundos`}
            >
              {intervalDash / 1000}s
            </AppText>
            <AppText baseSize={FontSizes.Normal} style={styles.category} accessibilityRole="text">
              Intervalo
            </AppText>
          </View>
        </View>
        <View style={styles.operationMode}>
          <AppText baseSize={FontSizes.Large} style={styles.dashboardTitle} accessibilityRole="header">
            Modo de Operação
          </AppText>
          <View
            style={styles.operationCard}
            accessible={true}
            accessibilityLabel={`${currentMode.name}. ${currentMode.description}`}
          >
            <AppText baseSize={FontSizes.Normal} style={styles.cardTitle} accessibilityRole="text">
              {currentMode.name}
            </AppText>
            <AppText baseSize={FontSizes.Small} style={styles.cardText} accessibilityRole="text">
              {currentMode.description}
            </AppText>
          </View>
        </View>
        {deviceInfo?.model === "RPi-0" ? (
          <TouchableOpacity
            style={styles.operationMode}
            onPress={() => handleClickForRPi0()}
            activeOpacity={0.8}
          >
            <AppText baseSize={FontSizes.Large} style={styles.dashboardTitle} accessibilityRole="header">
              Modo de Conexão
            </AppText>
            <View
              style={styles.operationCard}
              accessible={true}
              accessibilityLabel={`${currentHostspot.name}. ${currentHostspot.description}`}
            >
              <AppText baseSize={FontSizes.Normal} style={styles.cardTitle} accessibilityRole="text">
                {currentHostspot.name}
              </AppText>
              <AppText baseSize={FontSizes.Small} style={styles.cardText} accessibilityRole="text">
                {currentHostspot.description}
              </AppText>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.operationMode}>
            <AppText baseSize={FontSizes.Large} style={styles.dashboardTitle} accessibilityRole="header">
              Modo de Conexão
            </AppText>
            <View
              style={styles.operationCard}
              accessible={true}
              accessibilityLabel={`${currentHostspot.name}. ${currentHostspot.description}`}
            >
              <AppText baseSize={FontSizes.Normal} style={styles.cardTitle} accessibilityRole="text">
                {currentHostspot.name}
              </AppText>
              <AppText baseSize={FontSizes.Small} style={styles.cardText} accessibilityRole="text">
                {currentHostspot.description}
              </AppText>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
