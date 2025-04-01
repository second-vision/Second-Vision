import { useState, useEffect } from "react";
import {
  View,
  BackHandler,
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

const bleManager = new BleManager();

export const BluetoothOn = () => {
  const { setDeviceConnection } = useDeviceContext();
  const navigation = useNavigation<NavigationProp>();

  const [bluetoothState, setBluetoothState] = useState("PoweredOn");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isScanningM, setIsScanningM] = useState(true);

  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const handleRequest = async () => {
      await requestPermissions();
    };
    handleRequest();
  
    checkBluetoothState();
   

    const backAction = () => {
     
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

   
    const stateSubscription = bleManager.onStateChange((state) => {
      setBluetoothState(state); 
    }, true); 

    return () => {
      stateSubscription.remove();
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    if (bluetoothState === "PoweredOff") {
      navigation.replace("BluetoothOffStack");
    }
  }, [bluetoothState, isScanningM]);

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

  const checkBluetoothState = async () => {
    const state: State = await bleManager.state();
    setBluetoothState(state); // Atualiza o estado com o valor atual
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const startScan = () => {
    setIsScanning(true);
    setIsScanningM(true);
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

   
    setTimeout(() => {
      bleManager.stopDeviceScan(); 
      if (allDevices.length === 0) {
        setIsScanningM(false);
      }
      setIsScanning(false);
    }, 10000); 
  };

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      
      setConnectedDevices((prev) => new Set(prev).add(device.id));
      setDeviceConnection(device);
      navigation.replace("HomeStack");
    } catch (e) {
      console.error("FAILED TO CONNECT", e);
    }
  };

  const speak = async (text: string) => {
    Speech.speak(text, {
      language: "pt-BR",
    });
  };

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
            allDevices.length === 0 && ( 
              <View style={styles.row}>
                <Text style={styles.noPeripherals}>
                  Sem periféricos, pressione "Escanear" para encontrar ou acesse
                  o menu de informações no canto superior esquerdo da tela para
                  receber um tutorial de como utilizar o sistema.
                </Text>
              </View>
            )}

          <FlatList
            data={allDevices} 
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
