import { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import {
  About,
  BottomBar,
  Dashboard,
  Devices,
  Header,
  Loading,
  ModalWifi,
} from "@/src/shared/components";
import { useDeviceContext, useHomePropsContext } from "@/src/shared/context";
import { styles } from "./styles";

import { useWifiManager } from "@/src/shared/hooks/useWifiManager";
import { useDeviceConnection } from "@/src/shared/hooks/useDeviceConnection";
import { useAnnouncements } from "@/src/shared/hooks/useAnnouncements";

import { useMenu } from "@/src/shared/context/MenuContext";
import { MODES, HOSTSPOT_MODES } from "@/src/shared/constants/modes";
import { Device } from "react-native-ble-plx";

export const Home = () => {
  //Variaveis uteis
  const { deviceConnection } = useDeviceContext();
  const { isMenuOpen, toggleMenu } = useMenu();
  const [isScanningM] = useState(true);
  const [allDevices] = useState<Device[]>([]);

  //Configurações do usuario
  const {
    mode,
    interval,
    hostspot,
    hostspotUI,
    setHotspotValue,
    setHotspotValueUI,
  } = useHomePropsContext();

  //Conexão de internet
  const {
    ssid,
    setSsid,
    password,
    setPassword,
    modalVisible,
    setModalVisible,
    isConnecting,
    handleSubmitCredentials,
    handleSelectHotspot,
    openHotspotSettings,
    handleWifiSubmit,
    checkWifiStatus,
  } = useWifiManager(deviceConnection, hostspot, hostspotUI, setHotspotValue);

  //Funcoes de recebimento dos dados
  const {
    isOn,
    deviceInfo,
    objectData,
    ocrData,
    battery,
    batteryDuration,
    sendShutdownCommand,
  } = useDeviceConnection(deviceConnection, setHotspotValueUI, checkWifiStatus);

  //Estados para falas
  useAnnouncements({
    isOn,
    mode,
    objectData,
    ocrData,
    battery,
    batteryDuration,
    interval,
    isScanningM,
    allDevices,
    hostspotUI,
    deviceInfo,
  });

  // Variaveis para UI
  const currentMode = MODES[mode];

  const hostspotModes =
    deviceInfo?.model === "RPi-5" ? HOSTSPOT_MODES.RPi5 : HOSTSPOT_MODES.RPi0;

  const currentHostspot = hostspotModes[hostspotUI];

  const batteryNumber = parseInt(battery!);

  const batteryLevelForDashboard = isNaN(batteryNumber) ? 0 : batteryNumber;

  return (
    <View style={{ height: "100%" }}>
      <View style={styles.container} accessible>
        <View style={styles.scrollContent}>
          <Loading
            LoadingVisible={isConnecting}
            accessibilityLabel="Carregando"
            accessibilityRole="progressbar"
          />
          <Header
            toggleMenu={toggleMenu}
            props="Second Vision"
            sendShutdownCommand={sendShutdownCommand}
            device={deviceConnection}
          />
          <Devices />
          <Dashboard
            isOn={isOn}
            intervalDash={interval * 1000}
            batteryLevel={batteryLevelForDashboard}
            currentModeIndex={mode}
            currentMode={currentMode}
            currentHostspot={currentHostspot}
          />
          <ModalWifi
            handleSelectHotspot={handleSelectHotspot}
            openHotspotSettings={openHotspotSettings}
            handleSubmitCredentials={handleSubmitCredentials}
            modalVisible={modalVisible}
            ssid={ssid}
            setSsid={setSsid}
            password={password}
            setPassword={setPassword}
            SendWifiSubmit={handleWifiSubmit}
            device={deviceConnection}
            onClose={() => {
              setModalVisible(false);
              setHotspotValue(2);
            }}
          />
          <About visible={isMenuOpen} onClose={toggleMenu} />
        </View>
      </View>
      <BottomBar
        mode={mode}
        hostspot={hostspot}
        interval={interval}
        deviceInfo={deviceInfo?.model!}
      />
    </View>
  );
};
