import React from "react";
import { useState } from "react";
import { Button, Text, View } from "react-native";
import { BleManager, Device, BleError, Characteristic } from "react-native-ble-plx";
import styles from "../assets/styles/styles";
import ParallaxScrollView from "./ParallaxScrollView";
import { Base64 } from "js-base64";

export const bleManager = new BleManager();
let showDevicesWithoutName = false;
const DATA_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0"; // * Get from the device manufacturer - 9800 for the BLE iOs Tester App "MyBLESim"
const CHARACTERISTIC_UUID = "12345678-1234-5678-1234-56789abcdef1"; // * Get from the device manufacturer - 9801-9805 for the BLE iOs Tester App "MyBLESim"

export default function MainPage() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [dataReceived, setDataReceived] = useState<string>("...waiting.");

  // Managers Central Mode - Scanning for devices
  const isDuplicteDevice = (devices: Device[], nextDevice: Device) => 
    devices.findIndex((device) => nextDevice.id === device.id) > -1;
  
  function scanForPeripherals() {
    console.log("Scanning for peripherals...");
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
      }
      if (device) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  }

  // Decoding the data received from the device and defining the callback
  async function startStreamingData(device: Device) {
    if (device) {
      device.monitorCharacteristicForService(DATA_SERVICE_UUID, CHARACTERISTIC_UUID, onDataUpdate);
    } else {
      console.log("No Device Connected");
    }
  }

  // Called when data is received on the connected device
  const onDataUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
    if (error) {
      console.error(error);
      return;
    } else if (!characteristic?.value) {
      console.warn("No Data was received!");
      return;
    }

    // * IMPORTANT: The BLE iOs App "MyBLESim" is taking the input value, converting into asc2, and sending the base64 encoded value
    // * So, to get 4, I should insert 52 in the app, and it will send the base64 encoded value of 4
    // * To get 7, I should insert 55 in the app, and it will send the base64 encoded value of 7
    // * and so on...

    const dataInput = Base64.decode(characteristic.value);
    setDataReceived(dataInput);
  };

  // Managers Central Mode - Connecting to a device
  async function connectToDevice(device: Device) {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.error("FAILED TO CONNECT", e);
    }
  }

  return (
    <>
      <ParallaxScrollView>
        <Text style={styles.textTitle}>Central Mode</Text>
        <Text style={styles.textTitle}>Listing Devices</Text>
        <View style={styles.containerButtons}>
          <Button title="Start" onPress={scanForPeripherals} />
          {/* TODO: Implement this button
        <Button
          title="Stop"
          onPress={() => {
            console.log("Stop Scanning");
            bleManager.stopDeviceScan;
          }}
        /> */}
          <Button title="Clear" onPress={() => setAllDevices([])}></Button>
          <Button
            title={showDevicesWithoutName ? "Hide Nameless" : "Show Nameless"}
            onPress={() => {
              showDevicesWithoutName = !showDevicesWithoutName;
              setAllDevices([...allDevices]);
              // !DEBUG: console.warn("Showing Devices Nameless: ", showDevicesWithoutName);
            }}></Button>
        </View>
        <View style={styles.containerDevices}>
          {allDevices.map((device) => {
            if (showDevicesWithoutName || device.name) {
              return (
                <React.Fragment key={device.id}>
                  <Text>
                    📲 - {device.id} - {device.name}
                  </Text>
                  <Button
                    key={`button${device.id}`}
                    title="Connect"
                    onPress={() => connectToDevice(device)}
                  />
                </React.Fragment>
              );
            }
            return null;
          })}
        </View>
      </ParallaxScrollView>
      {connectedDevice && (
        <View style={styles.containerConnectedDevice}>
          <Text style={styles.textTitle}>Connected to Device: </Text>
          <View style={styles.containerDevices}>
            <Text>ID: {connectedDevice.id}</Text>
            <Text>Name: {connectedDevice.name}</Text>
            <Text>Data Received: {dataReceived} </Text>
          </View>
        </View>
      )}
    </>
  );
}
