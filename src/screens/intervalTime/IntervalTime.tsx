import { useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  AccessibilityInfo,
} from "react-native";

import {
  About,
  AppText,
  BottomBar,
  Devices,
  Header,
} from "../../shared/components";
import { styles } from "./styles";
import { useHomePropsContext, useMenu } from "@/src/shared/context";

import { FontSizes } from "@/src/shared/constants/fontSizes";
import { useRouter } from "expo-router";
const MAX_INTERVAL_SECONDS = 30;

export const IntervalTime = () => {
  const router = useRouter();
  const { isMenuOpen, toggleMenu } = useMenu();
  const inputRef = useRef<TextInput>(null);

  const { interval, mode, setIntervalValue, hostspot, deviceInfo } =
    useHomePropsContext();
  const [inputValueInt, setInputValueString] = useState("0");

  const sendShutdownCommand = () => {};

  const handleInputChange = (value: string) => {
    const filteredValue = value.replace(/[^0-9]/g, "");

    if (!filteredValue) {
      setInputValueString("0");
      return;
    }

    const intervalInSeconds = parseInt(filteredValue, 10);

    if (intervalInSeconds < 0) {
      Alert.alert("Valor inválido", "O valor não pode ser negativo.");
      setInputValueString("0");
      return;
    }

    if (intervalInSeconds > MAX_INTERVAL_SECONDS) {
      Alert.alert(
        "Valor excedido",
        `O intervalo máximo permitido é de ${MAX_INTERVAL_SECONDS} segundos.`,
        [{ text: "OK", onPress: () => inputRef.current?.focus() }]
      );
      setInputValueString(MAX_INTERVAL_SECONDS.toString());
    } else {
      setInputValueString(filteredValue);
    }
  };

  const handleSave = () => {
    const intervalInSeconds = parseInt(inputValueInt, 10) || 0;
    setIntervalValue(intervalInSeconds);
    AccessibilityInfo.announceForAccessibility(`Intervalo salvo com sucesso.`);
    router.navigate("/home-stack");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header
          toggleMenu={toggleMenu}
          props="Second Vision"
          sendShutdownCommand={sendShutdownCommand}
          device={null}
        />
        <Devices />

        <View style={styles.interval}>
          <AppText
            baseSize={FontSizes.Large}
            style={styles.intervalTitle}
            accessibilityRole="header"
          >
            Intervalo entre falas
          </AppText>

          <AppText baseSize={FontSizes.Normal} style={styles.intervalText}>
            Regule o intervalo entre as falas emitidas após Second Vision
            efetuar a detecção.
          </AppText>

          <TextInput
            ref={inputRef}
            style={styles.inputInterval}
            onChangeText={handleInputChange}
            value={inputValueInt}
            placeholder="Digite o intervalo em segundos"
            keyboardType="numeric"
            maxLength={3}
            accessibilityLabel="Intervalo entre falas, em segundos"
            accessibilityHint="Digite um número de 0 a 30 segundos para configurar o intervalo"
          />

          <Pressable
            style={styles.intervalButton}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Salvar intervalo"
            accessibilityHint="Toque para salvar e voltar para a tela inicial"
          >
            <AppText
              baseSize={FontSizes.Normal}
              style={styles.intervalButtonText}
            >
              Salvar
            </AppText>
          </Pressable>
        </View>

        <About visible={isMenuOpen} onClose={toggleMenu} />
      </ScrollView>

      <BottomBar
        mode={mode}
        hostspot={hostspot}
        interval={interval}
        deviceInfo={deviceInfo?.model!}
      />
    </SafeAreaView>
  );
};
