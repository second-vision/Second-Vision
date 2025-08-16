import { useState, useEffect, useRef } from "react";
import { Alert, Linking, Platform, SafeAreaView, ScrollView } from "react-native";
import { Base64 } from "js-base64";
import { Device, BleError, Characteristic } from "react-native-ble-plx";
import * as Speech from "expo-speech";
import { useNavigation } from "expo-router";
import { Buffer } from "buffer";

import SendIntentAndroid from 'react-native-send-intent';

import {
  About,
  BottomBar,
  Dashboard,
  Devices,
  Header,
  Loading,
  ModalWifi,
} from "@/src/shared/components";
import { useDeviceContext, useHomePropsContext } from "@/src/shared/context";
import { styles } from "./styles";
import { NavigationProp } from "@/app/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DATA_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID_OBJECT = "12345678-1234-5678-1234-56789abcdef1";
const CHARACTERISTIC_UUID_OCR = "12345678-1234-5678-1234-56789abcdef2";
const CHARACTERISTIC_UUID_SHUTDOWN = "12345678-1234-5678-1234-56789abcdef3";
const CHARACTERISTIC_UUID_BATTERY = "12345678-1234-5678-1234-56789abcdef4";
const CHARACTERISTIC_UUID_WIFI_STATUS = "12345678-1234-5678-1234-56789abcdef5"; // Para ler/monitorar
const CHARACTERISTIC_UUID_WIFI_COMMAND = "12345678-1234-5678-1234-56789abcdef6"; // Para escrever
const CHARACTERISTIC_UUID_DEVICE_INFO = "12345678-1234-5678-1234-56789abcdef7";


export const Home = () => {
  //Variaveis uteis
  const [isOn, setIsOn] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const { deviceConnection } = useDeviceContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  //Conexão de internet
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  //Configurações do usuario
  const { mode, interval, hostspot, setHotspotValue } = useHomePropsContext();

  //Recebimento de dados do servidor
  const [dataReceivedOBJECT, setDataReceivedOBJECT] = useState<string | null>(null);
  const [dataReceivedOCR, setDataReceivedOCR] = useState<string | null>(
    null
  );
  const [dataReceivedBattery, setDataReceivedBattery] = useState<string | null>(
    null
  );
  const [dataReceivedBatteryDuration, setDataReceivedBatteryDuration] =
    useState<string | null>(null);
  const { deviceInfo, setDeviceInfo } =
    useHomePropsContext();



  //Variaveis para funcao de fala
  const hasAnnouncedOnce = useRef(false);
  const isSpeakingRef = useRef<boolean>(false);

 //Use effect de renderização e inicialização
useEffect(() => {
  // Crie uma função async interna para conter a lógica completa.
  const initializeAndCheckStatus = async () => {
    // A condição if agora age como uma "guarda". Se o efeito for
    // executado enquanto deviceConnection é null, ele simplesmente para.
    if (!deviceConnection) {
      return;
    }

    try {

     const char = await deviceConnection.readCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_DEVICE_INFO
      );

      // Usa o Buffer para decodificar de Base64 para a string UTF-8
      const infoString = Buffer.from(char.value!, "base64").toString("utf-8");

      // Agora faz o parse do JSON
      const infoObject = JSON.parse(infoString);
        
        console.log("Informações do dispositivo recebidas:", infoObject);
        setDeviceInfo(infoObject); // SALVA AS INFORMAÇÕES NO ESTADO

      // 1. Inicia o streaming de dados (como você queria).
      console.log("Conexão com dispositivo detectada. Iniciando streaming de dados...");
      startStreamingData(deviceConnection);

      // 2. IMEDIATAMENTE APÓS, verifica o status do Wi-Fi.
      //    O 'await' garante que esperamos pela resposta antes de continuar.
      console.log("Verificando status do Wi-Fi...");
      const status = await checkWifiStatus(deviceConnection);

      // 3. Se estiver conectado, atualiza o estado do hotspot.
      if (status.connected) {
        console.log(`Wi-Fi já conectado a '${status.ssid}'. Atualizando a UI.`);
        setHotspotValue(1);
      } else {
        console.log("Dispositivo não está conectado ao Wi-Fi.");
      }
    } catch (error) {
      console.error("Ocorreu um erro durante a inicialização do dispositivo:", error);
    }
  };

  // Chama a função principal de inicialização.
  initializeAndCheckStatus();

// O GATILHO CORRETO:
// Este array diz ao React: "Execute esta lógica sempre que
// o valor de 'deviceConnection' mudar". Isso cobre perfeitamente
// o caso em que ele muda de 'null' para um objeto de dispositivo.
}, [deviceConnection, setHotspotValue]);

  //Use effect para controle de estado do sistema
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
    if (mode === 0) {
      speak(
        `Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos.`,
        0
      );
    } else if (mode === 1) {
      speak(`Esse modo detecta apenas textos estáticos.`, 0);
    } else if (mode === 2) {
      speak(`Esse modo detecta apenas objetos possivelmente perigosos.`, 0);
    }
  }, [mode]);

  //Use effects de recebimento dos dados
  useEffect(() => {
    if (mode === 0 || mode === 2) {
      if (dataReceivedOBJECT !== "none" && dataReceivedOBJECT !== "") {
        speak(`Objetos a frente: ${dataReceivedOBJECT}`, 1);
      }
    }
  }, [dataReceivedOBJECT]);

  useEffect(() => {
    if (mode === 0 || mode === 1) {
      if (dataReceivedOCR !== "") {
        speak(`Texto identificado: ${dataReceivedOCR}`, 1);
      }
    }
  }, [dataReceivedOCR]);

