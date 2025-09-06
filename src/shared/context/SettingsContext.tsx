// src/shared/context/SettingsContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsContextType = {
  speakEnabled: boolean;
  toggleSpeak: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [fontSize, setFontSizeState] = useState(16);

  // Carrega configurações salvas
  useEffect(() => {
    const loadSettings = async () => {
      const speakValue = await AsyncStorage.getItem("@speakEnabled");
      const fontValue = await AsyncStorage.getItem("@fontSize");
      if (speakValue !== null) setSpeakEnabled(speakValue === "true");
      if (fontValue !== null) setFontSizeState(Number(fontValue));
    };
    loadSettings();
  }, []);

  const toggleSpeak = async () => {
    const newValue = !speakEnabled;
    setSpeakEnabled(newValue);
    await AsyncStorage.setItem("@speakEnabled", String(newValue));
  };

  const setFontSize = async (size: number) => {
    setFontSizeState(size);
    await AsyncStorage.setItem("@fontSize", String(size));
  };

  return (
    <SettingsContext.Provider
      value={{ speakEnabled, toggleSpeak, fontSize, setFontSize }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useSettings must be used inside SettingsProvider");
  return context;
};
