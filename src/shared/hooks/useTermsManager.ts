import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import ExitApp from "react-native-exit-app";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";

export function useTermsManager() {
  const router = useRouter();

  const checkTermsAcceptance = async (handleBluetoothState: () => void) => {
    const accepted = await AsyncStorage.getItem("hasAcceptedTerms");
    if (accepted !== "true") {
      Speech.stop();
      router.replace("/terms-of-use-stack");
    } else {
      handleBluetoothState();
    }
  };

  const acceptTerms = async () => {
    await AsyncStorage.setItem("hasAcceptedTerms", "true");
    Speech.stop();
    router.replace("/control-bluetooth-stack");
  };

  const rejectTerms = () => {
    Alert.alert(
      "Rejeitar Termos",
      "Você realmente deseja rejeitar os termos e sair do aplicativo?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: () => {
            ExitApp.exitApp();
          },
        },
      ]
    );
  };

  return {
    checkTermsAcceptance,
    acceptTerms,
    rejectTerms,
  };
}
