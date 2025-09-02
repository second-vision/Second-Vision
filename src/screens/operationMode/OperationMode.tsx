import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { About, BottomBar, Devices, Header, Loading } from "../../shared/components";
import { MODES, HOSTSPOT_MODES } from "@/src/shared/constants/modes";


import { styles } from "./styles";
import { useHomePropsContext, useMenu } from "@/src/shared/context";
import { NavigationProp } from "@/app/types/types";

export const OperationMode = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isMenuOpen, toggleMenu, closeMenu } = useMenu();
  const { interval, mode, setModeValue, hostspot, setHotspotValue, deviceInfo } =
    useHomePropsContext();

  const handleSelectMode = (mode: any) => {
    setModeValue(mode);
    navigation.navigate("HomeStack");
  };

  const handleSelectHotspot = async (hotspot: any) => {
    setHotspotValue(hotspot);
    navigation.navigate("HomeStack");
  };

  const sendShutdownCommand = () => {};

console.log("device info: ", deviceInfo)
if (!deviceInfo) { // Esta condição agora significa "se deviceInfo for null"
    return (
      <Loading LoadingVisible={true} />
    );
  }
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
  {MODES.map((m) => (
    <TouchableOpacity
      key={m.id}
      style={styles.operationCard}
      onPress={() => handleSelectMode(m.id)}
      accessibilityLabel={`Modo ${m.name}`}
      accessibilityHint={m.description}
    >
      <Text style={styles.cardTitle}>{m.name}</Text>
      <Text style={styles.cardText}>{m.description}</Text>
      <View style={styles.radio}>
        <View style={mode === m.id ? styles.radioSelected : styles.radioInternal} />
      </View>
    </TouchableOpacity>
  ))}
</View>

    <View style={styles.operationMode}>
  <Text style={styles.operationModeTitle}>Modo de Processamento:</Text>
  {(deviceInfo?.model === "RPi-5" ? HOSTSPOT_MODES.RPi5 : HOSTSPOT_MODES.default).map((m) => (
    <TouchableOpacity
      key={m.id}
      style={styles.operationCard}
      onPress={() => handleSelectHotspot(m.id)}
      accessibilityLabel={`Modo ${m.name}`}
      accessibilityHint={m.description}
    >
      <Text style={styles.cardTitle}>{m.name}</Text>
      <Text style={styles.cardText}>{m.description}</Text>
      <View style={styles.radio}>
        <View style={hostspot === m.id ? styles.radioSelected : styles.radioInternal} />
      </View>
    </TouchableOpacity>
  ))}
</View>

        <About visible={isMenuOpen} onClose={closeMenu} />
      </ScrollView>
      <BottomBar mode={mode} hostspot={hostspot} interval={interval} deviceInfo={deviceInfo.model}/>
    </SafeAreaView>
  );
};