useEffect(() => {
  // 1. Verificação inicial: Sai se a string da bateria for nula, vazia ou um placeholder.
  if (
    !dataReceivedBattery ||
    dataReceivedBattery === "-" ||
    !dataReceivedBatteryDuration ||
    dataReceivedBatteryDuration === "Calculando tempo restante..." ||
    dataReceivedBatteryDuration === "Carregando" // Não falar durante o carregamento
  ) {
    return;
  }

  // 2. Extrai o número da porcentagem para a lógica de comparação.
  //    parseFloat é melhor aqui, pois lida com casas decimais (ex: "85.3%").
  //    O resultado será 85.3 para "85.3%".
  const batteryLevel = parseFloat(dataReceivedBattery);

  // 3. Verifica se a conversão foi bem-sucedida (não é NaN).
  if (isNaN(batteryLevel)) {
    return;
  }

  // 4. Lógica de anúncio baseada no nível numérico.
  if (batteryLevel > 20) {
    console.log("Tempo restante: ", dataReceivedBatteryDuration)
    console.log(deviceInfo?.model!)
    // Anúncio para bateria OK.
    if (!hasAnnouncedOnce.current) {
      // Usa as strings originais e formatadas na função speak.
      speak(
        `Bateria em ${parseInt(dataReceivedBattery)}%. Tempo restante: ${dataReceivedBatteryDuration}.`,
        0
      );
      hasAnnouncedOnce.current = true;
    }
  } else {
    // Anúncio para bateria fraca (sempre fala, pois é um alerta crítico).
    speak(
      `Atenção, bateria fraca em ${parseInt(dataReceivedBattery)}. Tempo restante: ${dataReceivedBatteryDuration}. Por favor, recarregue o dispositivo.`,
      0
    );
  }
  
  // A dependência continua a mesma, pois o efeito deve rodar sempre que o
  // estado da bateria (a string) mudar.
}, [dataReceivedBattery]);

  //Use effect logica de conexao com internet
  useEffect(() => {

  const runWifiCheck = async () => {
 
    if (!deviceConnection) {
      return; 
    }

    setIsConnecting(true)
    console.log("teste")
    const status = await checkWifiStatus(deviceConnection);

    if (hostspot !== 1 && status.connected) {
      await switchToOfflineMode(deviceConnection); 
      console.log("chegou")
      setIsConnecting(false)
      return;
    }
    
    if (hostspot !== 0 && !status.connected) {
      await handleSelectHotspot();
      console.log("chegou1")
      setIsConnecting(false)
      return;
    }
    console.log("chegou2")
      setIsConnecting(false)
    return
  }

    runWifiCheck();
  }, [hostspot]);

  //funcoes para conexao com internet
