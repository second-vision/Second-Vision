import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
//import Icon from "react-native-vector-icons/Feather";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@/app/types/types";

interface IBottomBarProps {
  interval: number | null;
  mode: number | null;
  hostspot: number | null;
}

export const BottomBar: React.FC<IBottomBarProps> = ({ interval, mode, hostspot }) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("HomeStack")}
        >
          <Ionicons name="home-outline" color={"#0A398A"} size={30} />
          
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("IntervalTimeStack")}
        >
          <Ionicons name="timer-outline" color={"#0A398A"} size={30} />
        
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("OperationModeStack")}
        >
          <Ionicons name="settings-sharp" color={"#0A398A"} size={30} />
        
        </TouchableOpacity>
      </View>
    </View>
  );
};
