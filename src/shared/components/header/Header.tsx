import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { Device } from "react-native-ble-plx";
import { styles } from "./styles";

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

  if (route.name == "BluetoothOnStack") {
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
            color="#001268"
            style={[styles.information2]}
          />
        </Pressable>
        <Text style={[styles.textFont]}>{props}</Text>
        <Text style={[styles.information]}></Text>
      </View>
    );
  } else if (route.name == "Home") {
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
            color="#001268"
            style={[styles.information2]}
          />
        </Pressable>
        <Text style={[styles.textFont]}>{props}</Text>
        <Pressable
          style={[styles.information3]}
          onPress={handleShutdownCommand}
          accessibilityLabel="Desligar Sistema"
          accessibilityRole="button"
        >
          <Ionicons name="power" size={32} color="#001268" />
        </Pressable>
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
            color="#001268"
            style={[styles.information2]}
          />
        </Pressable>
        <Text style={[styles.textFont]}>{props}</Text>
        <Text style={[styles.information]}></Text>
      </View>
    );
  }
};
