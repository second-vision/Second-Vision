import React from "react";
import { Text, View, Pressable, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { styles } from "./style";

interface IHeaderProps {
  toggleMenu: () => void;
  props: string;
  sendShutdownCommand: () => void;
}

export const Header: React.FC<IHeaderProps> = ({
  toggleMenu,
  props,
  sendShutdownCommand,
}) => {
  const navigation = useNavigation();
  const route = useRoute();

  if (route.name == "BluetoothOn") {
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
          onPress={sendShutdownCommand}
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
