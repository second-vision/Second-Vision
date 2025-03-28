import { requestPermissions } from "../shared/hooks";
import { BluetoothOff } from "../screens";

// Request BLE permissions on the first time it opens
requestPermissions();

export const index = () => {
  // Defina qual tela você deseja renderizar aqui (pode ser baseada em uma condição, por exemplo, se o Bluetooth está ligado ou não)
  return <BluetoothOff />;
};
