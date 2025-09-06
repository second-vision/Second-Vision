// src/shared/hooks/useDeviceConnection.ts
import { useEffect, useState } from "react";
import { Base64 } from "js-base64";
import { Buffer } from "buffer";
import {
  Device,
  BleError,
  Characteristic,
  BleManager,
} from "react-native-ble-plx";
import { useHomePropsContext, useSettings } from "@/src/shared/context";
import {
  DATA_SERVICE_UUID,
  CHARACTERISTIC_UUID_OBJECT,
  CHARACTERISTIC_UUID_OCR,
  CHARACTERISTIC_UUID_BATTERY,
  CHARACTERISTIC_UUID_WIFI_STATUS,
  CHARACTERISTIC_UUID_DEVICE_INFO,
  CHARACTERISTIC_UUID_SHUTDOWN,
} from "@/src/shared/constants/ble";
import { Alert } from "react-native";
import * as Speech from "expo-speech";

import { useNavigation } from "expo-router";
import { NavigationProp } from "@/app/types/types";
import { useSpeech } from "./useSpeech";

const bleManager = new BleManager();

export function useDeviceConnection(
  deviceConnection: Device | null,
  setHotspotValueUI: (val: number) => void,
  checkWifiStatus: (
    device: Device
  ) => Promise<{ connected: boolean; ssid: string | null }>
) {
  const { deviceInfo, setDeviceInfo } = useHomePropsContext();
  const [isOn, setIsOn] = useState(true);
  const [objectData, setObjectData] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<string | null>(null);
  const [battery, setBattery] = useState<string | null>(null);
  const [batteryDuration, setBatteryDuration] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const { speakEnabled } = useSettings();

  const { speak } = useSpeech(0);

  const [bluetoothState, setBluetoothState] = useState("PoweredOn");

  let objectDataTimeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (!deviceConnection) return;

    let stateSubscription: { remove: () => void } | null = null;

    const init = async () => {
      try {
        // Lê informações do dispositivo
        const char = await deviceConnection.readCharacteristicForService(
          DATA_SERVICE_UUID,
          CHARACTERISTIC_UUID_DEVICE_INFO
        );
        const status = await checkWifiStatus(deviceConnection);
        if (status.connected) {
          setHotspotValueUI(1);
        } else {
          setHotspotValueUI(0);
        }
        const infoString = Buffer.from(char.value!, "base64").toString("utf-8");
        // Converte para objeto
        const infoObject = JSON.parse(infoString);

        // Altera o model para simular RPi-0
        //infoObject.model = "RPi-0";
        setDeviceInfo(infoObject);
        // Inicia streaming
        startStreamingData(deviceConnection);

        stateSubscription = bleManager.onStateChange((state) => {
          setBluetoothState(state);
        }, true);
      } catch (err) {
        console.error("Erro inicialização BLE:", err);
      }
    };

    init();
    return () => {
      if (stateSubscription) {
        stateSubscription.remove();
      }
    };
  }, [deviceConnection]);

  useEffect(() => {
    if (bluetoothState === "PoweredOff") {
      Speech.stop();
      navigation.replace("ControlBluetoothStack");
    }
  }, [bluetoothState]);

  const startStreamingData = (device: Device) => {
    device.monitorCharacteristicForService(
      DATA_SERVICE_UUID,
      CHARACTERISTIC_UUID_OBJECT,
      onDataUpdateOBJECT
    );

    device.monitorCharacteristicForService(
      DATA_SERVICE_UUID,
      CHARACTERISTIC_UUID_OCR,
      onDataUpdateOCR
    );

    device.monitorCharacteristicForService(
      DATA_SERVICE_UUID,
      CHARACTERISTIC_UUID_BATTERY,
      onDataUpdateBattery
    );

    device.monitorCharacteristicForService(
      DATA_SERVICE_UUID,
      CHARACTERISTIC_UUID_WIFI_STATUS,
      onDataUpdateWifi
    );
  };

  const onDataUpdateOBJECT = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.error("YOLO error:", error);
      return;
    }

    if (characteristic?.value) {
      setObjectData(Base64.decode(characteristic.value));
    }
  };

  const onDataUpdateOCR = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.error("OCR error:", error);
      return;
    }
    if (characteristic?.value) {
      setOcrData(Base64.decode(characteristic.value));
    }
  };

  const onDataUpdateBattery = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.error("Battery error:", error);
      setBattery("-");
      setBatteryDuration("Erro de conexão");
      return;
    }
    if (characteristic?.value) {
      const dataInput = Base64.decode(characteristic.value);

      // Reinicia o timeout a cada dado recebido
      if (objectDataTimeout) clearTimeout(objectDataTimeout);

      const parts = dataInput.split(",");

      if (parts.length > 1) {
        setBattery(parts[0].trim());
        setBatteryDuration(parts[1].trim());
      } else {
        setBattery("-");
        setBatteryDuration(parts[0].trim());
      }
      objectDataTimeout = setTimeout(() => {
        // Se passar 30 segundos sem receber dados, define false (servidor parou de responder)
        setIsOn(false);
      }, 70_000);
      // Marca como ativo sempre que recebe dados
      setIsOn(true);
    }
  };

  const onDataUpdateWifi = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.error("Wi-Fi error:", error);
      setHotspotValueUI(0);
      return;
    }
    if (characteristic?.value) {
      const dataInput = Base64.decode(characteristic.value);

      if (dataInput.includes("Conectado a:") && !dataInput.includes("Nenhum")) {
        setHotspotValueUI(1);
      } else {
        setHotspotValueUI(0);
      }
    }
  };

  //funcao de desligar
  const sendShutdownCommand = async (device: Device) => {
    if (speakEnabled) {
      speak("Você realmente deseja desligar o dispositivo?", 0);
    }
    Alert.alert(
      "Confirmação de Desligamento",
      "Você realmente deseja desligar o dispositivo?",

      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const isConnected = await device.isConnected();

              if (isConnected) {
                const data = [0x01];
                const hexString = data
                  .map((byte) => String.fromCharCode(byte))
                  .join("");

                const writeWithTimeout = (device: Device) => {
                  return new Promise(async (resolve, reject) => {
                    try {
                      device.writeCharacteristicWithResponseForService(
                        DATA_SERVICE_UUID,
                        CHARACTERISTIC_UUID_SHUTDOWN,
                        hexString
                      );
                      resolve("Comando enviado com sucesso");
                    } catch (error) {
                      reject(error);
                    }
                  });
                };

                const timeout = new Promise((_, reject) =>
                  setTimeout(() => reject("Timeout"), 5000)
                );

                await Promise.race([writeWithTimeout(device), timeout]);

                Speech.stop();
                navigation.replace("ControlBluetoothStack");
              }
            } catch (error) {
              console.error("Erro ao enviar comando:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return {
    deviceInfo,
    objectData,
    ocrData,
    battery,
    batteryDuration,
    sendShutdownCommand,
    isOn,
  };
}
