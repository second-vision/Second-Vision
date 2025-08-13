import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { About, BottomBar, Devices, Header } from "../../shared/components";

import { styles } from "./styles";
import { useHomePropsContext } from "@/src/shared/context";
import { NavigationProp } from "@/app/types/types";

export const OperationMode = () => {
  const navigation = useNavigation<NavigationProp>();

  const { interval, mode, setModeValue, hostspot, setHotspotValue, deviceInfo } =
    useHomePropsContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSelectMode = (mode: any) => {
    setModeValue(mode);
    navigation.navigate("HomeStack");
  };

  const handleSelectHotspot = async (hotspot: any) => {
    setHotspotValue(hotspot);
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
            onPress={() => handleSelectMode(0)}
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
            onPress={() => handleSelectMode(1)}
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
            onPress={() => handleSelectMode(2)}
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

         <View style={styles.operationMode}>
    <Text style={styles.operationModeTitle}>Modo de Operação:</Text>

    {/* Condição principal: verifica se é o modelo avançado */}
    {deviceInfo === "RPi-5" ? (
      // --- CAMINHO 1: Dispositivo é V5 (versão avançada) ---
      // Renderiza as duas opções, Offline e Online.
      <>
        <TouchableOpacity
          style={styles.operationCard}
          onPress={() => handleSelectHotspot(0)} // Seleciona modo Offline
          accessibilityLabel="Modo Offline"
          accessibilityHint="Esse modo funciona sem conexão com a internet."
        >
          <Text style={styles.cardTitle}>Offline</Text>
          <Text style={styles.cardText}>
            Usa o processamento local do dispositivo, sem precisar de internet.
          </Text>
          <View style={styles.radio}>
            <View
              style={
                hostspot === 0 ? styles.radioSelected : styles.radioInternal
              }
            ></View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.operationCard}
          onPress={() => handleSelectHotspot(1)} // Seleciona modo Online
          accessibilityLabel="Modo Online"
          accessibilityHint="Esse modo apenas funciona com conexão à internet."
        >
          <Text style={styles.cardTitle}>Online</Text>
          <Text style={styles.cardText}>
            Usa a internet para processamento avançado na nuvem.
          </Text>
          <View style={styles.radio}>
            <View
              style={
                hostspot === 1 ? styles.radioSelected : styles.radioInternal
              }
            ></View>
          </View>
        </TouchableOpacity>
      </>
    ) : (
      // --- CAMINHO 2: Dispositivo é V0 (versão básica) ou desconhecido ---
      // Renderiza apenas uma opção para conectar.
      <TouchableOpacity
        style={styles.operationCard}
        onPress={() => handleSelectHotspot(1)} // Sempre tentará ativar o modo Online
        accessibilityLabel="Conectar à Internet"
        accessibilityHint="Este dispositivo necessita de internet para funcionar. Clique para configurar."
      >
        <Text style={styles.cardTitle}>Conectar à Internet</Text>
        <Text style={styles.cardText}>
          Esta versão do dispositivo necessita de uma conexão de internet para funcionar.
        </Text>
        {/* Podemos mostrar o rádio 'selecionado' se a internet já estiver ativa */}
        <View style={styles.radio}>
          <View
            style={
              hostspot === 1 ? styles.radioSelected : styles.radioInternal
            }
          ></View>
        </View>
      </TouchableOpacity>
    )}
  </View>

        <About visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </ScrollView>
      <BottomBar mode={mode} hostspot={hostspot} interval={interval} deviceInfo={deviceInfo}/>
    </SafeAreaView>
  );
};
