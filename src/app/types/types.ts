// types.ts
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  BluetoothOffStack: undefined;
  BluetoothOnStack: undefined;
  HomeStack: undefined;
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;
