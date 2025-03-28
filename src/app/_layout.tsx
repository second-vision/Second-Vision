import { DeviceProvider } from "../shared/context";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <DeviceProvider>
      <Stack>
        <Stack.Screen name="BluetoothOff" />
        <Stack.Screen name="BluetoothOn" />
        <Stack.Screen name="Home" />
      </Stack>
    </DeviceProvider>
  );
}
