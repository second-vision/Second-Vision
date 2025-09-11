// src/shared/hooks/useAnnouncements.ts
import { useEffect } from "react";
import { useSpeech } from "./useSpeech";
import { Device } from "react-native-ble-plx";
import { Vibration } from "react-native";
import { useSettings } from "../context";

interface DeviceInfo {
  model: string;
  version_code: number;
  features: string[];
}

type AnnouncementsProps = {
  isOn: boolean | null;
  mode: number | null;
  objectData: string | null;
  ocrData: string | null;
  battery: string | null;
  batteryDuration: string | null;
  interval: number;
  hostspotUI: number;
  isScanningM: boolean;
  allDevices: Device[];
  deviceInfo: DeviceInfo | null;
};

export function useAnnouncements({
  isOn,
  mode,
  hostspotUI,
  objectData,
  ocrData,
  battery,
  batteryDuration,
  interval,
  isScanningM,
  allDevices,
  deviceInfo
}: AnnouncementsProps) {
  const { speakEnabled } = useSettings();

  const { speak, hasAnnouncedOnce, hasAnnouncedOnceReverse } =
    useSpeech(interval);
  // 1. Estado do sistema
  useEffect(() => {
    if (isOn) {
      if (speakEnabled) {
        speak("Sistema ligado e pronto para uso", 0);
      }
    } else if (isOn !== null) {
      speak(
        "Sistema de identificação parou de funcionar, tente reiniciar o dispositivo físico",
        0
      );
    }
  }, [isOn]);

  // 2. Mudança de modo de operação
  useEffect(() => {
    if (
      (mode === 0 && deviceInfo?.model === "RPi-0" && hostspotUI === 1) ||
      deviceInfo?.model === "RPi-5"
    ) {
      if (speakEnabled) {
        speak(
          "Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos.",
          0
        );
      }
    } else if (mode === 1) {
      if (speakEnabled) {
        speak("Esse modo detecta apenas textos estáticos.", 0);
      }
    } else if (mode === 2) {
      if (speakEnabled) {
        speak("Esse modo detecta apenas objetos possivelmente perigosos.", 0);
      }
    }
  }, [mode]);

  // 3. Mudança de modo de processamento
  useEffect(() => {
    if (hostspotUI === 0) {
      if (speakEnabled) {
        speak("Dispositivo offline.", 0);
      }
    } else if (hostspotUI === 1) {
      if (speakEnabled) {
        speak("Dispositivo online.", 0);
      }
    }
  }, [hostspotUI]);

  // 4. Objetos detectados (YOLO ou Nuvem)
  useEffect(() => {
    if ((mode === 0 || mode === 2) && objectData && objectData !== "none") {
      speak(`Objetos à frente: ${objectData}`, 1);
    }
  }, [objectData]);

  // 5. Texto detectado (OCR ou Nuvem)
  useEffect(() => {
    if ((mode === 0 || mode === 1) && ocrData && ocrData !== "") {
      speak(`Texto identificado: ${ocrData}`, 1);
    }
  }, [ocrData]);

  // 6. Bateria notificada
  useEffect(() => {
    if (!battery || battery === "-" || !batteryDuration) return;

    const batteryLevel = parseFloat(battery);
    if (isNaN(batteryLevel)) return;

    if (batteryDuration === "Carregando") {
      if (!hasAnnouncedOnce.current) {
        if (speakEnabled) {
          speak(`Bateria está carregando em ${parseInt(battery)}%.`, 0);
        }
        hasAnnouncedOnce.current = true;
      }
    } else if (batteryLevel > 20) {
      if (!hasAnnouncedOnce.current) {
        if (speakEnabled) {
          speak(
            `Bateria em ${parseInt(
              battery
            )}%. Tempo restante: ${batteryDuration}.`,
            0
          );
        }
        hasAnnouncedOnce.current = true;
      }
    } else {
      speak(
        `Atenção, bateria fraca em ${parseInt(
          battery
        )}%. Tempo restante: ${batteryDuration}. Por favor, recarregue o dispositivo.`,
        0
      );
    }
  }, [battery, batteryDuration]);
  // 7. Resultado da busca por dispositivos Bluetooth
  useEffect(() => {
    if (!isScanningM) {
      if (allDevices.length === 0) {
        Vibration.vibrate(500);
        if (speakEnabled) {
          speak(
            "Nenhum periférico encontrado, em caso de dúvida acesse o tutorial no menu de informações do cabeçalho."
          );
        }
      } else {
        if (speakEnabled) {
          speak("Second Vision encontrado clique para conectar.");
        }
      }
    }
  }, [isScanningM, allDevices]);

  // 8. Estado do sistema
  useEffect(() => {
    if (!hasAnnouncedOnceReverse.current) {
      console.log("Anunciando mudança de intervalo");
      if (speakEnabled) {
        speak("Intervalo definido para " + interval + " segundos.", 0);
      }
    }
    hasAnnouncedOnceReverse.current = false;
  }, [interval]);
}
