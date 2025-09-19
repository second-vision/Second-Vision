import { Stack } from "expo-router";
import {
  DeviceProvider,
  ModeProvider,
  MenuProvider,
  SettingsProvider,
} from "@/src/shared/context";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <ModeProvider>
        <DeviceProvider>
          <MenuProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </MenuProvider>
        </DeviceProvider>
      </ModeProvider>
    </SettingsProvider>
  );
}
