import * as React from "react";
import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Home,
  BluetoothOff,
  ControlBluetooth,
  BluetoothOn,
  Interval,
  Splash,
  OperationMode,
  TermsOfUse,
} from "./src/screens";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "./src/navigation/RootStackParamList";
import { TabParamList } from "./src/navigation/TabParamList";

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab Navigator para telas com o footer
function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Intervalo"
        component={Interval}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Modo de Operação"
        component={OperationMode}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator para telas sem o footer
function NonTabStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ControlScreen"
        component={ControlBluetooth}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BluetoothOff"
        component={BluetoothOff}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BluetoothOn"
        component={BluetoothOn}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsOfUse}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator principal
function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="ControlScreen">
      <Stack.Screen
        name="ControlScreen"
        component={NonTabStackNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Componente principal
export const App = () => {
  const [splashComplete, setSplashComplete] = useState(false);

  return splashComplete ? (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  ) : (
    <Splash onComplete={setSplashComplete} />
  );
};
