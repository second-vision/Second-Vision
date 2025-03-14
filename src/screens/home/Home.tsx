import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Platform,
  PermissionsAndroid,
  NativeModules,
  NativeEventEmitter,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as Font from "expo-font";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as Speech from "expo-speech";
import BleManager, {
  Peripheral,
  PeripheralInfo,
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
} from "react-native-ble-manager";

// Importar o tipo do RootStackParamList
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { TabParamList, RootStackParamList } from "../../navigation";
import { About, Dashboard, Devices, Header } from "../../components";
import { styles } from "./style";

// Definir o tipo de navegação para o HomeScreen
type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Home">,
  NativeStackNavigationProp<RootStackParamList>
>;

// Definir o tipo da rota para o HomeScreen
type HomeScreenRouteProp = RouteProp<TabParamList, "Home">;

const loadFonts = async () => {
  await Font.loadAsync({
    FonteCustomizada: require("../../assets/fonts/Poppins-SemiBoldItalic.ttf"),
  });
};

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

declare module "react-native-ble-manager" {
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

export const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const [isOn, setIsOn] = useState(true);
  const [StatusText, setStatusText] = useState("Desligado");

  const [batteryLevel, setBatteryLevel] = useState(0);
  const hasAnnouncedOnce = useRef(false);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [currentModeIndex, setCurrentModeIndex] = useState(0);
  const [peripherals, setPeripherals] = useState(
    new Map<Peripheral["id"], Peripheral>()
  );
  const [yoloResults, setYoloResults] = useState("");
  const [tesseractResults, setTesseractResults] = useState("");
  const specificMacAddress = "D8:3A:DD:D5:49:E8";

  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [interval, setInterval] = useState(0);
  useEffect(() => {
    if (route.params?.interval !== undefined) {
      setInterval(route.params.interval);
      console.log(interval);
    }
  }, [route.params?.interval]);

  useEffect(() => {
    if (route.params?.mode !== undefined) {
      setCurrentModeIndex(route.params.mode);
    }
  }, [route.params?.mode]);

