import { useState } from "react";
import { BleManager, State, Device } from "react-native-ble-plx";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { useDeviceContext } from "../context";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@/app/types/types";
const bleManager = new BleManager();

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
          navigation.replace("BluetoothOnStack");
        } else if (bluetoothState === "PoweredOff") {
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
    isScanningM

  };
}