import { useEffect, useState } from "react";
import { View } from "react-native";
import { useNavigation, StackActions } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { BleManager, State } from "react-native-ble-plx";
import { NavigationProp } from "@/app/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const bleManager = new BleManager();

export const ControlBluetooth = () => {
  const [bluetoothState, setBluetoothState] = useState("");
  const navigation = useNavigation<NavigationProp>();

  const checkBluetoothState = async () => {
    const state: State = await bleManager.state();
    setBluetoothState(state); // Atualiza o estado com o valor atual
  };

  useEffect(() => {
    const backAction = () => {
      return true; // Impede o comportamento padrão do botão de voltar
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    checkBluetoothState();

    return () => {
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    const checkTermsAcceptance = async () => {
      const accepted = await AsyncStorage.getItem("hasAcceptedTerms");
      if (accepted !== "true") {
        // Se o usuário não aceitou os termos, redireciona para a tela de termos
        navigation.navigate("TermsOfUseStack");
      } else {
        // Se aceitou, continua com a lógica do Bluetooth
        handleBluetoothState();
      }
    };

    const handleBluetoothState = () => {
      console.log(
        "Verificando o estado do Bluetooth para navegação:",
        bluetoothState
      );

      if (bluetoothState === "Resetting") {
        // Aguarda o estado do Bluetooth mudar
        const timer = setInterval(async () => {
          const state: State = await bleManager.state();
          setBluetoothState(state); // Atualiza o estado com o valor atual
          if (state === "PoweredOn" || state === "PoweredOff") {
            clearInterval(timer); // Para de verificar quando o Bluetooth estabilizar
          }
        }, 1000); // Verifica a cada 1 segundo

        return () => clearInterval(timer);
      }

      if (bluetoothState === "PoweredOn") {
        navigation.navigate("BluetoothOnStack");
      } else if (bluetoothState === "PoweredOff") {
        navigation.navigate("BluetoothOffStack");
      }
    };

    checkTermsAcceptance();
  }, [bluetoothState, navigation]);
  return <View></View>;
};
