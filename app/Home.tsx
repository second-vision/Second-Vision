import HomeScreen from "@/screens/Home";
import { requestPermissions } from "../hooks/useBLE";

// Request BLE permissions on the first time it opens


export default function Home() {
  // Defina qual tela você deseja renderizar aqui (pode ser baseada em uma condição, por exemplo, se o Bluetooth está ligado ou não)
  return <HomeScreen />;
}
