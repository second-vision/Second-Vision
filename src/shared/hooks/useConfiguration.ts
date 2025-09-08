import { AccessibilityInfo } from "react-native";

type ConfigurationProps = {
  speakEnabled: boolean;
  toggleSpeak: () => void;
  setFontSize: (size: number) => void;
};

export function useConfiguration({
  speakEnabled,
  toggleSpeak,
  setFontSize,
}: ConfigurationProps) {
  const handleFontSizeChange = (value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setFontSize(newValue);
    if (speakEnabled) {
      AccessibilityInfo.announceForAccessibility(
        `Tamanho da fonte: ${newValue}`
      );
    }
  };

  const handleSpeakToggle = (value: boolean) => {
    toggleSpeak();
    AccessibilityInfo.announceForAccessibility(
      `Guiamento sonoro ${value ? "ativado" : "desativado"}`
    );
  };

  const resetSettings = () => {
    setFontSize(16);
    if (!speakEnabled) toggleSpeak();
    AccessibilityInfo.announceForAccessibility("Configurações redefinidas");
  };

  return {
    handleFontSizeChange,
    handleSpeakToggle,
    resetSettings,
  };
}
