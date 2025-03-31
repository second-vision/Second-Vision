import { useEffect, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
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
    setBluetoothState(state);
  };

  useEffect(() => {
    const backAction = () => {
      return true;
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
        navigation.replace("TermsOfUseStack");
      } else {
        handleBluetoothState();
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

    checkTermsAcceptance();
  }, [bluetoothState, navigation]);
  return <View></View>;
};
