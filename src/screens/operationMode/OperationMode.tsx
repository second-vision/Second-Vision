import { SafeAreaView, View, ScrollView, TouchableOpacity } from "react-native";
import {
  About,
  AppText,
  BottomBar,
  Devices,
  Header,
  Loading,
} from "../../shared/components";
import { MODES, HOSTSPOT_MODES } from "@/src/shared/constants/modes";
import { FontSizes } from "@/src/shared/constants/fontSizes";
import { styles } from "./styles";
import { useHomePropsContext, useMenu } from "@/src/shared/context";

import { useEffect } from "react";
import { useRouter } from "expo-router";

export const OperationMode = () => {
  const router = useRouter();
  const { isMenuOpen, toggleMenu } = useMenu();
  const {
    interval,
    mode,
    setModeValue,
    hostspot,
    hostspotUI,
    setHotspotValue,
    deviceInfo,
  } = useHomePropsContext();

  useEffect(() => {
    if (deviceInfo?.model === "RPi-0" && hostspotUI === 0) {
      setModeValue(2);
    }
  }, [deviceInfo?.model, hostspotUI]);

  const handleSelectMode = (mode: any) => {
    setModeValue(mode);
    router.navigate("/home-stack");
  };

  const handleSelectHotspot = async (hotspot: any) => {
    if (hotspot == hostspotUI) return;
    setHotspotValue(hotspot);
    router.navigate("/home-stack");
  };

  const sendShutdownCommand = () => {};

  if (!deviceInfo) {
    return (
      <Loading
        LoadingVisible={true}
        accessibilityLabel="Carregando"
        accessibilityRole="progressbar"
      />
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
          <AppText
            baseSize={FontSizes.Large}
            style={styles.operationModeTitle}
            accessibilityRole="header"
          >
            Modos de Operação
          </AppText>

          {(deviceInfo?.model === "RPi-0" && hostspotUI === 0
            ? MODES.filter((m) => m.id === 2) // mostra só o Objetos
            : MODES
          ).map((m) => {
            return (
              <TouchableOpacity
                key={m.id}
                style={styles.operationCard}
                onPress={() =>
                  deviceInfo?.model === "RPi-0" && hostspotUI === 0
                    ? null // não deixa clicar
                    : handleSelectMode(m.id)
                }
                disabled={deviceInfo?.model === "RPi-0" && hostspotUI === 0} // desabilita toque
                accessibilityRole="radio"
                accessibilityState={{ selected: mode === m.id }}
                accessibilityLabel={m.name}
                accessibilityHint={m.description}
              >
                <AppText baseSize={FontSizes.Normal} style={styles.cardTitle}>
                  {m.name}
                </AppText>
                <AppText
                  baseSize={FontSizes.ExtraSmall}
                  style={styles.cardText}
                >
                  {m.description}
                </AppText>
                <View style={styles.radio}>
                  <View
                    style={
                      mode === m.id
                        ? styles.radioSelected
                        : styles.radioInternal
                    }
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.operationMode}>
          <AppText
            style={styles.operationModeTitle}
            accessibilityRole="header"
            baseSize={FontSizes.Large}
          >
            Modo de Processamento
          </AppText>

          {(deviceInfo?.model === "RPi-5" || deviceInfo?.model === "RPi-0") && (
            <>
              {(deviceInfo?.model === "RPi-5"
                ? HOSTSPOT_MODES.RPi5
                : HOSTSPOT_MODES.RPi0
              ).map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.operationCard}
                  onPress={() => handleSelectHotspot(m.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: hostspotUI === m.id }}
                  accessibilityLabel={m.name}
                  accessibilityHint={m.description}
                >
                  <AppText baseSize={FontSizes.Normal} style={styles.cardTitle}>
                    {m.name}
                  </AppText>
                  <AppText baseSize={FontSizes.Small} style={styles.cardText}>
                    {m.description}
                  </AppText>
                  <View style={styles.radio}>
                    <View
                      style={
                        hostspotUI === m.id
                          ? styles.radioSelected
                          : styles.radioInternal
                      }
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        <About visible={isMenuOpen} onClose={toggleMenu} />
      </ScrollView>

      <BottomBar
        mode={mode}
        hostspot={hostspot}
        interval={interval}
        deviceInfo={deviceInfo.model}
      />
    </SafeAreaView>
  );
};
