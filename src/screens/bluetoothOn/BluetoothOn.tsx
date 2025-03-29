import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  BackHandler,
  NativeEventEmitter,
  NativeModules,
  TouchableHighlight,
  SafeAreaView,
  StatusBar,
  Text,
  Pressable,
  FlatList,
  Vibration,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { BleManager, Device, State } from "react-native-ble-plx";

import { About, Devices, Header } from "../../shared/components";
import { NavigationProp } from "@/app/types/types";
import { useDeviceContext } from "../../shared/context";
import { styles } from "./styles";
import { requestPermissions } from "@/src/shared/hooks";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const bleManager = new BleManager();

export const BluetoothOn = () => {
  const { setDeviceConnection } = useDeviceContext();

  const navigation = useNavigation<NavigationProp>();
  const [bluetoothState, setBluetoothState] = useState("PoweredOn");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [BackColor, setBackColor] = useState("#F6F7F8");
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Lógica do scan
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningM, setIsScanningM] = useState(true);
  const [ControlnoPeripheral, setControlnoPeripheral] = useState(false);

  const [allDevices, setAllDevices] = useState<Device[]>([]); // Usando allDevices no lugar de peripherals
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [showDevicesWithoutName, setShowDevicesWithoutName] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const handleRequest = async () => {
      await requestPermissions();
    };
    handleRequest();
    // Verificar o estado inicial do Bluetooth
    checkBluetoothState();
    // Verificar o estado inicial do Bluetooth

    const backAction = () => {
      // Impede o comportamento padrão do botão de voltar
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Adiciona o listener para mudanças no estado do Bluetooth
    const stateSubscription = bleManager.onStateChange((state) => {
      setBluetoothState(state); // Atualiza o estado com a mudança
    }, true); // O true significa que será chamado imediatamente com o estado atual

    // Cleanup
    return () => {
      stateSubscription.remove();
      backHandler.remove();
    };
  }, []);

  const checkBluetoothState = async () => {
    const state: State = await bleManager.state();
    setBluetoothState(state); // Atualiza o estado com o valor atual
  };

  useEffect(() => {
    if (bluetoothState === "PoweredOff") {
      navigation.navigate("BluetoothOffStack");
    }
  }, [bluetoothState]);

  // navigation

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const startScan = () => {
    setIsScanning(true);
    const targetDeviceName = "Second Vision"; // Substitua com o nome desejado do dispositivo

    // Inicia o escaneamento
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }

      // Verifica se o dispositivo tem o nome desejado
      if (device && device.name === targetDeviceName) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

    // Interrompe o escaneamento após 10 segundos
    setTimeout(() => {
      bleManager.stopDeviceScan(); // Para o escaneamento
      setIsScanningM(false);
      setIsScanning(false);
    }, 10000); // 10000 milissegundos = 10 segundos
  };

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      // startStreamingData(deviceConnection);
      // Redirecionar home

      // Atualiza o estado de "dispositivos conectados"
      setConnectedDevices((prev) => new Set(prev).add(device.id));
      setDeviceConnection(device);
      navigation.navigate("HomeStack");
    } catch (e) {
      console.error("FAILED TO CONNECT", e);
    }
  };

  // const connectPeripheral = async () => {};

  function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  const speak = async (text: string) => {
    Speech.speak(text, {
      language: "pt-BR",
    });
  };

  // handle StopScan

  const renderItem = ({ item }: { item: Device }) => {
    const backgroundColor = connectedDevices.has(item.id)
      ? "#45A7FF"
      : "#F6F7F8";

    return (
      <TouchableHighlight
        underlayColor="#0082FC"
        onPress={() => connectToDevice(item)}
        accessible
        accessibilityLabel={`Clique para conectar a ${item.name || item.id}.`}
      >
        <View style={[styles.row, { backgroundColor }]}>
          <Ionicons name="bluetooth-outline" size={30} color={"#0A398A"} />
          <Text style={styles.peripheralName}>{item.name || "Sem nome"}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  const sendShutdownCommand = () => {};

  useEffect(() => {
    if (!isScanningM) {
      if (!ControlnoPeripheral) {
        Vibration.vibrate(500); // Vibra por 500 milissegundos
        speak(
          "Nenhum periférico encontrado, em caso de dúvida acesse o tutorial no menu de informações do cabeçalho."
        );
      } else {
        console.debug("[useEffect] Periférico encontrado.");
      }
    }
  }, [isScanningM]);

  return (
    <View style={styles.container}>
      <Header
        toggleMenu={toggleMenu}
        props="Meus Dispositivos"
        sendShutdownCommand={sendShutdownCommand}
        device={null}
      />
      <Devices />
      <View />
      <>
        <StatusBar />
        <SafeAreaView style={styles.body}>
          <View style={styles.buttonGroup}>
            <Pressable
              style={styles.scanButton}
              onPress={startScan}
              accessible
              accessibilityLabel={
                isScanning ? "Parar escaneamento" : "Iniciar escaneamento"
              }
              accessibilityHint="Clique aqui para iniciar ou parar o escaneamento de dispositivos Bluetooth."
            >
              <Text style={styles.scanButtonText}>
                {isScanning ? "Escaneando..." : "Escanear Bluetooth"}
              </Text>
            </Pressable>
          </View>

          {searchPerformed &&
            allDevices.length === 0 && ( // Usando allDevices aqui
              <View style={styles.row}>
                <Text style={styles.noPeripherals}>
                  Sem periféricos, pressione "Escanear" para encontrar ou acesse
                  o menu de informações no canto superior esquerdo da tela para
                  receber um tutorial de como utilizar o sistema.
                </Text>
              </View>
            )}

          <FlatList
            data={allDevices} // Substituí o peripherals por allDevices
            contentContainerStyle={{ rowGap: 12 }}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </SafeAreaView>
      </>
      <View />

      <About visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
};
