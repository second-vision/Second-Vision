import { useEffect, useState } from "react";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { useNavigation, StackActions } from "@react-navigation/native";
import {
  Dimensions,
  Platform,
  PermissionsAndroid,
  BackHandler,
} from "react-native";
import BleManager from "react-native-ble-manager";
import { speak } from "expo-speech";

const { width } = Dimensions.get("window");

export const BluetoothOffScreen = () => {
  const navigation = useNavigation();
  const [bluetoothState, setBluetoothState] = useState("");

  useEffect(() => {
    try {
      BleManager.start({ showAlert: false })
        .then(() => console.debug("BleManager iniciado."))
        .catch((error: any) =>
          console.error("BeManager nao pode iniciar.", error)
        );
    } catch (error) {
      console.error("erro inesperado ao iniciar o BleManager.", error);
      return;
    }

    handleAndroidPermissions();
    speak("Habilite o Bluetooth no botão abaixo");
  }, []);

  useEffect(() => {
    const checkBluetoothState = async () => {
      const state = await BluetoothStateManager.getState();
      setBluetoothState(state);
    };

    const backAction = () => {
      // Impede o comportamento padrão do botão de voltar
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    checkBluetoothState();

    const subscription = BluetoothStateManager.onStateChange((state) => {
      setBluetoothState(state);
    }, true);

    return () => {
      subscription.remove();
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    if (bluetoothState === "PoweredOn") {
      navigation.dispatch(StackActions.replace("ControlScreen"));
    }
  }, [bluetoothState, navigation]);

  const handleAndroidPermissions = () => {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then((result) => {
        if (result) {
          console.debug(
            "[handleAndroidPermissions] O usuário aceita permissões de tempo de execução Android 12+"
          );
        } else {
          //console.error( "[handleAndroidPermissions] O usuário recusa permissões de tempo de execução Android 12+");
        }
      });
    } else if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then((checkResult) => {
        if (checkResult) {
          console.debug(
            "[handleAndroidPermissions] permissão de tempo de execução Android <12 já está OK"
          );
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ).then((requestResult) => {
            if (requestResult) {
              console.debug(
                "[handleAndroidPermissions] O usuário aceita permissão de execução android <12"
              );
            } else {
              //console.error("[handleAndroidPermissions] Usuário recusa permissão de execução android <12");
            }
          });
        }
      });
    }
  };
};
