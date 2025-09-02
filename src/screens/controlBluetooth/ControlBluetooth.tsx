import { useEffect, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { BleManager, State } from "react-native-ble-plx";

import { NavigationProp } from "@/app/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBluetoothManager, useTermsManager } from "@/src/shared/hooks";

const bleManager = new BleManager();

export const ControlBluetooth = () => {
  const navigation = useNavigation<NavigationProp>();

  const {
        checkBluetoothState,
        handleBluetoothState,
        bluetoothState
  
      } = useBluetoothManager();

      const {
        checkTermsAcceptance,
  
      } = useTermsManager();

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

    checkTermsAcceptance(handleBluetoothState);
  }, [bluetoothState, navigation]);
  return <View></View>;
};
