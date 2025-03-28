import { DeviceProvider } from "../shared/context";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <DeviceProvider>
      <Stack>
        <Stack.Screen name="BluetoothOffStack" />
        <Stack.Screen name="BluetoothOnStack" />
        <Stack.Screen name="HomeStack" />
      </Stack>
    </DeviceProvider>
  );
}
