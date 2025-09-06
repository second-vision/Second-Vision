// src/shared/hooks/useWifiManager.ts
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import SendIntentAndroid from "react-native-send-intent";
import { Device } from "react-native-ble-plx";

import {
  DATA_SERVICE_UUID,
  CHARACTERISTIC_UUID_WIFI_STATUS,
  CHARACTERISTIC_UUID_WIFI_COMMAND,
} from "@/src/shared/constants/ble";

export function useWifiManager(
  deviceConnection: Device | null,
  hostspot: number,
  hostspotUI: number,
  setHotspotValue: (val: number) => void
) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // --- SUBMIT DE DADOS DO ROTEADOR ---
  const handleWifiSubmit = async (
    ssid: string,
    password: string,
    device: Device
  ): Promise<boolean> => {
    try {
      const isConnected = await device.isConnected();
      if (!isConnected) {
        console.error("Dispositivo não está conectado.");
        return false;
      }

      const wifiData = { ssid, password };
      const base64Data = Buffer.from(
        JSON.stringify(wifiData),
        "utf-8"
      ).toString("base64");

      await device.writeCharacteristicWithResponseForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_WIFI_COMMAND,
        base64Data
      );

      const MAX_RETRIES = 5;
      const POLL_INTERVAL_MS = 2000;

      for (let i = 0; i < MAX_RETRIES; i++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const result = await device.readCharacteristicForService(
          DATA_SERVICE_UUID,
          CHARACTERISTIC_UUID_WIFI_STATUS
        );
        const decoded = Buffer.from(result.value!, "base64").toString("utf-8");

        if (decoded.includes(`Conectado a: ${ssid}`)) {
          return true;
        }
      }

      console.error("Timeout: conexão Wi-Fi falhou.");
      setHotspotValue(0);
      return false;
    } catch (error) {
      console.error("Erro no processo de configuração Wi-Fi:", error);
      return false;
    }
  };

  // --- USAR CREDENCIAIS SALVAS ---
  const handleSelectHotspot = async () => {
    const savedSsid = await AsyncStorage.getItem("hotspot_ssid");
    const savedPassword = await AsyncStorage.getItem("hotspot_password");

    if (!deviceConnection) {
      Alert.alert("Erro", "Dispositivo não conectado.");
      return;
    }

    if (savedSsid && savedPassword) {
      setIsConnecting(true);
      const connected = await handleWifiSubmit(
        savedSsid,
        savedPassword,
        deviceConnection
      );
      setIsConnecting(false);

      if (!connected) {
        Alert.alert(
          "Erro na conexão",
          "Não foi possível conectar com as credenciais salvas.",
          [{ text: "OK", onPress: () => setModalVisible(true) }],
          { cancelable: false }
        );
      }
    } else {
      setModalVisible(true);
    }
  };

  // --- ENVIAR NOVAS CREDENCIAIS ---
  const handleSubmitCredentials = async () => {
    if (!ssid || !password) {
      Alert.alert(
        "Campos obrigatórios",
        "Por favor, preencha o SSID e a senha."
      );
      return;
    }

    await AsyncStorage.setItem("hotspot_ssid", ssid);
    await AsyncStorage.setItem("hotspot_password", password);
    setModalVisible(false);

    if (!deviceConnection) {
      Alert.alert("Erro", "Dispositivo não conectado.");
      return;
    }

    setIsConnecting(true);
    const connected = await handleWifiSubmit(ssid, password, deviceConnection);
    setIsConnecting(false);

    if (!connected) {
      Alert.alert(
        "Falha na conexão",
        "Não foi possível conectar. Verifique o roteador.",
        [{ text: "OK", onPress: () => setModalVisible(true) }],
        { cancelable: false }
      );
    }
  };

  // --- ABRIR CONFIGS ---
  const openHotspotSettings = () => {
    if (Platform.OS !== "android") {
      Alert.alert("Função não disponível", "Apenas no Android.");
      return;
    }
    try {
      SendIntentAndroid.openSettings("android.settings.TETHER_SETTINGS");
    } catch (error) {
      console.error("Erro ao abrir config:", error);
      Alert.alert(
        "Erro",
        "Não foi possível abrir roteador, tentando abrir config geral",
        [
          {
            text: "OK",
            onPress: () =>
              SendIntentAndroid.openSettings("android.settings.SETTINGS"),
          },
        ]
      );
    }
  };

  //Use effect logica de conexao com internet
  useEffect(() => {
    const runWifiCheck = async () => {
      if (!deviceConnection) {
        return;
      }

      setIsConnecting(true);

      const status = await checkWifiStatus(deviceConnection);
      if (hostspot === 0 && status.connected && hostspotUI === 1) {
        await switchToOfflineMode(deviceConnection);
        setIsConnecting(false);
        return;
      }

      if (hostspot === 1 && !status.connected && hostspotUI === 0) {
        await handleSelectHotspot();
        setIsConnecting(false);
        return;
      }

      setIsConnecting(false);
      return;
    };

    runWifiCheck();
  }, [hostspot]);

  // --- VERIFICAR STATUS ATUAL DO WIFI ---
  const checkWifiStatus = async (
    device: Device
  ): Promise<{ connected: boolean; ssid: string | null }> => {
    try {
      const isBleConnected = await device.isConnected();
      if (!isBleConnected) {
        return { connected: false, ssid: null };
      }

      // Lê o valor da característica
      const result = await device.readCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_WIFI_STATUS
      );

      // Decodifica a resposta
      const decoded = Buffer.from(result.value!, "base64").toString("utf-8");

      // Interpreta a resposta do servidor Python
      // Ex: "Conectado a: MinhaRede" ou "Conectado a: Nenhum"
      if (decoded.includes("Conectado a:") && !decoded.includes("Nenhum")) {
        const ssid = decoded.split("Conectado a: ")[1]?.trim();

        return { connected: true, ssid: ssid || "desconhecido" };
      } else {
        return { connected: false, ssid: null };
      }
    } catch (error) {
      console.error("Erro ao verificar o status do Wi-Fi:", error);
      return { connected: false, ssid: null };
    }
  };

  // Função para mudar para o modo offline
  const switchToOfflineMode = async (device: Device) => {
    try {
      // 1. Cria o objeto de comando
      const commandData = {
        command: "offline",
      };

      // 2. Converte para string JSON e Base64
      const jsonString = JSON.stringify(commandData);
      const base64Data = Buffer.from(jsonString, "utf-8").toString("base64");

      // 3. Escreve na característica de Wi-Fi
      await device.writeCharacteristicWithResponseForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_WIFI_COMMAND,
        base64Data
      );
    } catch (error) {
      console.error("Erro ao tentar mudar para o modo offline:", error);
      alert("Não foi possível solicitar o modo offline.");
    }
  };

  return {
    ssid,
    setSsid,
    password,
    setPassword,
    modalVisible,
    setModalVisible,
    isConnecting,
    handleSubmitCredentials,
    handleSelectHotspot,
    openHotspotSettings,
    handleWifiSubmit,
    setIsConnecting,
    checkWifiStatus,
  };
}
