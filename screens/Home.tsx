import React, { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	Alert,
	Platform,
	PermissionsAndroid,
	NativeModules,
	NativeEventEmitter,
	SafeAreaView,
    Text,
	ScrollView,
} from "react-native";
import * as Font from "expo-font";
import { About } from "../components/About";
import { Header } from "../components/Header";
import { Devices } from "../components/Devices";
import { Dashboard } from "../components/Dashboard";
import {
	useNavigation,
	StackActions,
	useRoute,
	RouteProp,
} from "@react-navigation/native";
import * as Speech from "expo-speech";
import { BleManager, Device, BleError, Characteristic, Subscription } from "react-native-ble-plx";
import { Base64 } from "js-base64";
import { RootStackParamList } from '../app/types';


// Importar o tipo do RootStackParamList

import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDeviceContext } from "./DeviceContext";

// Definir o tipo de navegação para o HomeScreen


// Definir o tipo da rota para o HomeScreen


// const loadFonts = async () => {
// 	await Font.loadAsync({
// 		//FonteCustomizada: require("../../assets/fonts/Poppins-SemiBoldItalic.ttf"),
// 	});
// };

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const DATA_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0"; 
const CHARACTERISTIC_UUID_YOLO = "12345678-1234-5678-1234-56789abcdef1";
const CHARACTERISTIC_UUID_PADDLE = "12345678-1234-5678-1234-56789abcdef2";
const CHARACTERISTIC_UUID_BATTERY = "12345678-1234-5678-1234-56789abcdef4";

