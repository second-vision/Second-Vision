import { requestPermissions } from "@/src/shared/hooks";
import { BluetoothOn } from "@/src/screens";

// Request BLE permissions on the first time it opens
requestPermissions();

export default function BluetoothOnStack(){
  // Defina qual tela você deseja renderizar aqui (pode ser baseada em uma condição, por exemplo, se o Bluetooth está ligado ou não)
  return (<BluetoothOn />);
};
