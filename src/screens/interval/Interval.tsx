import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  TextInput,
  Text,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList, TabParamList } from "../../navigation";
import { About, Devices, Header } from "../../components";
import { styles } from "./style";

const { width } = Dimensions.get("window");
const MAX_INTERVAL_SECONDS = 30;

// Definir o tipo de navegação para o componente
type SomeComponentNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Home">,
  NativeStackNavigationProp<RootStackParamList>
>;

export const Interval = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const sendShutdownCommand = () => {};
  const [inputValueInt, setInputValueInt] = useState("0");

  // Função para validar e definir o valor do input
  const handleInputChange = (value: any) => {
    // Remove caracteres não numéricos e define o estado
    const filteredValue = value.replace(/[^0-9]/g, "");

    // Converte para número inteiro para comparação
    const intervalInSeconds = parseInt(filteredValue, 10);

    // Verifica se o valor é maior que o limite de 30 segundos
    if (intervalInSeconds > MAX_INTERVAL_SECONDS) {
      Alert.alert(
        "Valor excedido",
        "O intervalo máximo permitido é de 30 segundos.",
        [{ text: "OK" }]
      );
      setInputValueInt(`${MAX_INTERVAL_SECONDS}`);
    } else {
      setInputValueInt(filteredValue);
    }
  };

  const navigation = useNavigation<SomeComponentNavigationProp>();

  // Função para salvar e passar o valor convertido em milissegundos
  const handleSave = () => {
    const intervalInSeconds = parseInt(inputValueInt, 10);
    const intervalInMilliseconds = intervalInSeconds * 1000; // Converte segundos para milissegundos

    // Navega para a tela Home com o intervalo em milissegundos
    navigation.navigate("Home", {
      interval: intervalInMilliseconds, // Intervalo em milissegundos
    });
    //navigation.navigate("Home", { interval: intervalInMilliseconds });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header
          toggleMenu={toggleMenu}
          props="Second Vision"
          sendShutdownCommand={sendShutdownCommand}
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
    </SafeAreaView>
  );
};
