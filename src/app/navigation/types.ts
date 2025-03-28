// types.ts
import { StackNavigationProp } from '@react-navigation/stack';


export type RootStackParamList = {
  index: undefined;
  BluetoothOff: undefined;
  BluetoothOn: undefined;
  Home: undefined ;
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;