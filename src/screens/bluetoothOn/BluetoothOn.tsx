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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { BleManager, Device } from "react-native-ble-plx";
import * as Speech from "expo-speech";
import { About, Devices, Header } from "../../shared/components";
import { NavigationProp } from "@/app/types/types";
import { useMenu, useSettings } from "../../shared/context";
import { styles } from "./styles";
import {
  requestPermissions,
  useAnnouncements,
  useBluetoothManager,
  useSpeech,
} from "@/src/shared/hooks";

const bleManager = new BleManager();

export const BluetoothOn = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isMenuOpen, toggleMenu, closeMenu } = useMenu();
  const { speakEnabled } = useSettings();
  const { speak } = useSpeech(0);
  const [bluetoothState, setBluetoothState] = useState("PoweredOn");
  const [searchPerformed] = useState(false);

  const {
    checkBluetoothState,
    allDevices,
    connectedDevices,
    startScan,
    isScanning,
    connectToDevice,
    isScanningM,
  } = useBluetoothManager();

  useAnnouncements({
    isOn: null,
    mode: null,
    objectData: null,
    ocrData: null,
    battery: null,
    batteryDuration: null,
    interval: 0,
    hostspotUI: 2,
    isScanningM, // Apenas esses dois ultimos estados são necessários
    allDevices,
  });

  useEffect(() => {
    const handleRequest = async () => {
      await requestPermissions();
    };
    handleRequest();

    checkBluetoothState();
    if (speakEnabled) {
    speak("Clique em escanear para procurar dispositivos");
    }
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
      Speech.stop();
      navigation.replace("BluetoothOffStack");
    }
  }, [bluetoothState]);

  const sendShutdownCommand = () => {};

  const renderItem = ({ item }: { item: Device }) => {
    const isConnected = connectedDevices.has(item.id);
    const backgroundColor = isConnected ? "#45A7FF" : "#F6F7F8";

    return (
      <TouchableHighlight
        underlayColor="#0082FC"
        onPress={() => connectToDevice(item)}
        accessibilityRole="button"
        accessibilityLabel={`Dispositivo ${item.name || "sem nome"}. ${
          isConnected ? "Conectado." : "Toque para conectar."
        }`}
      >
        <View style={[styles.row, { backgroundColor }]}>
          <Ionicons
            name="bluetooth-outline"
            size={30}
            color="#0A398A"
            accessible={false}
          />
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

        <StatusBar />
        <SafeAreaView style={styles.body}>
          <View style={styles.buttonGroup}>
            <Pressable
              style={styles.scanButton}
              onPress={startScan}
              accessibilityRole="button"
              accessibilityLabel={
                isScanning ? "Parar escaneamento" : "Iniciar escaneamento"
              }
              accessibilityHint="Ativa ou interrompe o escaneamento de dispositivos Bluetooth"
            >
              <Text style={styles.scanButtonText}>
                {isScanning ? "Escaneando..." : "Escanear Bluetooth"}
              </Text>
            </Pressable>
          </View>

          {searchPerformed && allDevices.length === 0 && (
            <View style={styles.row}>
              <Text style={styles.noPeripherals} accessibilityRole="alert">
                Nenhum dispositivo encontrado. Toque no botão Escanear ou abra o
                menu no canto superior esquerdo para ver o tutorial.
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

        <About visible={isMenuOpen} onClose={closeMenu} />
    </View>
  );
};