const handleWifiSubmit = async (
  ssid: string,
  password: string,
  device: Device
): Promise<boolean> => {
  try {
    const isConnected = await device.isConnected();
    if (!isConnected) {
      console.error("Dispositivo não está conectado.");
      return false;
    }

    // --- Passo 1: Enviar o Comando ---
    // A lógica de criar o JSON e o Base64 continua a mesma.
    const wifiData = { ssid, password };
    const jsonString = JSON.stringify(wifiData);
    const base64Data = Buffer.from(jsonString, "utf-8").toString("base64");

    // Agora, a escrita é uma operação simples e rápida.
    // O try/catch principal já lida com qualquer erro de BLE aqui.
    console.log("Enviando comando de configuração Wi-Fi...");
    await device.writeCharacteristicWithResponseForService(
      DATA_SERVICE_UUID,
      CHARACTERISTIC_UUID_WIFI_COMMAND,
      base64Data
    );
    console.log("Comando enviado com sucesso! Aguardando o resultado da conexão...");

    // --- Passo 2: Verificar o Status Periodicamente (Polling) ---
    const MAX_RETRIES = 5; // Tentar por no máximo 10 segundos (5 * 2s)
    const POLL_INTERVAL_MS = 2000; // Verificar a cada 2 segundos

    for (let i = 0; i < MAX_RETRIES; i++) {
      // Aguarda o intervalo antes de verificar
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      console.log(`Verificando status (tentativa ${i + 1}/${MAX_RETRIES})...`);
      
      const result = await device.readCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_WIFI_STATUS
      );

      const decoded = Buffer.from(result.value!, "base64").toString("utf-8");
      console.log("Status atual do Wi-Fi:", decoded);

      // Se a string de sucesso for encontrada, a operação foi um sucesso!
      if (decoded.includes(`Conectado a: ${ssid}`)) {
        console.log("Conexão Wi-Fi estabelecida com sucesso!");
        return true;
      }
    }
    
    // Se o loop terminar sem sucesso, a conexão falhou.
    console.error("Timeout: O dispositivo não conseguiu se conectar ao Wi-Fi a tempo.");
    setHotspotValue(0)
    return false;

  } catch (error) {
    console.error("Erro no processo de configuração do Wi-Fi:", error);
    return false;
  }
};

  const openHotspotSettings = () => {
  // Esta função só faz sentido no Android, então adicionamos uma verificação.
  if (Platform.OS !== 'android') {
    Alert.alert(
      "Função não disponível",
      "Esta opção está disponível apenas em dispositivos Android."
    );
    return;
  }

  try {
    // Usamos a biblioteca para abrir as configurações usando a constante de ação.
    // Isso cria um Intent nativo por baixo dos panos.
    SendIntentAndroid.openSettings("android.settings.TETHER_SETTINGS");
  } catch (error) {
    console.error("Não foi possível abrir as configurações de roteador diretamente:", error);
    // Como fallback, podemos tentar abrir as configurações gerais do Android.
    Alert.alert(
      "Erro",
      "Não foi possível abrir a tela de roteador diretamente. Tentando abrir as configurações gerais.",
      [{
        text: "OK",
        onPress: () => {
          // A função Linking.openSettings() ainda leva para as configs do app.
          // Um fallback melhor é abrir as configurações GERAIS do Android.
          SendIntentAndroid.openSettings("android.settings.SETTINGS");
        }
      }]
    );
  }
};

  const handleSubmitCredentials = async () => {
    if (!ssid || !password) {
      Alert.alert(
        "Campos obrigatórios",
        "Por favor, preencha o SSID e a senha."
      );
      return;
    }

    await AsyncStorage.setItem("hotspot_ssid", ssid);
    await AsyncStorage.setItem("hotspot_password", password);
    setModalVisible(false);

    if (!deviceConnection) {
      Alert.alert("Erro", "Dispositivo não conectado.");
      return;
    }
    setIsConnecting(true);
    console.log("teste1")
    const connected = await handleWifiSubmit(ssid, password, deviceConnection);
setIsConnecting(false);
    if (!connected) {
  Alert.alert(
    "Falha na conexão", // Título
    "Não foi possível conectar. Verifique se o roteador está ligado e se as credenciais estão corretas.", // Mensagem
    [ // Array de botões
      {
        text: "OK", // O texto que aparece no botão
        onPress: () => {
          // Este código só será executado DEPOIS que o usuário tocar em "OK".
          console.log("Alerta fechado pelo usuário.");
          setModalVisible(true);
        }
      }
    ],
    { cancelable: false } // Opcional: impede que o usuário feche o alerta tocando fora dele (Android)
  );
}
  };

  const handleSelectHotspot = async () => {
    const savedSsid = await AsyncStorage.getItem("hotspot_ssid");
    const savedPassword = await AsyncStorage.getItem("hotspot_password");

    if (!deviceConnection) {
      Alert.alert("Erro", "Dispositivo não conectado.");
      return;
    }

    if (savedSsid && savedPassword) {
 
      setIsConnecting(true);
console.log("teste2")
      const connected = await handleWifiSubmit(
        savedSsid,
        savedPassword,
        deviceConnection
      );

      setIsConnecting(false);
      if (!connected) {
        
        Alert.alert(
          "Erro na conexão",
          "Não foi possível conectar com as credenciais salvas. Verifique o nome e a senha e tente novamente.",
          [ // Array de botões
      {
        text: "OK", // O texto que aparece no botão
        onPress: () => {
          // Este código só será executado DEPOIS que o usuário tocar em "OK".
          console.log("Alerta fechado pelo usuário.");
          setModalVisible(true);
        }
      }
    ],
    { cancelable: false } // Opcional: impede que o usuário feche o alerta tocando fora dele (Android)
        );
      }
    } else {
      setModalVisible(true);
    }
  };

