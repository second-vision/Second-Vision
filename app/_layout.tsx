import {
  BluetoothOff,
  BluetoothOn,
  ControlBluetooth,
  Home,
  IntervalTime,
  OperationMode,
  Splash,
  TermsOfUse,
  Settings,
} from "@/src/screens";
import {
  DeviceProvider,
  ModeProvider,
  MenuProvider,
  SettingsProvider,
} from "@/src/shared/context";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function RootLayout() {
  return (
    <SettingsProvider>
      <ModeProvider>
        <DeviceProvider>
          <MenuProvider>
            <Stack.Navigator initialRouteName="SplashStack">
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
              <Stack.Screen
                name="IntervalTimeStack"
                component={IntervalTime}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="OperationModeStack"
                component={OperationMode}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SettingsStack"
                component={Settings}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </MenuProvider>
        </DeviceProvider>
      </ModeProvider>
    </SettingsProvider>
  );
}
