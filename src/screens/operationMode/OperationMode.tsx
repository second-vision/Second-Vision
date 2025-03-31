import React, { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  TextInput,
  Text,
  Dimensions,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { About, BottomBar, Devices, Header } from "../../shared/components";

import { styles } from "./styles";
import { useHomePropsContext } from "@/src/shared/context";
import { NavigationProp } from "@/app/types/types";

export const OperationMode = () => {
  const navigation = useNavigation<NavigationProp>();

  const { interval, mode, setModeValue } = useHomePropsContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSelectMode = (mode: any) => {
    setModeValue(mode);
    navigation.navigate("HomeStack");
  };

  const sendShutdownCommand = () => {};

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
          device={null}
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
                style={mode === 0 ? styles.radioSelected : styles.radioInternal}
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
                style={mode === 1 ? styles.radioSelected : styles.radioInternal}
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
                style={mode === 2 ? styles.radioSelected : styles.radioInternal}
              ></View>
            </View>
          </TouchableOpacity>
        </View>

        <About visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        
      </ScrollView>
      <BottomBar mode={mode} interval={interval} />
    </SafeAreaView>
  );
};