export default function HomeScreen() {

    const { deviceConnection } = useDeviceContext(); 
	const [isOn, setIsOn] = useState(true);
	const [StatusText, setStatusText] = useState("Desligado");
    
	const [batteryLevel, setBatteryLevel] = useState(0);
	const hasAnnouncedOnce = useRef(false);
	const [estimatedDuration, setEstimatedDuration] = useState(0);
	const [currentModeIndex, setCurrentModeIndex] = useState(0);

	const [yoloResults, setYoloResults] = useState("");
	const [tesseractResults, setTesseractResults] = useState("");
	const specificMacAddress = "D8:3A:DD:D5:49:E8";

    const [dataReceived, setDataReceived] = useState<string>("...waiting.");

	const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const [interval, setInterval] = useState(0);

    const [dataReceivedYOLO, setDataReceivedYOLO] = useState<string | null>(null);
    const [dataReceivedPaddle, setDataReceivedPaddle] = useState<string | null>(null);
    const [dataReceivedBattery, setDataReceivedBattery] = useState<string | null>(null);
	

	const isSpeakingRef = useRef<boolean>(false);



    useEffect(() => {
		if (deviceConnection) {
            startStreamingData(deviceConnection);
          } else {
            console.log('No device connected'); 
          }
	}, []);
    useEffect(() => {
        if (dataReceived !== null) {
          console.log('Data updated:', dataReceived);
        }
      }, [dataReceived]);

	useEffect(() => {
		if (isOn) {
			speak("Sistema ligado e pronto para uso", 0);
		} else if (!isOn) {
			speak(
				"Sistema de identificação parou de funcionar, tente reiniciar o dispositivo físico",
				0
			);
		}
	}, [isOn]);

	useEffect(() => {
		if (currentModeIndex === 0 || currentModeIndex === 2) {
			if (dataReceivedYOLO !== "none") {
				if (dataReceivedYOLO !== "") {
					speak(`Objetos a frente: ${dataReceivedYOLO}`, 1);
				}
			}
		}
	}, [dataReceivedYOLO]);
    
	useEffect(() => {
		if (currentModeIndex === 0 || currentModeIndex === 1) {
			if (dataReceivedPaddle !== "") {
				speak(`Texto identificado: ${dataReceivedPaddle}`, 1);
			}
		}
	}, [dataReceivedPaddle]);

	useEffect(() => {
		if (currentModeIndex === 0) {
			speak(
				`Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos.`,
				0
			);
		} else if (currentModeIndex === 1) {
			speak(`Esse modo detecta apenas textos estáticos.`, 0);
		} else if (currentModeIndex === 2) {
			speak(`Esse modo detecta apenas objetos possivelmente perigosos.`, 0);
		}
	}, [currentModeIndex]);

	useEffect(() => {
        if(dataReceivedBattery){

		if ( parseInt(dataReceivedBattery, 10) === 0) return;
		if (dataReceivedBattery === null) return;
		if ( parseInt(dataReceivedBattery, 10) > 20) {
			// Se a bateria está acima de 20 e não foi notificado antes
			if (!hasAnnouncedOnce.current) {
				speak(
					`Bateria a ${dataReceivedBattery}%. Tempo estimado de uso restante: ${estimatedDuration} horas.`,
					0
				);
				hasAnnouncedOnce.current = true;
			}
		} else {
			speak(
				`Bateria a ${dataReceivedBattery}%. Tempo estimado de uso restante: ${estimatedDuration} horas. A bateria está imprópria para uso.`,
				0
			);
		}}
	}, [dataReceivedBattery]);





	const delay = (ms: number) =>
		new Promise((resolve) => setTimeout(resolve, ms));

	const processSpeakQueue = async (text: string) => {
		await Speech.speak(text, { language: "pt-BR" });
		await delay(interval);
		isSpeakingRef.current = false;
	};

	const speak = async (text: string, numero: number) => {
		if (numero === 1) {
			if (!isSpeakingRef.current) {
				isSpeakingRef.current = true;
				await processSpeakQueue(text);
			} else {
				return;
			}
		} else if (numero === 0) {
			if (isSpeakingRef.current) {
				await Speech.speak(text, { language: "pt-BR" });
			} else {
				isSpeakingRef.current = true;
				await Speech.speak(text, { language: "pt-BR" });
				isSpeakingRef.current = false;
			}
		}
	};

	// Desconectar

	//Receber Dados
    // Decoding the data received from the device and defining the callback
     async function startStreamingData(device: Device) {
       if (device) {
           // Monitorar a característica YOLO
            device.monitorCharacteristicForService(DATA_SERVICE_UUID, CHARACTERISTIC_UUID_YOLO, onDataUpdateYOLO);
            
            // Monitorar a característica PADDLE
            device.monitorCharacteristicForService(DATA_SERVICE_UUID, CHARACTERISTIC_UUID_PADDLE, onDataUpdatePaddle);
            
            // Monitorar a característica BATTERY
            device.monitorCharacteristicForService(DATA_SERVICE_UUID, CHARACTERISTIC_UUID_BATTERY, onDataUpdateBattery);
       } else {
         console.log("No Device Connected");
       }
     }
   
    // Callback para quando a característica YOLO for atualizada
    const onDataUpdateYOLO = (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
        console.error(error);
        return;
        } else if (!characteristic?.value) {
        console.warn("No Data was received for YOLO!");
        return;
        }
    
        const dataInput = Base64.decode(characteristic.value);
        console.log("YOLO Data Received:", dataInput);
    
        // Aqui você pode salvar ou processar os dados de YOLO conforme necessário
        setDataReceivedYOLO(dataInput);
    };
    
    // Callback para quando a característica PADDLE for atualizada
    const onDataUpdatePaddle = (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
        console.error(error);
        return;
        } else if (!characteristic?.value) {
        console.warn("No Data was received for PADDLE!");
        return;
        }
    
        const dataInput = Base64.decode(characteristic.value);
        console.log("PADDLE Data Received:", dataInput);
    
        // Aqui você pode salvar ou processar os dados de PADDLE conforme necessário
        setDataReceivedPaddle(dataInput);
    };
    
    // Callback para quando a característica BATTERY for atualizada
    const onDataUpdateBattery = (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
        console.error(error);
        return;
        } else if (!characteristic?.value) {
        console.warn("No Data was received for BATTERY!");
        return;
        }
    
        const dataInput = Base64.decode(characteristic.value);
        console.log("BATTERY Data Received:", dataInput);
    
        // Aqui você pode salvar ou processar os dados de BATTERY conforme necessário
        setDataReceivedBattery(dataInput);
    };
  

	


	
	// Função para enviar o comando de desligamento
	const sendShutdownCommand = async (device: Device) => {
        speak("Você realmente deseja desligar o dispositivo?", 0);
      
        Alert.alert(
          "Confirmação de Desligamento",
          "Você realmente deseja desligar o dispositivo?",
          [
            {
              text: "Cancelar",
              onPress: () => {
                console.log("Desligamento cancelado");
                speak("Desligamento cancelado", 0);
              },
              style: "cancel",
            },
            {
              text: "Confirmar",
              onPress: async () => {
                try {
                  const serviceUUID = "12345678-1234-5678-1234-56789abcdef0"; // Exemplo de service UUID
                  const characteristicUUID = "12345678-1234-5678-1234-56789abcdef3"; // Exemplo de characteristic UUID
      
                  // Espera a Promise de isConnected resolver
                  const isConnected = await device.isConnected();
      
                  // Verifica se o dispositivo está conectado
                  if (isConnected) {
                    // Enviar comando de desligamento (exemplo usando 0x01)
                    const data = [0x01]; // Comando de desligamento em formato de byte
      
                    // Converte o array de números para uma string no formato hexadecimal
                    const hexString = data.map(byte => String.fromCharCode(byte)).join('');
      
                    // Envia os dados como uma string
                    await device.writeCharacteristicWithResponseForService(
                      serviceUUID,
                      characteristicUUID,
                      hexString
                    );
      
                    console.log("Comando de desligamento enviado com sucesso");
                    speak("Comando de desligamento enviado", 0);
                  } else {
                    console.log("Dispositivo não está conectado");
                    speak("Dispositivo não está conectado", 0);
                  }
                } catch (error) {
                  console.error("Erro ao enviar comando de desligamento", error);
                  speak("Erro ao enviar comando de desligamento", 0);
                }
              },
            },
          ],
          { cancelable: false }
        );
      };

	

	

	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const [fontsLoaded, setFontsLoaded] = useState(false);

	// useEffect(() => {
	// 	loadFonts().then(() => setFontsLoaded(true));
	// }, []);

	// if (!fontsLoaded) {
	// 	return null;
	// }

	const modes = [
		{
			name: "Híbrido",
			description:
				"Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos.",
		},
		{
			name: "Texto",
			description: "Esse modo detecta apenas textos estáticos.",
		},
		{
			name: "Objetos",
			description: "Esse modo detecta apenas objetos possivelmente perigosos.",
		},
	];

	const currentMode = modes[currentModeIndex];

	return (
        <SafeAreaView style={styles.container} accessible>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Header
					toggleMenu={toggleMenu}
					props="Second Vision"
					sendShutdownCommand={sendShutdownCommand}
                    device={deviceConnection}
				/>
				<Devices />
				<Dashboard
					isOn={isOn}
					intervalDash={interval}
					batteryLevel={batteryLevel}
					currentModeIndex={currentModeIndex}
					currentMode={currentMode}
				/>
				<About visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "space-between",
	},
	scrollContent: {
		paddingVertical: 20,
	},
	background: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		height: "100%",
	},
});