const checkWifiStatus = async (
  device: Device
): Promise<{ connected: boolean; ssid: string | null }> => {
  try {
    // Garante que ainda estamos conectados via BLE antes de tentar a leitura
    const isBleConnected = await device.isConnected();
    if (!isBleConnected) {
      console.log("Verificação de status cancelada: dispositivo BLE desconectado.");
      return { connected: false, ssid: null };
    }

    console.log("Verificando status atual do Wi-Fi no dispositivo...");

          // Lê o valor da característica
          const result = await device.readCharacteristicForService(
            DATA_SERVICE_UUID,
            CHARACTERISTIC_UUID_WIFI_STATUS
          );

          // Decodifica a resposta
          const decoded = Buffer.from(result.value!, "base64").toString("utf-8");
          console.log("Resposta do dispositivo:", decoded);

          // Interpreta a resposta do servidor Python
          // Ex: "Conectado a: MinhaRede" ou "Conectado a: Nenhum"
          if (decoded.includes("Conectado a:") && !decoded.includes("Nenhum")) {
            // Extrai o nome do SSID da string para exibir na UI
            const ssid = decoded.split("Conectado a: ")[1]?.trim();
            console.log(`Dispositivo já está conectado ao Wi-Fi: ${ssid}`);
            return { connected: true, ssid: ssid || "desconhecido" };
          } else {
            console.log("Dispositivo não está conectado a nenhuma rede Wi-Fi.");
            return { connected: false, ssid: null };}

       
  } catch (error) {
    console.error("Erro ao verificar o status do Wi-Fi:", error);
    // Retorna 'false' em caso de qualquer erro de comunicação
    return { connected: false, ssid: null };
  }
};

  //Funcoes da Fala
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const processSpeakQueue = async (text: string) => {
    await Speech.speak(text, { language: "pt-BR" });
    await delay(interval * 1000);
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

  //Funcoes de recebimento dos dados
  const startStreamingData = (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_OBJECT,
        onDataUpdateOBJECT
      );

      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_OCR,
        onDataUpdateOCR
      );

      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID_BATTERY,
        onDataUpdateBattery
      );

      device.monitorCharacteristicForService(
      DATA_SERVICE_UUID,
      CHARACTERISTIC_UUID_WIFI_STATUS, // A UUID correta para o Wi-Fi
      onDataUpdateWifi // A nova função de callback que vamos criar
      );
    } else {
    }
  };

  const onDataUpdateOBJECT = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.error(error);
      return;
    } else if (!characteristic?.value) {
      console.warn("No Data was received for YOLO!");
      return;
    }

    const dataInput = Base64.decode(characteristic.value);

    setDataReceivedOBJECT(dataInput);
  };

  const onDataUpdateOCR = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.error(error);
      return;
    } else if (!characteristic?.value) {
      console.warn("No Data was received for PADDLE!");
      return;
    }

    const dataInput = Base64.decode(characteristic.value);
    setDataReceivedOCR(dataInput);
  };

