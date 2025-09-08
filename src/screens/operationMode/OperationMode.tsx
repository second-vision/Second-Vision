import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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
import { NavigationProp } from "@/app/types/types";

export const OperationMode = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isMenuOpen, toggleMenu, closeMenu } = useMenu();
  const {
    interval,
    mode,
    setModeValue,
    hostspot,
    hostspotUI,
    setHotspotValue,
    deviceInfo,
  } = useHomePropsContext();

  const handleSelectMode = (mode: any) => {
    setModeValue(mode);
    navigation.navigate("HomeStack");
  };

  const handleSelectHotspot = async (hotspot: any) => {
    if (hotspot == hostspotUI) return;
    console.log(hotspot)
    console.log(hostspot)
    setHotspotValue(hotspot);
    navigation.navigate("HomeStack");
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
          <AppText baseSize={FontSizes.Large} style={styles.operationModeTitle} accessibilityRole="header">
            Modos de Operação
          </AppText>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.operationCard}
              onPress={() => handleSelectMode(m.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: mode === m.id }}
              accessibilityLabel={m.name}
              accessibilityHint={m.description}
            >
              <AppText baseSize={FontSizes.Normal} style={styles.cardTitle}>{m.name}</AppText>
              <AppText baseSize={FontSizes.ExtraSmall} style={styles.cardText}>{m.description}</AppText>
              <View style={styles.radio}>
                <View
                  style={
                    mode === m.id ? styles.radioSelected : styles.radioInternal
                  }
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        
          {deviceInfo?.model === "RPi-5" && (
            <View style={styles.operationMode}>
              <AppText
                style={styles.operationModeTitle}
                accessibilityRole="header"
                baseSize={FontSizes.Large} 
              >
                Modo de Processamento
              </AppText>
              {HOSTSPOT_MODES.RPi5.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.operationCard}
                  onPress={() => handleSelectHotspot(m.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: hostspotUI === m.id }}
                  accessibilityLabel={m.name}
                  accessibilityHint={m.description}
                >
                  <AppText baseSize={FontSizes.Normal}  style={styles.cardTitle}>{m.name}</AppText>
                  <AppText baseSize={FontSizes.Small}  style={styles.cardText}>{m.description}</AppText>
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
            </View>
          )}

        <About visible={isMenuOpen} onClose={closeMenu} />
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
