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
import { useDeviceContext, useMenu } from "../../shared/context";
import { styles } from "./styles";
import { requestPermissions, useAnnouncements, useBluetoothManager } from "@/src/shared/hooks";

const bleManager = new BleManager();

export const BluetoothOn = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isMenuOpen, toggleMenu, closeMenu } = useMenu();

  const [bluetoothState, setBluetoothState] = useState("PoweredOn");
  const [searchPerformed] = useState(false);


  const {
    checkBluetoothState,
    allDevices,
    connectedDevices,
    startScan,
    isScanning,
    connectToDevice,
    isScanningM
  
      } = useBluetoothManager();

      //Estados para falas
  useAnnouncements({
    isOn: null,
    mode: null,
    objectData: null,
    ocrData: null,
    battery: null,
    batteryDuration: null,
    interval: 0,
    isScanningM,
    allDevices
  });
      

  
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
  }, [bluetoothState]);

  const sendShutdownCommand = () => {};

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

      <About visible={isMenuOpen} onClose={closeMenu} />
    </View>
  );
};