const onDataUpdateBattery = (
  error: BleError | null,
  characteristic: Characteristic | null
) => {
  if (error) {
    console.error("Erro no monitor de bateria:", error);
    // Limpa os estados em caso de erro
    setDataReceivedBattery("-");
    setDataReceivedBatteryDuration("Erro de conexão");
    return;
  } else if (!characteristic?.value) {
    console.warn("Nenhum dado recebido na notificação de Bateria!");
    return;
  }

  // 1. Decodifica a string completa
  const dataInput = Base64.decode(characteristic.value);
  // Exemplo de dataInput: "85.3%, 2 horas e 15 minutos" ou "Carregando"

  // 2. Separa a string pela vírgula
  const parts = dataInput.split(",");

  let batteryString = "-";
  let durationString = "Calculando...";

  // 3. Atribui os valores com base no número de partes
  if (parts.length > 1) {
    // Caso 1: Temos porcentagem E duração (ex: "85.3%, 2 horas")
    
    // A primeira parte é a porcentagem, com o símbolo %.
    // .trim() remove espaços em branco caso o servidor envie "85.3% , ..."
    batteryString = parts[0].trim(); 
    
    // A segunda parte é a string de duração.
    durationString = parts[1].trim();

  } else if (parts.length === 1 && parts[0].trim() !== "") {
    // Caso 2: Temos apenas uma string de status (ex: "Carregando", "Carga completa")
    // Verificamos se não é uma string vazia.
    
    // Nesse caso, a string de status principal é a duração/status.
    durationString = parts[0].trim();
    // A porcentagem pode ficar como um traço ou um ícone.
    batteryString = "-";
    
    // Bônus: se a string for "Carregando", você pode querer mostrar o ícone de carregamento
    // na UI, mas a lógica de armazenamento permanece a mesma.
  }

  // 4. Atualiza os estados com as strings exatas
  setDataReceivedBatteryDuration(durationString);
  setDataReceivedBattery(batteryString);
  
};

  const onDataUpdateWifi = (
  error: BleError | null,
  characteristic: Characteristic | null
) => {
  if (error) {
    // Um erro comum aqui é 'notifications are not enabled' se a flag
    // 'notify' não estiver na característica do servidor.
    console.error("Erro no monitor de Wi-Fi:", error);
    // Em caso de erro, é seguro assumir que estamos offline.
    setHotspotValue(0); 
    //setWifiSsid(null);
    return;
  } else if (!characteristic?.value) {
    console.warn("Nenhum dado recebido na notificação de Wi-Fi!");
    return;
  }

  // Decodifica a string enviada pelo servidor
  const dataInput = Base64.decode(characteristic.value);
  console.log("Notificação de status de Wi-Fi recebida:", dataInput); // Ex: "Conectado a: MyNetwork" ou "Conectado a: Nenhum"

  // Interpreta a string para definir se está online ou offline
  if (dataInput.includes('Conectado a:') && !dataInput.includes('Nenhum')) {
    // O dispositivo está conectado a uma rede!
    setHotspotValue(1);
    
    // Opcional, mas útil: extrair o nome da rede para exibir na UI
    //const ssidName = dataInput.split(': ')[1]?.trim();
    //setWifiSsid(ssidName);

  } else {
    // O dispositivo está offline (recebeu "Nenhum" ou uma string de erro)
    setHotspotValue(0);
    //setWifiSsid(null);
  }
};


