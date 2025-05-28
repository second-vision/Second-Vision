import { View, Text, SafeAreaView, Button, Modal } from "react-native";
import { styles } from "./styles";
import React from "react";
import { TextInput } from "react-native-gesture-handler";
import { Device } from "react-native-ble-plx";

interface ModalWifiProps {
  handleSelectHotspot: () => void;
  openHotspotSettings: () => void;
  handleSubmitCredentials: () => void;
  modalVisible: boolean;
  ssid: string;
  setSsid: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  SendWifiSubmit: (
    ssid: string,
    password: string,
    device: Device
  ) => Promise<boolean | undefined>;
  device: Device | null;
}

export const ModalWifi: React.FC<ModalWifiProps> = ({
  handleSelectHotspot,
  openHotspotSettings,
  handleSubmitCredentials,
  modalVisible,
  ssid,
  setSsid,
  password,
  setPassword,
  SendWifiSubmit,
  device,
}) => {
  const handleWifiSubmit = async () => {
    if (device) {
      await SendWifiSubmit(ssid, password, device);
    }
  };
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Button
          title="Ativar Roteador Wi-Fi"
          onPress={handleSelectHotspot}
          accessibilityLabel="Botão para ativar o roteador Wi-Fi"
        />

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent} accessible>
              <Text
                style={styles.modalTitle}
                accessibilityLabel="Mensagem de instrução"
              >
                Certifique que o roteador do celular está ligado e digite o nome e a senha do roteador para prosseguir.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nome do Roteador (SSID)"
                value={ssid}
                onChangeText={setSsid}
                accessibilityLabel="Campo para digitar o nome do roteador"
                accessible
              />
              <TextInput
                style={styles.input}
                placeholder="Senha do Roteador"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                accessibilityLabel="Campo para digitar a senha do roteador"
                accessible
              />

              <View style={styles.buttonRow}>
                <Button
                  title="Abrir Configurações"
                  onPress={openHotspotSettings}
                  accessibilityLabel="Botão para abrir as configurações do roteador"
                />
                <Button
                  title="Enviar"
                  onPress={handleSubmitCredentials}
                  accessibilityLabel="Botão para enviar nome e senha do roteador"
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};
