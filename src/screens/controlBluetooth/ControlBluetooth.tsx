import { useEffect } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";

import { NavigationProp } from "@/src/shared/types/types";
import { useBluetoothManager, useTermsManager } from "@/src/shared/hooks";

export const ControlBluetooth = () => {
  const navigation = useNavigation<NavigationProp>();

  const { checkBluetoothState, handleBluetoothState, bluetoothState } =
    useBluetoothManager();

  const { checkTermsAcceptance } = useTermsManager();

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
