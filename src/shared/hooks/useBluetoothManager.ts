import { useState } from "react";
import { BleManager, State, Device } from "react-native-ble-plx";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { useDeviceContext } from "../context";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@/src/shared/types/types";
import * as Speech from "expo-speech";
const bleManager = new BleManager();

import { Alert } from "react-native";
import {
  CHARACTERISTIC_UUID_DEVICE_INFO,
  DATA_SERVICE_UUID,
} from "../constants";

export function useBluetoothManager() {
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningM, setIsScanningM] = useState(true);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<Set<string>>(
    new Set()
  );
  const { setDeviceConnection } = useDeviceContext();
  const navigation = useNavigation<NavigationProp>();
  const [bluetoothState, setBluetoothState] = useState<State | string>("");

  const checkBluetoothState = async () => {
    const state: State = await bleManager.state();
    setBluetoothState(state);
  };

  const enableBluetooth = async () => {
    try {
      await BluetoothStateManager.requestToEnable();
    } catch (error) {
      console.error("Bluetooth não foi ativado", error);
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const startScan = () => {
    setIsScanning(true);
    setIsScanningM(true);
    const targetDeviceNameV0 = "Second Vision V0";
    const targetDeviceNameV5 = "Second Vision V5";

    // Inicia o escaneamento
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }

      // Verifica se o dispositivo tem o nome desejado
      if (
        device &&
        (device.name === targetDeviceNameV0 ||
          device.name === targetDeviceNameV5)
      ) {
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
      // Conecta e descobre serviços/características
      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();

      if (!(await connectedDevice.isConnected())) {
        throw new Error("Falha ao manter a conexão após o pareamento.");
      }

      setDeviceConnection(connectedDevice);
      Speech.stop();
      navigation.replace("HomeStack");
    } catch (e) {
      console.error("FALHA GERAL NA CONEXÃO/PAREAMENTO", e);
      Alert.alert(
        "Falha na Conexão",
        `Não foi possível estabelecer uma conexão segura. Tente novamente.`
      );
    }
  };

  const handleBluetoothState = () => {
    if (bluetoothState === "Resetting") {
      const timer = setInterval(async () => {
        const state: State = await bleManager.state();
        setBluetoothState(state);
        if (state === "PoweredOn" || state === "PoweredOff") {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }

    if (bluetoothState === "PoweredOn") {
      Speech.stop();
      navigation.replace("BluetoothOnStack");
    } else if (bluetoothState === "PoweredOff") {
      Speech.stop();
      navigation.replace("BluetoothOffStack");
    }
  };

  return {
    enableBluetooth,
    checkBluetoothState,
    allDevices,
    connectedDevices,
    startScan,
    isScanning,
    connectToDevice,
    handleBluetoothState,
    bluetoothState,
    isScanningM,
  };
}
