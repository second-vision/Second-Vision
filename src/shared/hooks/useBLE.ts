import { Platform, PermissionsAndroid, Alert, Linking } from "react-native";
import * as ExpoDevice from "expo-device";

const checkAndroid31Permissions = async () => {
  const bluetoothScan = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
  );
  const bluetoothConnect = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
  );
  const fineLocation = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  return bluetoothScan && bluetoothConnect && fineLocation;
};

const requestAndroid31Permissions = async () => {
  const allGranted = await checkAndroid31Permissions();
  if (allGranted) return true;

  const bluetoothScan = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
  );
  const bluetoothConnect = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
  );
  const fineLocation = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  return handlePermissionResults([
    bluetoothScan,
    bluetoothConnect,
    fineLocation,
  ]);
};

const checkFineLocationPermission = async () => {
  return await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );
};

const requestFineLocationPermission = async () => {
  const hasPermission = await checkFineLocationPermission();
  if (hasPermission) return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  return handlePermissionResults([granted]);
};

const handlePermissionResults = (results: string[]) => {

  if (results.every((res) => res === PermissionsAndroid.RESULTS.GRANTED)) {
    return true;
  }

  if (
    results.some((res) => res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)
  ) {
    showSettingsAlert();
  } else {
    showPermissionAlert();
  }

  return false;
};

const showPermissionAlert = () => {
  Alert.alert(
    "Permissões Necessárias",
    "Para utilizar o Bluetooth, conceda as permissões.",
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Conceder", onPress: async () => await requestPermissions() },
    ]
  );
};

const showSettingsAlert = () => {
  Alert.alert(
    "Permissões Bloqueadas",
    "Você negou as permissões permanentemente. Vá até as configurações do dispositivo para concedê-las.",
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Abrir Configurações", onPress: openAppSettings },
    ]
  );
};

const openAppSettings = () => {
  Linking.openSettings();
};

export const requestPermissions = async () => {
  if (Platform.OS === "android") {
    if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
      return await requestFineLocationPermission();
    } else {
      return await requestAndroid31Permissions();
    }
  }
  return true;
};
