import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { BackHandler } from "react-native";

import { useBluetoothManager, useTermsManager } from "@/src/shared/hooks";

export const ControlBluetooth = () => {
  const router = useRouter();

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
  }, [bluetoothState, router]);
  return <View></View>;
};