  const isSpeakingRef = useRef<boolean>(false);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const processSpeakQueue = async (text: string) => {
    await Speech.speak(text, { language: "pt-BR" });
    await delay(interval);
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

  const handleDisconnectedPeripheral = (
    event: BleDisconnectPeripheralEvent
  ) => {
    console.debug(
      `[handleDisconnectedPeripheral][${event.peripheral}] desconectado.`
    );
    setPeripherals((map) => {
      let p = map.get(event.peripheral);
      if (p) {
        p.connected = false;
        return new Map(map.set(event.peripheral, p));
      }
      return map;
    });

    if (event.peripheral === specificMacAddress) {
      navigation.navigate("ControlScreen");
    }
  };

  const retrieveConnected = async () => {
    try {
      const connectedPeripherals = await BleManager.getConnectedPeripherals();
      if (connectedPeripherals.length === 0) {
        console.warn("[retrieveConnected] Nenhum periferico encontrado.");
        return;
      }

      for (let peripheral of connectedPeripherals) {
        setPeripherals((map) => {
          return new Map(map.set(peripheral.id, peripheral));
        });
        peripheral.connecting = false;
        peripheral.connected = true;
      }
    } catch (error) {
      console.error(
        "[retrieveConnected] incapaz de recuperar periféricos conectados.",
        error
      );
    }
  };

  const retrieveServices = async () => {
    await retrieveConnected();
    const peripheralInfos: PeripheralInfo[] = [];
    for (let [peripheralId, peripheral] of peripherals) {
      if (peripheral.connected) {
        const newPeripheralInfo = await BleManager.retrieveServices(
          peripheralId
        );
        peripheralInfos.push(newPeripheralInfo);
      }
    }

    return peripheralInfos;
  };

  const startNotification = async () => {
    let services = await retrieveServices();

    for (let peripheralInfo of services) {
      peripheralInfo.characteristics?.forEach(async (c) => {
        try {
          if (
            (c.service === "12345678-1234-5678-1234-56789abcdef0" &&
              c.characteristic === "12345678-1234-5678-1234-56789abcdef1") ||
            (c.service === "12345678-1234-5678-1234-56789abcdef0" &&
              c.characteristic === "12345678-1234-5678-1234-56789abcdef2") ||
            (c.service === "12345678-1234-5678-1234-56789abcdef0" &&
              c.characteristic === "12345678-1234-5678-1234-56789abcdef4")
          )
            await BleManager.startNotification(
              peripheralInfo.id,
              c.service,
              c.characteristic
            );
          console.log("Notificacao iniciada");
        } catch (error) {
          console.error("Erro na notificacao", error);
        }
      });
    }
  };
  const handleUpdateValueForCharacteristic = (
    data: BleManagerDidUpdateValueForCharacteristicEvent
  ) => {
    const dataString = String.fromCharCode(...data.value);

    if (data.characteristic === "12345678-1234-5678-1234-56789abcdef1") {
      // Característica de YOLO
      setYoloResults(dataString);
      console.log("YOLO Resultados:", dataString);
    } else if (data.characteristic === "12345678-1234-5678-1234-56789abcdef2") {
      // Característica de Tesseract
      setTesseractResults(dataString);
      console.log("Tesseract Resultados:", dataString);
    } else if (data.characteristic === "12345678-1234-5678-1234-56789abcdef4") {
      // Característica de Bateria e Tempo Estimado
      console.log(dataString);
      // Divida o valor recebido em dois: nível da bateria e tempo estimado
      const [batteryLevelStr, estimatedTimeStr] = dataString.split(",");

      // Converta para números
      const batteryLevel = parseInt(batteryLevelStr, 10); // Nível de bateria em %
      const estimatedTime = parseFloat(estimatedTimeStr); // Tempo estimado em horas

      if (!isNaN(estimatedTime)) {
        setEstimatedDuration(estimatedTime);
        console.log(`Tempo Estimado de Duração: ${estimatedTime} horas`);
      } else {
        console.log(
          `Valor de tempo estimado não recebido corretamente: ${estimatedTimeStr}`
        );
      }
      setBatteryLevel(batteryLevel);
      console.log(`Nível da Bateria: ${batteryLevel}%`);
    }

    console.log(`[Notificacao] ${dataString}`);

    console.debug(
      `[handleUpdateValueForCharacteristic] recebendo data de '${data.peripheral}' com characteristic='${data.characteristic}' e value='${dataString}'`
    );

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    setIsOn(true);
    setStatusText("Ligado");

    updateTimeoutRef.current = setTimeout(() => {
      setIsOn(false);
      setStatusText("Desligado");
    }, 10000); // 10 segundos sem atualização para considerar o sistema parado
  };

  // Função para enviar o comando de desligamento
  const sendShutdownCommand = async () => {
    speak("Você realmente deseja desligar o dispositivo?", 0);

    Alert.alert(
      "Confirmação de Desligamento",
      "Você realmente deseja desligar o dispositivo?",
      [
        {
          text: "Cancelar",
          onPress: () => {
            console.log("Desligamento cancelado");
            speak("Desligamento cancelado", 0);
          },
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              let services = await retrieveServices();
              speak("Comando de desligamento enviado", 0);
              for (let peripheralInfo of services) {
                for (let c of peripheralInfo.characteristics || []) {
                  if (
                    c.service === "12345678-1234-5678-1234-56789abcdef0" &&
                    c.characteristic === "12345678-1234-5678-1234-56789abcdef3"
                  ) {
                    try {
                      const data = [0x01]; // Comando de desligamento
                      await BleManager.write(
                        peripheralInfo.id,
                        c.service,
                        c.characteristic,
                        data
                      );
                    } catch (error) {
                      console.error(
                        "Erro ao enviar comando de desligamento",
                        error
                      );
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Erro ao recuperar serviços", error);
              Alert.alert("Erro", "Não foi possível recuperar os serviços");
              speak("Não foi possível recuperar os serviços", 0);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleAndroidPermissions = () => {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then((result) => {
        if (result) {
          console.debug(
            "[handleAndroidPermissions] O usuário aceita permissões de tempo de execução Android 12+"
          );
        } else {
          //console.error("[handleAndroidPermissions] O usuário recusa permissões de tempo de execução Android 12+");
        }
      });
    } else if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then((checkResult) => {
        if (checkResult) {
          console.debug(
            "[handleAndroidPermissions] permissão de tempo de execução Android <12 já está OK"
          );
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ).then((requestResult) => {
            if (requestResult) {
              console.debug(
                "[handleAndroidPermissions] O usuário aceita permissão de execução android <12"
              );
            } else {
              console.error(
                "[handleAndroidPermissions] Usuário recusa permissão de execução android <12"
              );
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    try {
      BleManager.start({ showAlert: false })
        .then(() => console.debug("BleManager iniciado."))
        .catch((error: any) =>
          console.error("BeManager não pode iniciar.", error)
        );
    } catch (error) {
      console.error("erro inesperado ao iniciar o BleManager.", error);
      return;
    }

    handleAndroidPermissions();

    startNotification();
    const listeners = [
      bleManagerEmitter.addListener(
        "BleManagerDisconnectPeripheral",
        handleDisconnectedPeripheral
      ),
      bleManagerEmitter.addListener(
        "BleManagerDidUpdateValueForCharacteristic",
        handleUpdateValueForCharacteristic
      ),
    ];

    return () => {
      console.debug("[app] main component unmounting. Removing listeners...");

      for (const listener of listeners) {
        listener.remove();
      }
    };
  }, []);

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
    if (currentModeIndex === 0 || currentModeIndex === 2) {
      if (yoloResults !== "none") {
        if (yoloResults !== "") {
          speak(`Objetos a frente: ${yoloResults}`, 1);
        }
      }
    }
  }, [yoloResults]);
  useEffect(() => {
    if (currentModeIndex === 0 || currentModeIndex === 1) {
      if (tesseractResults !== "") {
        speak(`Texto identificado: ${tesseractResults}`, 1);
      }
    }
  }, [tesseractResults]);

  useEffect(() => {
    if (currentModeIndex === 0) {
      speak(
        `Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos.`,
        0
      );
    } else if (currentModeIndex === 1) {
      speak(`Esse modo detecta apenas textos estáticos.`, 0);
    } else if (currentModeIndex === 2) {
      speak(`Esse modo detecta apenas objetos possivelmente perigosos.`, 0);
    }
  }, [currentModeIndex]);

  useEffect(() => {
    if (batteryLevel === 0) return;
    if (batteryLevel === null) return;
    if (batteryLevel > 20) {
      // Se a bateria está acima de 20 e não foi notificado antes
      if (!hasAnnouncedOnce.current) {
        speak(
          `Bateria a ${batteryLevel}%. Tempo estimado de uso restante: ${estimatedDuration} horas.`,
          0
        );
        hasAnnouncedOnce.current = true;
      }
    } else {
      speak(
        `Bateria a ${batteryLevel}%. Tempo estimado de uso restante: ${estimatedDuration} horas. A bateria está imprópria para uso.`,
        0
      );
    }
  }, [batteryLevel]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return null;
  }

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

  const currentMode = modes[currentModeIndex];

  return (
    <SafeAreaView style={styles.container} accessible>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header
          toggleMenu={toggleMenu}
          props="Second Vision"
          sendShutdownCommand={sendShutdownCommand}
        />
        <Devices />
        <Dashboard
          isOn={isOn}
          intervalDash={interval}
          batteryLevel={batteryLevel}
          currentModeIndex={currentModeIndex}
          currentMode={currentMode}
        />
        <About visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </ScrollView>
    </SafeAreaView>
  );
};
