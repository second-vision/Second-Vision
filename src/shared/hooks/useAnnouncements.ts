// src/shared/hooks/useAnnouncements.ts
import { useEffect } from "react";
import { useSpeech } from "./useSpeech";
import {Device } from "react-native-ble-plx";
import { Vibration } from "react-native";

type AnnouncementsProps = {
  isOn: boolean | null;
  mode: number | null;
  objectData: string | null;
  ocrData: string | null;
  battery: string | null;
  batteryDuration: string | null;
  interval: number;
  isScanningM: boolean;
  allDevices: Device[];
};

export function useAnnouncements({
  isOn,
  mode,
  objectData,
  ocrData,
  battery,
  batteryDuration,
  interval,
  isScanningM,
  allDevices
}: AnnouncementsProps) {
  const { speak, hasAnnouncedOnce } = useSpeech(interval);

  // 1. Estado do sistema
  useEffect(() => {
    if (isOn) {
      speak("Sistema ligado e pronto para uso", 0);
    } else if(isOn !== null) {
      speak(
        "Sistema de identificação parou de funcionar, tente reiniciar o dispositivo físico",
        0
      );
    }
  }, [isOn]);

  // 2. Mudança de modo
  useEffect(() => {
    if (mode === 0) {
      speak("Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos.", 0);
    } else if (mode === 1) {
      speak("Esse modo detecta apenas textos estáticos.", 0);
    } else if (mode === 2) {
      speak("Esse modo detecta apenas objetos possivelmente perigosos.", 0);
    }
  }, [mode]);

  // 3. Objetos detectados (YOLO)
  useEffect(() => {
    if ((mode === 0 || mode === 2) && objectData && objectData !== "none") {
      speak(`Objetos à frente: ${objectData}`, 1);
    }
  }, [objectData]);

  // 4. Texto detectado (OCR)
  useEffect(() => {
    if ((mode === 0 || mode === 1) && ocrData && ocrData !== "") {
      speak(`Texto identificado: ${ocrData}`, 1);
    }
  }, [ocrData]);

  // 5. Bateria
  useEffect(() => {
    if (!battery || battery === "-" || !batteryDuration) return;

    const batteryLevel = parseFloat(battery);
    if (isNaN(batteryLevel)) return;

    if (batteryLevel > 20) {
      if (!hasAnnouncedOnce.current) {
        speak(
          `Bateria em ${parseInt(battery)}%. Tempo restante: ${batteryDuration}.`,
          0
        );
        hasAnnouncedOnce.current = true;
      }
    } else {
      speak(
        `Atenção, bateria fraca em ${parseInt(battery)}%. Tempo restante: ${batteryDuration}. Por favor, recarregue o dispositivo.`,
        0
      );
    }
  }, [battery, batteryDuration]);


  useEffect(() => {
      if (!isScanningM) {
        if (allDevices.length === 0) {
          Vibration.vibrate(500);
          speak(
            "Nenhum periférico encontrado, em caso de dúvida acesse o tutorial no menu de informações do cabeçalho."
          );
        }else{
          speak(
            "Second Vision encontrado clique para conectar."
          );
        }
      }
    }, [isScanningM, allDevices]);
}
