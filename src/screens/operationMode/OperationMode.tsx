import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"; 

import { About, Devices, Header } from "../../components";
import { TabParamList } from "../../navigation";
import { styles } from "./style";

type TabNavigatorProp = BottomTabNavigationProp<TabParamList, "Home">; // Definir a tipagem de navegação correta

export const OperationMode = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useNavigation<TabNavigatorProp>();
  const isFirstRender = useRef(true); // Variável para controlar a primeira renderização

  const [selectedMode, setSelectedMode] = useState(0); // Armazena a escolha

  const handleSelectMode = (mode: any) => {
    setSelectedMode(mode);
  };
  useEffect(() => {
    if (isFirstRender.current) {
      // Na primeira renderização, apenas define a flag como false
      isFirstRender.current = false;
    } else {
      handleSave();
    }
  }, [selectedMode]);

  const sendShutdownCommand = () => {};

  const handleSave = () => {
    // Navega para a Home passando o modo selecionado
    navigation.navigate("Home", { mode: selectedMode });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

        <View style={styles.operationMode}>
          <Text style={styles.operationModeTitle}>Modos de Operação:</Text>

          <TouchableOpacity
            style={styles.operationCard}
            onPress={() => handleSelectMode(0)} // 0 para Híbrido
            accessibilityLabel="Modo Híbrido"
            accessibilityHint="Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos."
          >
            <Text style={styles.cardTitle}>Híbrido</Text>
            <Text style={styles.cardText}>
              Esse modo detecta tanto objetos possivelmente perigosos como
              textos estáticos.
            </Text>
            <View style={styles.radio}>
              <View
                style={
                  selectedMode === 0
                    ? styles.radioSelected
                    : styles.radioInternal
                }
              ></View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.operationCard}
            onPress={() => handleSelectMode(1)} // 1 para Texto
            accessibilityLabel="Modo Texto"
            accessibilityHint="Esse modo detecta somente textos estáticos."
          >
            <Text style={styles.cardTitle}>Texto</Text>
            <Text style={styles.cardText}>
              Esse modo detecta somente textos estáticos.
            </Text>
            <View style={styles.radio}>
              <View
                style={
                  selectedMode === 1
                    ? styles.radioSelected
                    : styles.radioInternal
                }
              ></View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.operationCard}
            onPress={() => handleSelectMode(2)} // 2 para Objetos
            accessibilityLabel="Modo Objetos"
            accessibilityHint="Esse modo detecta somente os objetos possivelmente perigosos."
          >
            <Text style={styles.cardTitle}>Objetos</Text>
            <Text style={styles.cardText}>
              Esse modo detecta somente os objetos possivelmente perigosos.
            </Text>
            <View style={styles.radio}>
              <View
                style={
                  selectedMode === 2
                    ? styles.radioSelected
                    : styles.radioInternal
                }
              ></View>
            </View>
          </TouchableOpacity>
        </View>

        <About visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </ScrollView>
    </SafeAreaView>
  );
};
