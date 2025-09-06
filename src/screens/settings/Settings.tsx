import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  AccessibilityInfo,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { About, BottomBar, Devices, Header } from "@/src/shared/components";
import { useHomePropsContext, useMenu } from "@/src/shared/context";

export const Settings = () => {
  const { interval, mode, hostspot, deviceInfo } = useHomePropsContext();
  const [fontSize, setFontSize] = React.useState(16);
  const [speakEnabled, setSpeakEnabled] = React.useState(false);
  const { isMenuOpen, toggleMenu, closeMenu } = useMenu();

  // Atualiza tamanho da fonte e anuncia para usuário com deficiência visual
  const handleFontSizeChange = (value: number) => {
    setFontSize(value);
    if (speakEnabled) {
      AccessibilityInfo.announceForAccessibility(`Tamanho da fonte: ${value}`);
    }
  };

  const handleSpeakToggle = (value: boolean) => {
    setSpeakEnabled(value);
    AccessibilityInfo.announceForAccessibility(
      `Guiamento sonoro ${value ? "ativado" : "desativado"}`
    );
  };

  const sendShutdownCommand = () => {};
  const resetSettings = () => {
    setFontSize(16);
    setSpeakEnabled(false);
    AccessibilityInfo.announceForAccessibility("Configurações redefinidas");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header
          toggleMenu={toggleMenu}
          props="Second Vision"
          sendShutdownCommand={sendShutdownCommand}
          device={null}
        />
        <Devices />

        <View style={styles.containerConfig}>
          {/* Tamanho da Fonte */}
          <Text
            style={[styles.title, { fontSize }]}
            accessibilityRole="header"
            accessibilityLabel={`Tamanho da fonte atual: ${fontSize}`}
          >
            Tamanho da fonte
          </Text>
          <Text style={styles.subtitle}>
            Aumente ou diminua o texto conforme sua preferência.
          </Text>

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>−</Text>
            <Slider
              style={styles.slider}
              minimumValue={12}
              maximumValue={24}
              step={1}
              value={fontSize}
              onValueChange={handleFontSizeChange}
              minimumTrackTintColor="#0a398a"
              maximumTrackTintColor="#DADADA"
              thumbTintColor="#0a398a"
              accessibilityRole="adjustable"
              accessibilityLabel="Ajustar tamanho da fonte"
              accessibilityHint="Arraste para aumentar ou diminuir o tamanho do texto"
            />
            <Text style={styles.sliderLabel}>+</Text>
          </View>

          {/* Guiamento Sonoro */}
          <View style={styles.section}>
            <View style={{ width: "80%" }}>
              <Text style={styles.title}>Guiamento Sonoro</Text>
              <Text style={styles.subtitle}>
                Ative ou desative o guiamento sonoro que narra o fluxo de uso do
                sistema.
              </Text>
            </View>
            <Switch
              style={{
                transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
              }}
              value={speakEnabled}
              onValueChange={handleSpeakToggle}
              thumbColor={speakEnabled ? "#0a398a" : "#f4f3f4"}
              trackColor={{ false: "#d3d3d3", true: "#d3d3d3" }}
              accessibilityRole="switch"
              accessibilityLabel="Guiamento sonoro"
              accessibilityHint="Ative ou desative a narração do sistema"
            />
          </View>

          {/* Botão de Redefinir */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetSettings}
            accessibilityRole="button"
            accessibilityLabel="Redefinir configurações"
            accessibilityHint="Reinicia tamanho da fonte e guiamento sonoro"
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.resetText}>Redefinir configurações</Text>
          </TouchableOpacity>
        </View>

        <About visible={isMenuOpen} onClose={closeMenu} />
      </ScrollView>

      <BottomBar
        mode={mode}
        hostspot={hostspot}
        interval={interval}
        deviceInfo={deviceInfo?.model!}
      />
    </SafeAreaView>
  );
};
