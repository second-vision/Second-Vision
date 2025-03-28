import { DeviceProvider } from "@/screens/DeviceContext";
import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <DeviceProvider>
    <Stack>
      <Stack.Screen

        name="index"
      />
      <Stack.Screen

      name="BluetoothOn"
      />
      <Stack.Screen

      name="Home"
      />
    </Stack>
    </DeviceProvider>
    
   
  );
}
