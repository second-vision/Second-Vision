import { useState, useEffect, useRef } from "react";
import { Alert, Linking, SafeAreaView, ScrollView } from "react-native";
import { Base64 } from "js-base64";
import { Device, BleError, Characteristic } from "react-native-ble-plx";
import * as Speech from "expo-speech";
import { useNavigation } from "expo-router";
import { Buffer } from "buffer";

import {
  About,
  BottomBar,
  Dashboard,
  Devices,
  Header,
  ModalWifi,
} from "@/src/shared/components";
import { useDeviceContext, useHomePropsContext } from "@/src/shared/context";
import { styles } from "./styles";
import { NavigationProp } from "@/app/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DATA_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID_YOLO = "12345678-1234-5678-1234-56789abcdef1";
const CHARACTERISTIC_UUID_PADDLE = "12345678-1234-5678-1234-56789abcdef2";
const CHARACTERISTIC_UUID_SHUTDOWN = "12345678-1234-5678-1234-56789abcdef3";
const CHARACTERISTIC_UUID_BATTERY = "12345678-1234-5678-1234-56789abcdef4";
const CHARACTERISTIC_UUID_WIFI = "12345678-1234-5678-1234-56789abcdef5";

export const Home = () => {
  //Variaveis uteis
  const [isOn, setIsOn] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const { deviceConnection } = useDeviceContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  //Conexão de internet
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  //Configurações do usuario
  const { mode, interval, hostspot } = useHomePropsContext();

  //Recebimento de dados do servidor
  const [dataReceivedYOLO, setDataReceivedYOLO] = useState<string | null>(null);
  const [dataReceivedPaddle, setDataReceivedPaddle] = useState<string | null>(
    null
  );
  const [dataReceivedBattery, setDataReceivedBattery] = useState<string | null>(
    null
  );
  const [dataReceivedBatteryDuration, setDataReceivedBatteryDuration] =
    useState<string | null>(null);

  //Variaveis para funcao de fala
  const hasAnnouncedOnce = useRef(false);
  const isSpeakingRef = useRef<boolean>(false);

  //Use effect de renderizacao
  useEffect(() => {
    if (deviceConnection) {
      startStreamingData(deviceConnection);
    }
  }, []);

  //Use effect para controle de estado do sistema
  useEffect(() => {
    if (isOn) {
      speak("Sistema ligado e pronto para uso", 0);
    } else if (!isOn) {
      speak(
        "Sistema de identificação parou de funcionar, tente reiniciar o dispositivo físico",
        0
      );
    }
  }, [isOn]);

  useEffect(() => {
    if (mode === 0) {
      speak(
        `Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos.`,
        0
      );
    } else if (mode === 1) {
      speak(`Esse modo detecta apenas textos estáticos.`, 0);
    } else if (mode === 2) {
      speak(`Esse modo detecta apenas objetos possivelmente perigosos.`, 0);
    }
  }, [mode]);

  //Use effects de recebimento dos dados
  useEffect(() => {
    if (mode === 0 || mode === 2) {
      if (dataReceivedYOLO !== "none" && dataReceivedYOLO !== "") {
        speak(`Objetos a frente: ${dataReceivedYOLO}`, 1);
      }
    }
  }, [dataReceivedYOLO]);

  useEffect(() => {
    if (mode === 0 || mode === 1) {
      if (dataReceivedPaddle !== "") {
        speak(`Texto identificado: ${dataReceivedPaddle}`, 1);
      }
    }
  }, [dataReceivedPaddle]);

  useEffect(() => {
    if (dataReceivedBattery) {
      if (parseInt(dataReceivedBattery, 10) === 0) return;
      if (dataReceivedBattery === null) return;
      if (parseInt(dataReceivedBattery, 10) > 20) {
        if (!hasAnnouncedOnce.current) {
          speak(
            `Bateria a ${dataReceivedBattery}%. Tempo estimado de uso restante: ${dataReceivedBatteryDuration} horas.`,
            0
          );
          hasAnnouncedOnce.current = true;
        }
      } else {
        speak(
          `Bateria a ${dataReceivedBattery}%. Tempo estimado de uso restante: ${dataReceivedBatteryDuration} horas. A bateria está imprópria para uso.`,
          0
        );
      }
    }
  }, [dataReceivedBattery]);

  //Use effect logica de conexao com internet
  useEffect(() => {
    if (hostspot === 1) {
      handleSelectHotspot();
    }
  }, [hostspot]);

  //funcoes para conexao com internet
  const handleWifiSubmit = async (
    ssid: string,
    password: string,
    device: Device
  ) => {
    try {
      const isConnected = await device.isConnected();

      if (isConnected) {
        // 1. Cria o objeto JSON
        const wifiData = {
          ssid: ssid,
          password: password,
        };

        // 2. Converte para string JSON
        const jsonString = JSON.stringify(wifiData);

        // 3. Codifica em base64
        const base64Data = Buffer.from(jsonString, "utf-8").toString("base64");

        // 4. Função de escrita com timeout
        const writeWithTimeout = () => {
          return new Promise(async (resolve, reject) => {
            try {
              await device.writeCharacteristicWithResponseForService(
                DATA_SERVICE_UUID,
                CHARACTERISTIC_UUID_WIFI,
                base64Data
              );
              resolve("Comando enviado com sucesso");
            } catch (error) {
              reject(error);
              return false;
            }
          });
        };

        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject("Timeout"), 5000)
        );

        // 5. Executa com timeout
        await Promise.race([writeWithTimeout(), timeout]);

        // Aguarda alguns segundos para o Raspberry tentar se conectar
        await new Promise((r) => setTimeout(r, 4000));

        // Lê o status de volta
        const result = await device.readCharacteristicForService(
          DATA_SERVICE_UUID,
          CHARACTERISTIC_UUID_WIFI
        );

        const decoded = Buffer.from(result.value!, "base64").toString("utf-8");
        console.log("Status do Wi-Fi:", decoded);

        if (decoded.includes("Conectado a:") && !decoded.includes("Nenhum")) {
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      console.error("Erro ao enviar comando:", error);
      return false;
    }
  };

  const openHotspotSettings = async () => {
    const tetherIntent = "android.settings.TETHER_SETTINGS";

    try {
      await Linking.openURL(tetherIntent);
    } catch (error) {
      await Linking.openSettings();
    }
  };

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

    const connected = await handleWifiSubmit(ssid, password, deviceConnection);

    if (!connected) {
      Alert.alert(
        "Falha na conexão",
        "Não foi possível conectar. Verifique se o roteador está ligado e se as credenciais estão corretas."
      );
      setModalVisible(true);
    }
  };

  const handleSelectHotspot = async () => {
    const savedSsid = await AsyncStorage.getItem("hotspot_ssid");
    const savedPassword = await AsyncStorage.getItem("hotspot_password");

    if (!deviceConnection) {
      Alert.alert("Erro", "Dispositivo não conectado.");
      return;
    }

    if (savedSsid && savedPassword) {
      const connected = await handleWifiSubmit(
        savedSsid,
        savedPassword,
        deviceConnection
      );

      if (!connected) {
        Alert.alert(
          "Erro na conexão",
          "Não foi possível conectar com as credenciais salvas. Verifique o nome e a senha e tente novamente."
        );
        setModalVisible(true);
      }
    } else {
      setModalVisible(true);
    }
  };

  //Funcoes da Fala
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const processSpeakQueue = async (text: string) => {
    await Speech.speak(text, { language: "pt-BR" });
    await delay(interval * 1000);
    isSpeakingRef.current = false;
  };

  const speak = async (text: string, numero: number) => {
    if (numero === 1) {
      if (!isSpeakingRef.current) {
        isSpeakingRef.current = true;
        await processSpeakQueue(text);
      } else {
        return;
      }
    } else if (numero === 0) {
      if (isSpeakingRef.current) {
        await Speech.speak(text, { language: "pt-BR" });
      } else {
        isSpeakingRef.current = true;
        await Speech.speak(text, { language: "pt-BR" });
        isSpeakingRef.current = false;
      }
    }
  };

  //Funcoes de recebimento dos dados
  const startStreamingData = (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_YOLO,
        onDataUpdateYOLO
      );

      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_PADDLE,
        onDataUpdatePaddle
      );

      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_BATTERY,
        onDataUpdateBattery
      );
    } else {
    }
  };

  const onDataUpdateYOLO = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.error(error);
      return;
    } else if (!characteristic?.value) {
      console.warn("No Data was received for YOLO!");
      return;
    }

    const dataInput = Base64.decode(characteristic.value);

    setDataReceivedYOLO(dataInput);
  };

  const onDataUpdatePaddle = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.error(error);
      return;
    } else if (!characteristic?.value) {
      console.warn("No Data was received for PADDLE!");
      return;
    }

    const dataInput = Base64.decode(characteristic.value);
    setDataReceivedPaddle(dataInput);
  };

  const onDataUpdateBattery = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.error(error);
      return;
    } else if (!characteristic?.value) {
      console.warn("No Data was received for BATTERY!");
      return;
    }

    const dataInput = Base64.decode(characteristic.value);
    const [batteryStr, durationStr] = dataInput.split(",");
    const batteryPercentage = Math.floor(parseFloat(batteryStr));
    const duration = parseFloat(durationStr);

    setDataReceivedBatteryDuration(Math.abs(duration).toFixed(2));
    setDataReceivedBattery(batteryPercentage.toString());
  };

  //funcao de desligar
  const sendShutdownCommand = async (device: Device) => {
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

  //Menu hamburguer
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const modes = [
    {
      name: "Híbrido",
      description:
        "Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos.",
    },
    {
      name: "Texto",
      description: "Esse modo detecta apenas textos estáticos.",
    },
    {
      name: "Objetos",
      description: "Esse modo detecta apenas objetos possivelmente perigosos.",
    },
  ];

  const hostspotMode = [
    {
      name: "Offline",
      description: "Esse modo funciona sem conexão com a internet.",
    },
    {
      name: "Online",
      description: "Esse modo apenas funciona com conexão à internet.",
    },
  ];

  const currentMode = modes[mode];

  const currentHostspot = hostspotMode[hostspot];

  return (
    <SafeAreaView style={styles.container} accessible>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header
          toggleMenu={toggleMenu}
          props="Second Vision"
          sendShutdownCommand={sendShutdownCommand}
          device={deviceConnection}
        />
        <Devices />
        <Dashboard
          isOn={isOn}
          intervalDash={interval * 1000}
          batteryLevel={dataReceivedBattery ? parseInt(dataReceivedBattery) : 0}
          currentModeIndex={mode}
          currentMode={currentMode}
          currentHostspot={currentHostspot}
        />
        <ModalWifi
          handleSelectHotspot={handleSelectHotspot}
          openHotspotSettings={openHotspotSettings}
          handleSubmitCredentials={handleSubmitCredentials}
          modalVisible={modalVisible}
          ssid={ssid}
          setSsid={setSsid}
          password={password}
          setPassword={setPassword}
          SendWifiSubmit={handleWifiSubmit}
          device={deviceConnection}
        />
        <About visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </ScrollView>
      <BottomBar mode={mode} hostspot={hostspot} interval={interval} />
    </SafeAreaView>
  );
};
