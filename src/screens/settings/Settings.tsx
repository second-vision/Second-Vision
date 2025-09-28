import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  AccessibilityInfo,
  ActivityIndicator,
} from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { theme } from "../../shared/styles";
import {
  About,
  AppText,
  BottomBar,
  Devices,
  Header,
} from "@/src/shared/components";
import {
  useHomePropsContext,
  useMenu,
  useSettings,
} from "@/src/shared/context";
import { useConfiguration } from "@/src/shared/hooks";
import { FontSizes } from "@/src/shared/constants/fontSizes";

export const Settings = () => {
  const { interval, mode, hostspot, deviceInfo } = useHomePropsContext();
  const { isMenuOpen, toggleMenu } = useMenu();
  const { speakEnabled, fontSize, setFontSize, loading, toggleSpeak } =
    useSettings();
  const { resetSettings, handleFontSizeChange, handleSpeakToggle } =
    useConfiguration({
      speakEnabled,
      toggleSpeak,
      setFontSize,
    });

  const sendShutdownCommand = () => {};

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

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
          <AppText
            baseSize={FontSizes.Normal}
            style={styles.title}
            accessibilityRole="header"
            accessibilityLabel={`Tamanho da fonte atual: ${fontSize}`}
          >
            Tamanho da fonte
          </AppText>
          <AppText baseSize={FontSizes.Small} style={[styles.subtitle]}>
            Aumente ou diminua o texto conforme sua preferência.
          </AppText>

          <View style={styles.sliderRow}>
            {/* Botão para decrementar */}
            <View style={{ width: "10%" }}>
              <TouchableOpacity
                onPress={() => {
                  const newValue = Math.max(fontSize - 1, 12); // limite mínimo
                  setFontSize(newValue);
                  if (speakEnabled) {
                    AccessibilityInfo.announceForAccessibility(
                      `Tamanho da fonte: ${newValue}`
                    );
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="Diminuir tamanho da fonte"
              >
                <Text style={styles.sliderLabel}>−</Text>
              </TouchableOpacity>
            </View>
            {/* Wrapper acessível */}
            <View
              style={{ flex: 1 }}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel="Ajustar tamanho da fonte"
              accessibilityHint="Arraste para aumentar ou diminuir o tamanho do texto"
              accessibilityValue={{ min: 12, max: 24, now: fontSize }}
            >
              <Slider
                value={fontSize}
                onValueChange={handleFontSizeChange}
                minimumValue={12}
                maximumValue={24}
                step={1}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.closeButton}
                thumbTintColor={theme.colors.primary}
                containerStyle={styles.slider}
              />
            </View>

            {/* Botão para incrementar */}
            <View style={{ width: "10%" }}>
              <TouchableOpacity
                onPress={() => {
                  const newValue = Math.min(fontSize + 1, 24); // limite máximo
                  setFontSize(newValue);
                  if (speakEnabled) {
                    AccessibilityInfo.announceForAccessibility(
                      `Tamanho da fonte: ${newValue}`
                    );
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="Aumentar tamanho da fonte"
              >
                <Text style={[styles.sliderLabel, styles.mais]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guiamento Sonoro */}
          <View style={styles.section}>
            <View style={{ width: "80%" }}>
              <AppText baseSize={FontSizes.Normal} style={styles.title}>
                Guiamento Sonoro
              </AppText>
              <AppText baseSize={FontSizes.Small} style={styles.subtitle}>
                Ative ou desative o guiamento sonoro que narra o fluxo de uso do
                sistema.
              </AppText>
            </View>
            <Switch
              style={{
                transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
              }}
              value={speakEnabled}
              onValueChange={handleSpeakToggle}
              thumbColor={
                speakEnabled
                  ? theme.colors.primary
                  : theme.colors.backgroundVariant
              }
              trackColor={{ false: theme.colors.line, true: theme.colors.line }}
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
            <Ionicons
              name="refresh"
              size={20}
              color={theme.colors.background}
            />
            <AppText baseSize={FontSizes.Normal} style={styles.resetText}>
              Redefinir configurações
            </AppText>
          </TouchableOpacity>
        </View>

        <About visible={isMenuOpen} onClose={toggleMenu} />
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
