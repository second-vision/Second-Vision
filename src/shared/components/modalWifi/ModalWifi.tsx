import {
  View,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { styles } from "./styles";
import React, { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { Device } from "react-native-ble-plx";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "../appText/AppText";
import { FontSizes } from "@/src/shared/constants/fontSizes";
import { theme } from "../../styles";
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
  onClose,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          accessibilityViewIsModal={true}
        >
          <View style={styles.modalOverlay}>
            <View
              style={styles.modalContent}
              accessible
              accessibilityLabel="Modal de configuração do roteador. Contém campos para SSID e senha, e botões para abrir configurações ou enviar dados."
            >
              <View style={styles.alignCloseButton}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityLabel="Fechar Modal"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={22} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <AppText
                baseSize={FontSizes.Normal}
                style={styles.modalTitle}
                accessibilityRole="header"
                accessibilityLabel="Certifique que o roteador do celular está ligado e digite o nome e a senha do roteador para prosseguir."
              >
                Certifique que o roteador do celular está ligado e digite o nome
                e a senha do roteador para prosseguir.
              </AppText>

              <TextInput
                style={styles.input}
                placeholder="Nome do Roteador (SSID)"
                value={ssid}
                onChangeText={setSsid}
                accessibilityLabel="Campo para digitar o nome do roteador"
                accessible
              />
              <View style={[styles.inputContainer, styles.input]}>
                <TextInput
                  placeholder="Senha do Roteador"
                  key={showPassword ? "visible" : "hidden"}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  accessibilityLabel="Campo para digitar a senha do roteador"
                  accessible
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  accessibilityHint="Toque para alternar a visibilidade da senha"
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={openHotspotSettings}
                  accessibilityLabel="Botão para abrir as configurações do roteador"
                >
                  <AppText baseSize={FontSizes.Normal} style={styles.sendButtonText}>Abrir Roteador</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSubmitCredentials}
                  accessibilityLabel="Botão para enviar nome e senha do roteador"
                >
                  <AppText baseSize={FontSizes.Normal} style={styles.sendButtonText}>Enviar</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};
