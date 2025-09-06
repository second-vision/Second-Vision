// types.ts
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  SplashStack: undefined;
  TermsOfUseStack: undefined;
  ControlBluetoothStack: undefined;
  BluetoothOffStack: undefined;
  BluetoothOnStack: undefined;
  HomeStack: undefined;
  IntervalTimeStack: undefined;
  OperationModeStack: undefined;
  SettingsStack: undefined;
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;
