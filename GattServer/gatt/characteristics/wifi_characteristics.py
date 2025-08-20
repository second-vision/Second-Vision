# gatt/characteristics/wifi_characteristics.py
import dbus
import threading
import json
import subprocess
from gatt.characteristic import Characteristic
from bluez import exceptions
from config import GATT_CHRC_IFACE
from services.internet_service import get_wifi_connection_status


class WifiStatusCharacteristic(Characteristic):
    WIFI_STATUS_UUID = '12345678-1234-5678-1234-56789abcdef5' 

    def __init__(self, bus, index, service):
        Characteristic.__init__(
            self, bus, index,
            self.WIFI_STATUS_UUID,
            ['read', 'notify'],
            service)
        self.last_known_status_str = "Inicializando..."
    
    def update_and_notify_status(self):
        """
        Verifica o status da internet e, se mudou, envia uma notificação.
        """
        is_connected, active_ssid = get_wifi_connection_status()
        
        current_status_str = f"Conectado a: {active_ssid}" if is_connected else "Conectado a: Nenhum"
        
        if current_status_str != self.last_known_status_str:
            #print(f"[WIFI Notify] Status mudou para: '{current_status_str}'. Notificando.")
            self.last_known_status_str = current_status_str
            self.send_update(current_status_str)

    @dbus.service.method(GATT_CHRC_IFACE,
                         in_signature='a{sv}',
                         out_signature='ay')
    def ReadValue(self, options):
        return [dbus.Byte(b) for b in self.last_known_status_str.encode('utf-8')]

class WifiCommandCharacteristic(Characteristic):
    WIFI_COMMAND_UUID = '12345678-1234-5678-1234-56789abcdef6'
    
    def __init__(self, bus, index, service, connection_event):
        Characteristic.__init__(
            self, bus, index,
            self.WIFI_COMMAND_UUID,
            ['write'],
            service)
        self.connection_event = connection_event

    def _connect_wifi_task(self, ssid, password):
        """Esta função será executada em uma thread separada."""
        #print(f"WifiConfig [Thread]: Iniciando conexão para SSID: {ssid}")
        try:
            # Tenta remover uma conexão existente
            subprocess.run(["sudo", "nmcli", "connection", "delete", ssid], check=False, capture_output=True)
            
            # Adiciona a nova conexão
            cmd = ["sudo", "nmcli", "device", "wifi", "connect", ssid, "password", password, "ifname", "wlan0", "name", ssid]
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            
            #print(f"WifiConfig [Thread]: nmcli connect output: {result.stdout}")
            self.current_ssid = ssid
            #print(f"WifiConfig [Thread]: Conexão Wi-Fi para '{ssid}' configurada com sucesso.")

        except subprocess.CalledProcessError as e:
            print(f"WifiConfig [Thread]: Erro ao configurar Wi-Fi com nmcli: {e}")
            print(f"nmcli stderr: {e.stderr}")
        except Exception as e:
            print(f"WifiConfig [Thread]: Erro inesperado na tarefa de conexão: {e}")
        finally:
            self.connection_event.set()

    def _disconnect_wifi_task(self):
        """Task para desconectar de todas as redes Wi-Fi gerenciadas por nmcli."""
        #print("[WifiConfig] Iniciando tarefa de desconexão...")
        try:
            # Lista todas as conexões ativas
            list_cmd = ["nmcli", "-t", "-f", "NAME,DEVICE", "connection", "show", "--active"]
            result = subprocess.run(list_cmd, capture_output=True, text=True, check=True)

            # Procura por conexões na interface wlan0
            for line in result.stdout.strip().split('\n'):
                if 'wlan0' in line:
                    connection_name = line.split(':')[0]
                    #print(f"[WifiConfig] Desativando conexão: {connection_name}")
                    # Desativa a conexão
                    disconnect_cmd = ["sudo", "nmcli", "connection", "down", connection_name]
                    subprocess.run(disconnect_cmd, check=True)
            
            #print("[WifiConfig] Todas as conexões Wi-Fi ativas foram desativadas.")

        except Exception as e:
            print(f"[WifiConfig Thread] Erro ao desconectar: {e}")
        finally:
            self.connection_event.set()
            
    @dbus.service.method(GATT_CHRC_IFACE, in_signature='aya{sv}', out_signature='')
    
    def WriteValue(self, value, options):
        try:
            json_str = bytes(value).decode('utf-8')
            #print(f"WifiConfig: Received JSON string: {json_str}")
            data = json.loads(json_str)

            if data.get('command') == 'offline':
                thread = threading.Thread(target=self._disconnect_wifi_task)
                thread.daemon = True
                thread.start()
                return
                
            ssid = data.get('ssid')
            password = data.get('password')

            if ssid and password:
                #print("WifiConfig: Dados válidos. Disparando tarefa de conexão em segundo plano.")
                
                thread = threading.Thread(target=self._connect_wifi_task, args=(ssid, password))
                thread.daemon = True
                thread.start()

                return
            else:
                raise exceptions.InvalidArgsException("SSID ou senha ausentes")

        except Exception as e:
            print(f"WifiConfig: Erro geral ao processar WriteValue: {e}")
            raise exceptions.FailedException("Erro ao processar o pedido.")