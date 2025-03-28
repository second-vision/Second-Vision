import React, { useEffect, useState } from "react";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { useNavigation, StackActions } from "@react-navigation/native";
import { BleManager, Device, BleError, Characteristic, State } from "react-native-ble-plx";
import {
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
  PermissionsAndroid,
  BackHandler,
} from "react-native";
//import BleManager from "react-native-ble-manager";
import * as Speech from "expo-speech";
import { NavigationProp } from "@/app/types";


const bleManager = new BleManager();

const { width } = Dimensions.get("window");

export default function BluetoothOffScreen() {
  const navigation = useNavigation<NavigationProp>();
    const [bluetoothState, setBluetoothState] = useState<State | string>("");
  
    useEffect(() => {
      speak("Habilite o Bluetooth no botão abaixo");
     
      // Verificar o estado inicial do Bluetooth
      checkBluetoothState();
  
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
        console.log("Bluetooth state changed:", state);
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
      console.log("Bluetooth state:", state);
      setBluetoothState(state); // Atualiza o estado com o valor atual
    };
  
    useEffect(() => {
      if (bluetoothState === "PoweredOn") {
        console.log("Bluetooth está ligado");
      
        navigation.navigate('BluetoothOn');
       
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Poppins",
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1.3,
    marginBottom: 60,
  },
  text: {
    fontSize: width * 0.044,
    fontWeight: "medium",
  },
  headerText: {
    fontSize: width * 0.055,
    marginBottom: 10,
    color: "#0A398A",
    fontWeight: "medium",
  },
  textBlue: {
    width: "100%",
    paddingLeft: 40,
    bottom: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    width: "70%",
  },
  scanButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderColor: "#0a398a",
    backgroundColor: "#0A398A",
    borderWidth: 2,
    margin: 10,
    borderRadius: 10,
    flex: 1,
    top: 30,
  },
  scanButtonText: {
    fontSize: width * 0.04,
    letterSpacing: 0.25,
    color: "#fff",
  },
});