import { View, Text, SafeAreaView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import React from "react";
import { useHomePropsContext } from "../../context";



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
  handleClickForRPi0
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
        <Text style={styles.dashboardTitle} accessibilityRole="header">
          Estatísticas de Uso
        </Text>

        <View style={styles.campos} accessibilityRole="summary">
          <View style={styles.info}>
            <Ionicons
              name={batteryIcon}
              size={35}
              color="#001268"
              accessibilityLabel="Ícone da Bateria"
            />
            <Text
              style={styles.nivel}
              accessibilityLabel={`Bateria: ${batteryLevel}%`}
              accessibilityRole="text"
            >
              {batteryLevel}%
            </Text>
            <Text accessibilityRole="text">Bateria</Text>
          </View>

          <View style={styles.info}>
            <Image
              source={systemIcon}
              style={[{ width: 36, height: 36 }]}
              accessibilityLabel={isOn ? "Sistema ligado" : "Sistema desligado"}
            />
            <Text
              style={styles.nivel}
              accessibilityLabel={`Sistema: ${isOn ? "Ligado" : "Desligado"}`}
              accessibilityRole="text"
            >
              {isOn ? "Ligado" : "Desligado"}
            </Text>
            <Text accessibilityRole="text">Sistema</Text>
          </View>

          <View style={styles.info}>
            <Image
              source={require("../../assets/images/timer_icon.png")}
              style={[{ width: 30, height: 35 }]}
              accessibilityLabel="Ícone do temporizador"
            />
            <Text
              style={styles.nivel}
              accessibilityRole="text"
              accessibilityLabel={`Intervalo: ${intervalDash / 1000} segundos`}
            >
              {intervalDash / 1000}s
            </Text>
            <Text style={styles.category} accessibilityRole="text">
              Intervalo
            </Text>
          </View>
        </View>
        <View style={styles.operationMode}>
          <Text style={styles.dashboardTitle} accessibilityRole="header">
            Modo de Operação
          </Text>
          <View
            style={styles.operationCard}
            accessible={true}
            accessibilityLabel={`${currentMode.name}. ${currentMode.description}`}
          >
            <Text style={styles.cardTitle} accessibilityRole="text">
              {currentMode.name}
            </Text>
            <Text style={styles.cardText} accessibilityRole="text">
              {currentMode.description}
            </Text>
          </View>
        </View>
        {deviceInfo?.model === "RPi-0" ? (
          <TouchableOpacity
            style={styles.operationMode}
            onPress={() => handleClickForRPi0()}
            activeOpacity={0.8}
          >
            <Text style={styles.dashboardTitle} accessibilityRole="header">
              Modo de Conexão
            </Text>
            <View
              style={styles.operationCard}
              accessible={true}
              accessibilityLabel={`${currentHostspot.name}. ${currentHostspot.description}`}
            >
              <Text style={styles.cardTitle} accessibilityRole="text">
                {currentHostspot.name}
              </Text>
              <Text style={styles.cardText} accessibilityRole="text">
                {currentHostspot.description}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.operationMode}>
            <Text style={styles.dashboardTitle} accessibilityRole="header">
              Modo de Conexão
            </Text>
            <View
              style={styles.operationCard}
              accessible={true}
              accessibilityLabel={`${currentHostspot.name}. ${currentHostspot.description}`}
            >
              <Text style={styles.cardTitle} accessibilityRole="text">
                {currentHostspot.name}
              </Text>
              <Text style={styles.cardText} accessibilityRole="text">
                {currentHostspot.description}
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
