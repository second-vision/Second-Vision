import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { BleManager, State } from "react-native-ble-plx";
import { Text, View, Image, Pressable, BackHandler } from "react-native";
import * as Speech from "expo-speech";
import { NavigationProp } from "@/app/types/types";
import { styles } from "./styles";
import { requestPermissions, useSpeech } from "@/src/shared/hooks";
import { useBluetoothManager } from "@/src/shared/hooks/useBluetoothManager";
import { useSettings } from "@/src/shared/context";

const bleManager = new BleManager();

export const BluetoothOff = () => {
  const navigation = useNavigation<NavigationProp>();
  const [bluetoothState, setBluetoothState] = useState<State | string>("");
  const { speakEnabled } = useSettings();
  const { speak } = useSpeech(0);

  const { checkBluetoothState, enableBluetooth } = useBluetoothManager();

  useEffect(() => {
    const handleRequest = async () => {
      await requestPermissions();
    };
    handleRequest();
    checkBluetoothState();
    if (speakEnabled) {
      speak("Habilite o Bluetooth no botão abaixo");
    }

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
      Speech.stop();
      navigation.replace("BluetoothOnStack");
    }
  }, [bluetoothState, navigation]);

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require("../../shared/assets/images/device_icon.png")}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Ícone representando o Bluetooth"
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
          accessibilityHint="Toque para ativar o Bluetooth e acessar a tela de escaneamento"
          accessibilityRole="button"
        >
          <Text style={styles.scanButtonText}>Habilitar Bluetooth</Text>
        </Pressable>
      </View>
    </View>
  );
};
