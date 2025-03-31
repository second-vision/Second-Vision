import { useState, useEffect, useRef } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Base64 } from "js-base64";
import { Device, BleError, Characteristic } from "react-native-ble-plx";
import * as Speech from "expo-speech";

import { About, BottomBar, Dashboard, Devices, Header } from "@/src/shared/components";
import { useDeviceContext, useHomePropsContext } from "@/src/shared/context";
import { styles } from "./styles";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { NavigationProp } from "@/app/types/types";
import ControlBluetoothStack from "@/app/ControlBluetoothStack";

const DATA_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID_YOLO = "12345678-1234-5678-1234-56789abcdef1";
const CHARACTERISTIC_UUID_PADDLE = "12345678-1234-5678-1234-56789abcdef2";
const CHARACTERISTIC_UUID_BATTERY = "12345678-1234-5678-1234-56789abcdef4";


// Importar o tipo do RootStackParamList
import { RootStackParamList } from "../../../app/types/types";

import { CompositeNavigationProp, RouteProp, useRoute } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";






export const Home = () => {

  const [isOn, setIsOn] = useState(true);
  
  const navigation = useNavigation<NavigationProp>();

  const { deviceConnection } = useDeviceContext();

  const { mode, interval } = useHomePropsContext();
  
  //const [currentModeIndex, setCurrentModeIndex] = useState(0);
  const [dataReceived, setDataReceived] = useState<string>("...waiting.");
 // const [interval, setInterval] = useState(0);
  const [dataReceivedYOLO, setDataReceivedYOLO] = useState<string | null>(null);
  const [dataReceivedPaddle, setDataReceivedPaddle] = useState<string | null>(
    null
  );
  const [dataReceivedBattery, setDataReceivedBattery] = useState<string | null>(
    null
  );
  const [dataReceivedBatteryDuration, setDataReceivedBatteryDuration] = useState<string | null>(
    null
  );
  
  const hasAnnouncedOnce = useRef(false);
  const isSpeakingRef = useRef<boolean>(false);




  useEffect(() => {
    if (deviceConnection) {
      startStreamingData(deviceConnection);
    } else {
      console.log("No device connected");
    }
  }, []);
  useEffect(() => {
    if (dataReceived !== null) {
      console.log("Data updated:", dataReceived);
    }
  }, [dataReceived]);

  useEffect(() => {
    if (isOn) {
      speak("Sistema ligado e pronto para uso", 0);
    } else if (!isOn) {
      speak(
        "Sistema de identificação parou de funcionar, tente reiniciar o dispositivo físico",
        0
      );
    }

    return () => {
      // Para a fala quando a tela é desmontada
      Speech.stop();
    };

  }, [isOn]);

  useEffect(() => {

    if (mode === 0 || mode === 2) {
      if (dataReceivedYOLO !== "none" && dataReceivedYOLO !== "") {
        speak(`Objetos a frente: ${dataReceivedYOLO}`, 1);
      }
    }
    return () => {
      // Para a fala quando a tela é desmontada
      Speech.stop();
    };

  }, [dataReceivedYOLO]);
  
  useEffect(() => {
  
    if (mode === 0 || mode === 1) {
      if (dataReceivedPaddle !== "") {
        speak(`Texto identificado: ${dataReceivedPaddle}`, 1);
      } 
    }
    return () => {
      // Para a fala quando a tela é desmontada
      Speech.stop();
    };

  }, [dataReceivedPaddle]);
  
  useEffect(() => {
  
  
    if (mode === 0) {
      speak(`Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos.`, 0);
    } else if (mode === 1) {
      speak(`Esse modo detecta apenas textos estáticos.`, 0);
    } else if (mode === 2) {
      speak(`Esse modo detecta apenas objetos possivelmente perigosos.`, 0);
    }

    return () => {
      // Para a fala quando a tela é desmontada
      Speech.stop();
    };

  }, [mode]);

  useEffect(() => {
    if (dataReceivedBattery) {
      if (parseInt(dataReceivedBattery, 10) === 0) return;
      if (dataReceivedBattery === null) return;
      if (parseInt(dataReceivedBattery, 10) > 20) {
        // Se a bateria está acima de 20 e não foi notificado antes
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

    return () => {
      // Para a fala quando a tela é desmontada
      Speech.stop();
    };

  }, [dataReceivedBattery]);

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





  // Desconectar

  //Receber Dados
  // Decoding the data received from the device and defining the callback
  async function startStreamingData(device: Device) {
    if (device) {
      // Monitorar a característica YOLO
      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_YOLO,
        onDataUpdateYOLO
      );

      // Monitorar a característica PADDLE
      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_PADDLE,
        onDataUpdatePaddle
      );

      // Monitorar a característica BATTERY
      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_BATTERY,
        onDataUpdateBattery
      );
    } else {
      console.log("No Device Connected");
    }
  }

  // Callback para quando a característica YOLO for atualizada
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
    console.log("YOLO Data Received:", dataInput);

    // Aqui você pode salvar ou processar os dados de YOLO conforme necessário
    setDataReceivedYOLO(dataInput);
  };

  // Callback para quando a característica PADDLE for atualizada
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
    console.log("PADDLE Data Received:", dataInput);

    // Aqui você pode salvar ou processar os dados de PADDLE conforme necessário
    setDataReceivedPaddle(dataInput);
  };

  // Callback para quando a característica BATTERY for atualizada
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
    console.log(batteryPercentage);
    const duration = parseFloat(durationStr);
    console.log(duration);


    // Aqui você pode salvar ou processar os dados de BATTERY conforme necessário
    setDataReceivedBatteryDuration(Math.abs(duration).toFixed(2));
    setDataReceivedBattery(batteryPercentage.toString());
    
  };

  // Função para enviar o comando de desligamento
  const sendShutdownCommand = async (device: Device) => {
    console.log("1 - Iniciando comando de desligamento");
  
    Alert.alert(
      "Confirmação de Desligamento",
      "Você realmente deseja desligar o dispositivo?",
      [
        {
          text: "Cancelar",
          onPress: () => {
            console.log("2 - Desligamento cancelado");
          },
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: async () => {
            console.log("3 - Confirmado, tentando enviar comando...");
  
            try {
              const serviceUUID = "12345678-1234-5678-1234-56789abcdef0";
              const characteristicUUID = "12345678-1234-5678-1234-56789abcdef3";
  
              const isConnected = await device.isConnected();
  
              if (isConnected) {
                console.log("4 - Dispositivo conectado, enviando comando...");
  
                const data = [0x01]; // Comando de desligamento em formato de byte
                const hexString = data.map((byte) => String.fromCharCode(byte)).join("");
  
                // Função para controlar o tempo limite
                const writeWithTimeout = (device: Device) => {
                  return new Promise(async (resolve, reject) => {
                    try {
                       device.writeCharacteristicWithResponseForService(
                        serviceUUID,
                        characteristicUUID,
                        hexString
                      );
                      resolve("Comando enviado com sucesso");
                    } catch (error) {
                      reject(error);
                    }
                  });
                };
  
                // Definir o tempo limite (exemplo de 5 segundos)
                const timeout = new Promise((_, reject) => setTimeout(() => reject('Timeout'), 5000));
  
                // Tentar executar a escrita BLE com timeout
                await Promise.race([writeWithTimeout(device), timeout]);
  
                console.log("5 - Comando enviado com sucesso");
  
                // Navegar após o envio ou timeout
                navigation.replace("ControlBluetoothStack");
  
              } else {
                console.log("Dispositivo não está conectado");
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const [fontsLoaded, setFontsLoaded] = useState(false);

  // useEffect(() => {
  // 	loadFonts().then(() => setFontsLoaded(true));
  // }, []);

  // if (!fontsLoaded) {
  // 	return null;
  // }

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

  

  const currentMode = modes[mode];

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
        />
        <About visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        
      
      </ScrollView>
      <BottomBar mode={mode} interval={interval}/>
    </SafeAreaView>
  );
};