// Função no seu app para mudar para o modo offline
const switchToOfflineMode = async (device: Device) => {
  try {
    // 1. Cria o objeto de comando
    const commandData = {
      command: "offline",
    };

    // 2. Converte para string JSON e Base64
    const jsonString = JSON.stringify(commandData);
    const base64Data = Buffer.from(jsonString, "utf-8").toString("base64");

    // 3. Escreve na mesma característica de Wi-Fi
    await device.writeCharacteristicWithResponseForService(
      DATA_SERVICE_UUID,
      CHARACTERISTIC_UUID_WIFI_COMMAND,
      base64Data
    );

    console.log("Comando 'offline' enviado com sucesso!");
    // O servidor irá desconectar e, graças à Dinâmica 1,
    // ele enviará uma notificação de status "Conectado a: Nenhum",
    // que seu app receberá, confirmando a mudança.
    
  } catch (error) {
    console.error("Erro ao tentar mudar para o modo offline:", error);
    alert("Não foi possível solicitar o modo offline.");
  }
};


  //funcao de desligar
  const sendShutdownCommand = async (device: Device) => {
    Alert.alert(
      "Confirmação de Desligamento",
      "Você realmente deseja desligar o dispositivo?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const isConnected = await device.isConnected();

              if (isConnected) {
                const data = [0x01];
                const hexString = data
                  .map((byte) => String.fromCharCode(byte))
                  .join("");

                const writeWithTimeout = (device: Device) => {
                  return new Promise(async (resolve, reject) => {
                    try {
                      device.writeCharacteristicWithResponseForService(
                        DATA_SERVICE_UUID,
                        CHARACTERISTIC_UUID_SHUTDOWN,
                        hexString
                      );
                      resolve("Comando enviado com sucesso");
                    } catch (error) {
                      reject(error);
                    }
                  });
                };

                const timeout = new Promise((_, reject) =>
                  setTimeout(() => reject("Timeout"), 5000)
                );

                await Promise.race([writeWithTimeout(device), timeout]);

                Speech.stop();
                navigation.replace("ControlBluetoothStack");
              }
            } catch (error) {
              console.error("Erro ao enviar comando:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  //Menu hamburguer
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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



// 2. Use o 'if/else' para ATRIBUIR o valor à variável já existente.
 const hostspotMode = deviceInfo?.model === "RPi-5"
    ? [ // Valor se a condição for verdadeira
        {
          name: "Offline",
          description: "Esse modo funciona sem conexão com a internet.",
        },
        {
          name: "Online",
          description: "Esse modo apenas funciona com conexão à internet.",
        },
      ]
    : [ // Valor se a condição for falsa
        {
          name: "Offline",
          description: "Ative a internet para o sistema operar.",
        },
        {
          name: "Online",
          description: "Sistema conectado e funcionando.",
        },
      ];

  const currentMode = modes[mode];

  const currentHostspot = hostspotMode[hostspot];

  const batteryNumber = parseInt(dataReceivedBattery!);

  const batteryLevelForDashboard = isNaN(batteryNumber) ? 0 : batteryNumber;

  return (
    <SafeAreaView style={styles.container} accessible>
      <ScrollView contentContainerStyle={styles.scrollContent}>
    
         <Loading
            LoadingVisible={isConnecting}
         />
       
        <Header
          toggleMenu={toggleMenu}
          props="Second Vision"
          sendShutdownCommand={sendShutdownCommand}
          device={deviceConnection}
        />
        <Devices />
        <Dashboard
          isOn={isOn}
          intervalDash={interval * 1000}
          batteryLevel={batteryLevelForDashboard}
          currentModeIndex={mode}
          currentMode={currentMode}
          currentHostspot={currentHostspot}
        />
        <ModalWifi
          handleSelectHotspot={handleSelectHotspot}
          openHotspotSettings={openHotspotSettings}
          handleSubmitCredentials={handleSubmitCredentials}
          modalVisible={modalVisible}
          ssid={ssid}
          setSsid={setSsid}
          password={password}
          setPassword={setPassword}
          SendWifiSubmit={handleWifiSubmit}
          device={deviceConnection}
          onClose={() => {setModalVisible(false); setHotspotValue(0)}}
        />
        <About visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </ScrollView>
      <BottomBar mode={mode} hostspot={hostspot} interval={interval} deviceInfo={deviceInfo?.model!} />
    </SafeAreaView>
  );
};
