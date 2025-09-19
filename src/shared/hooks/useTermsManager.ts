import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@/src/shared/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import ExitApp from "react-native-exit-app";
import * as Speech from "expo-speech";

export function useTermsManager() {
  const navigation = useNavigation<NavigationProp>();

  const checkTermsAcceptance = async (handleBluetoothState: () => void) => {
    const accepted = await AsyncStorage.getItem("hasAcceptedTerms");
    if (accepted !== "true") {
      Speech.stop();
      navigation.replace("TermsOfUseStack");
    } else {
      handleBluetoothState();
    }
  };

  const acceptTerms = async () => {
    await AsyncStorage.setItem("hasAcceptedTerms", "true");
    Speech.stop();
    navigation.replace("ControlBluetoothStack");
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
