import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { Device } from "react-native-ble-plx";
import { styles } from "./styles";
import { AppText } from "../appText/AppText";
import { FontSizes } from "@/src/shared/constants/fontSizes";
import { theme } from "../../styles";
interface HeaderProps {
  toggleMenu: () => void;
  props: string;
  sendShutdownCommand: (device: Device) => void;
  device: Device | null;
}

export const Header: React.FC<HeaderProps> = ({
  toggleMenu,
  props,
  sendShutdownCommand,
  device,
}) => {
  const route = useRoute();

  const handleShutdownCommand = async () => {
    if (device) {
      await sendShutdownCommand(device);
    }
  };

  if (route.name !== "HomeStack") {
    return (
      <View style={[styles.headerOptions]}>
        <Pressable
          onPress={toggleMenu}
          style={[styles.information]}
          accessibilityLabel="Abrir menu de informações"
          accessibilityRole="button"
        >
          <Ionicons
            name="information-circle-outline"
            size={35}
            color={theme.colors.primary}
            style={[styles.information2]}
          />
        </Pressable>
        <AppText baseSize={FontSizes.Large} style={[styles.textFont]}>{props}</AppText>
        <AppText style={[styles.information]}></AppText>
      </View>
    );
  } else {
    return (
      <View style={[styles.headerOptions]}>
        <Pressable
          onPress={toggleMenu}
          style={[styles.information]}
          accessibilityLabel="Abrir menu de informações"
          accessibilityRole="button"
        >
          <Ionicons
            name="information-circle-outline"
            size={35}
            color={theme.colors.primary}
            style={[styles.information2]}
          />
        </Pressable>
        <AppText baseSize={FontSizes.Large} style={[styles.textFont]}>{props}</AppText>
        <Pressable
          style={[styles.information3]}
          onPress={handleShutdownCommand}
          accessibilityLabel="Desligar Sistema"
          accessibilityRole="button"
        >
          <Ionicons name="power" size={32} color={theme.colors.primary} />
        </Pressable>
      </View>
    );
  }
};
