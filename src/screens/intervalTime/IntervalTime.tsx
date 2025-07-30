import { useState } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  TextInput,
  Text,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation } from "expo-router";

import { About, BottomBar, Devices, Header } from "../../shared/components";
import { styles } from "./styles";
import { useHomePropsContext } from "@/src/shared/context";
import { NavigationProp } from "@/app/types/types";

const MAX_INTERVAL_SECONDS = 30;

export const IntervalTime = () => {
  const navigation = useNavigation<NavigationProp>();

  const { interval, mode, setIntervalValue, hostspot } = useHomePropsContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputValueInt, setInputValueInt] = useState("0");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const sendShutdownCommand = () => {};
  const handleInputChange = (value: string) => {
    const filteredValue = value.replace(/[^0-9]/g, "");

    const intervalInSeconds = parseInt(filteredValue, 10);

    if (intervalInSeconds > MAX_INTERVAL_SECONDS) {
      Alert.alert(
        "Valor excedido",
        "O intervalo máximo permitido é de 30 segundos.",
        [{ text: "OK" }]
      );
      setIntervalValue(MAX_INTERVAL_SECONDS);
      setInputValueInt(MAX_INTERVAL_SECONDS.toString());
    } else {
      setIntervalValue(intervalInSeconds);
      setInputValueInt(filteredValue);
    }
  };

  const handleSave = () => {
    navigation.navigate("HomeStack");
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
          <Text style={styles.intervalTitle}>Intervalo entre falas:</Text>

          <Text style={styles.intervalText}>
            Regule o intervalo entre as falas emitidas após Second Vision
            efetuar a detecção.
          </Text>

          <TextInput
            style={styles.inputInterval}
            onChangeText={handleInputChange}
            value={inputValueInt}
            placeholder="Intervalo entre Falas"
            keyboardType="numeric"
            accessibilityLabel="Campo de intervalo entre falas"
            accessibilityHint="Insira o intervalo em milissegundos entre as falas emitidas"
          />

          <Pressable
            style={styles.intervalButton}
            onPress={handleSave}
            accessibilityLabel="Salvar intervalo"
            accessibilityHint="Toque aqui para salvar o intervalo configurado"
          >
            <Text style={styles.intervalButtonText}>Salvar</Text>
          </Pressable>
        </View>

        <About visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </ScrollView>
      <BottomBar mode={mode} hostspot={hostspot} interval={interval} />
    </SafeAreaView>
  );
};
