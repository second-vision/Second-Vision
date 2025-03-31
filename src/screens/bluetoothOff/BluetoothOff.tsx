import { useEffect, useState } from "react";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { useNavigation } from "@react-navigation/native";
import { BleManager, State } from "react-native-ble-plx";
import { Text, View, Image, Pressable, BackHandler } from "react-native";
import * as Speech from "expo-speech";

import { NavigationProp } from "@/app/types/types";
import { styles } from "./styles";
import { requestPermissions } from "@/src/shared/hooks";

const bleManager = new BleManager();

export const BluetoothOff = () => {
  const navigation = useNavigation<NavigationProp>();
  const [bluetoothState, setBluetoothState] = useState<State | string>("");

  useEffect(() => {
    const handleRequest = async () => {
      await requestPermissions();
    };

    handleRequest();

    checkBluetoothState();

    speak("Habilite o Bluetooth no botão abaixo");

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
    if (bluetoothState === "PoweredOn") {
      navigation.replace("BluetoothOnStack");
    }
  }, [bluetoothState, navigation]);

  const checkBluetoothState = async () => {
    const state: State = await bleManager.state();
    setBluetoothState(state); 
  };

  const speak = async (text: string) => {
    Speech.speak(text, {
      language: "pt-BR",
    });
  };

  const enableBluetooth = async () => {
    try {
      await BluetoothStateManager.requestToEnable();
    } catch (error) {
      console.error("Bluetooth não foi ativado", error);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require("../../shared/assets/images/device_icon.png")}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Ícone de dispositivo Bluetooth"
          accessibilityHint="Imagem que representa a função de habilitar o Bluetooth"
        />
      </View>
      <View style={styles.textBlue}>
        <Text style={styles.headerText} accessibilityRole="header">
          Ligar o Bluetooth.
        </Text>
        <Text style={styles.text}>
          Acesse o centro de controle e ligue o Bluetooth.
        </Text>
      </View>
      <View style={styles.buttonGroup}>
        <Pressable
          style={styles.scanButton}
          onPress={enableBluetooth}
          accessibilityLabel="Habilitar Bluetooth"
          accessibilityHint="Toque para ativar o Bluetooth e acessar a tela de controle"
          accessibilityRole="button"
        >
          <Text style={styles.scanButtonText}>Habilitar Bluetooth</Text>
        </Pressable>
      </View>
    </View>
  );
};
