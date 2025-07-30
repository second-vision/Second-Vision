import { View, Text, SafeAreaView, Button, Modal, TouchableOpacity } from "react-native";
import { styles } from "./styles";
import React from "react";
import { TextInput } from "react-native-gesture-handler";
import { Device } from "react-native-ble-plx";
import { Ionicons } from "@expo/vector-icons";

interface ModalWifiProps {
  onClose: () => void;
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
  openHotspotSettings,
  handleSubmitCredentials,
  modalVisible,
  ssid,
  setSsid,
  password,
  setPassword,
  onClose
}) => {

  return (
    <SafeAreaView>
      <View style={styles.container}>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent} accessible>
              <View  style={styles.alignCloseButton}>
              <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityLabel="Fechar Modal" 
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={22} color="#333" />
                </TouchableOpacity>
                </View>
              <Text
                style={styles.modalTitle}
                accessibilityLabel="Certifique que o roteador do celular está ligado e digite o nome e a senha do roteador para prosseguir."
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
                <TouchableOpacity
                style={styles.sendButton}
                  onPress={openHotspotSettings}
                  accessibilityLabel="Botão para abrir as configurações do roteador"
                >
                  <Text
                style={styles.sendButtonText}
                accessibilityLabel=" Abrir Roteador"
              >
               Abrir Roteador.
              </Text>
                </TouchableOpacity>
                <TouchableOpacity
style={styles.sendButton}
                  onPress={handleSubmitCredentials}
                  accessibilityLabel="Botão para enviar nome e senha do roteador"
                >
                  <Text
                style={styles.sendButtonText}
                accessibilityLabel="Enviar"
              >
                Enviar.
              </Text>
                  </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};
