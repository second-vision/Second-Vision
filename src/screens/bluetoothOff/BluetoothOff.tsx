import { useEffect, useState } from "react";
import { BleManager, State } from "react-native-ble-plx";
import { View, Image, Pressable, BackHandler } from "react-native";
import * as Speech from "expo-speech";
import { styles } from "./styles";
import { requestPermissions, useSpeech } from "@/src/shared/hooks";
import { useBluetoothManager } from "@/src/shared/hooks/useBluetoothManager";
import { useSettings } from "@/src/shared/context";
import { AppText } from "@/src/shared/components";
import { FontSizes } from "@/src/shared/constants/fontSizes";
import { useRouter } from "expo-router";

const bleManager = new BleManager();

export const BluetoothOff = () => {
  const router = useRouter();
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
      router.replace("/bluetooth-on-stack");
    }
  }, [bluetoothState, router]);

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
        <View>
          <AppText
            baseSize={FontSizes.Large}
            style={styles.headerText}
            accessibilityRole="header"
          >
            Ligar o Bluetooth.
          </AppText>
          <AppText baseSize={FontSizes.Normal} style={styles.text}>
            Acesse o centro de controle e ligue o Bluetooth.
          </AppText>
        </View>
      </View>
      <View style={styles.buttonGroup}>
        <Pressable
          style={styles.scanButton}
          onPress={enableBluetooth}
          accessibilityHint="Toque para ativar o Bluetooth e acessar a tela de escaneamento"
          accessibilityRole="button"
        >
          <AppText baseSize={FontSizes.Normal} style={styles.scanButtonText}>
            Habilitar Bluetooth
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};
