// src/shared/context/SettingsContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsContextType = {
  speakEnabled: boolean;
  toggleSpeak: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  loading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [fontSize, setFontSizeState] = useState(16);
  const [loading, setLoading] = useState(true);

  // Carrega configurações ao iniciar
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const speakValue = await AsyncStorage.getItem("@speakEnabled");
        const fontValue = await AsyncStorage.getItem("@fontSize");
        if (speakValue !== null) {
          setSpeakEnabled(speakValue === "true");
        } else {
          await AsyncStorage.setItem("speakEnabled", "true");
        }
        if (fontValue !== null) setFontSizeState(Number(fontValue));
      } catch (error) {
        console.warn("Erro ao carregar configurações:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Salva speakEnabled automaticamente sempre que mudar
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem("@speakEnabled", String(speakEnabled));
    }
  }, [speakEnabled, loading]);

  // Salva fontSize automaticamente sempre que mudar
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem("@fontSize", String(fontSize));
    }
  }, [fontSize, loading]);

  const toggleSpeak = () => {
    setSpeakEnabled((prev) => !prev);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
  };

  return (
    <SettingsContext.Provider
      value={{ speakEnabled, toggleSpeak, fontSize, setFontSize, loading }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return context;
};
