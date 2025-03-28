import { requestPermissions } from "../hooks/useBLE";
import BluetoothOffScreen from "@/screens/BluetoothOff";


// Request BLE permissions on the first time it opens
requestPermissions();

export default function Index() {
  

  // Defina qual tela você deseja renderizar aqui (pode ser baseada em uma condição, por exemplo, se o Bluetooth está ligado ou não)
  return <BluetoothOffScreen />;
}
