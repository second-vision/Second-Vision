import {
  BluetoothOff,
  BluetoothOn,
  ControlBluetooth,
  Home,
  Splash,
  TermsOfUse,
} from "@/src/screens";
import { DeviceProvider } from "@/src/shared/context";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();
export default function RootLayout() {
  return (
    <DeviceProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="SplashStack"
          component={Splash}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TermsOfUseStack"
          component={TermsOfUse}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ControlBluetoothStack"
          component={ControlBluetooth}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BluetoothOffStack"
          component={BluetoothOff}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BluetoothOnStack"
          component={BluetoothOn}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeStack"
          component={Home}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </DeviceProvider>
  );
}
