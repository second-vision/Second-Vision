import { useEffect, useState } from "react";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { useNavigation } from "@react-navigation/native";
import { BleManager, State } from "react-native-ble-plx";
import {
  Text,
  View,
  Image,
  Dimensions,
  Pressable,
  BackHandler,
} from "react-native";
//import BleManager from "react-native-ble-manager";
import * as Speech from "expo-speech";
import { NavigationProp } from "@/app/types/types";
import { styles } from "./styles";

const bleManager = new BleManager();

export const BluetoothOff = () => {
  const navigation = useNavigation<NavigationProp>();
  const [bluetoothState, setBluetoothState] = useState<State | string>("");

  useEffect(() => {
    // Verificar o estado inicial do Bluetooth
    checkBluetoothState();

    speak("Habilite o Bluetooth no botão abaixo");

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
    if (bluetoothState === "PoweredOn") {
      navigation.navigate("BluetoothOnStack");
    }
  }, [bluetoothState, navigation]);

  const speak = async (text: string) => {
    Speech.speak(text, {
      language: "pt-BR",
    });
  };

  const enableBluetooth = async () => {
    try {
      console.debug("Bluetooth Ativado");
      await BluetoothStateManager.requestToEnable();
    } catch (error) {
      console.error("Bluetooth não foi ativado", error);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Image
          // source={require("../../assets/images/device_icon.png")}
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
