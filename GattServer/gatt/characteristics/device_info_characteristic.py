# gatt/characteristics/device_info_characteristics.py
import dbus
import json
from gatt.characteristic import Characteristic
from config import GATT_CHRC_IFACE


class DeviceInfoCharacteristic(Characteristic):
    DEVICE_INFO_UUID = '12345678-1234-5678-1234-56789abcdef7' # NOVO UUID!

    def __init__(self, bus, index, service):
        Characteristic.__init__(
            self, bus, index,
            self.DEVICE_INFO_UUID,
            ['read'], # Apenas leitura!
            service)
        self.info_payload = self._get_device_info()

    def _get_device_info(self):
        """
        Monta o JSON com as informações do dispositivo.
        """
        device_version = os.getenv('DEVICE_VERSION', 'V5') # Default para V5
        
        info = {}
        if device_version == 'V5':
            info = {
                "model": "RPi-5",
                "version_code": 5.0,
                "features": ["local_yolo", "cloud_yolo", "local_ocr", "cloud_ocr"]
            }
        elif device_version == 'V0':
            info = {
                "model": "RPi-0",
                "version_code": 0.2, # Exemplo
                "features": ["cloud_yolo", "cloud_ocr"] # Note a ausência de 'local_yolo'
            }
        
        return json.dumps(info) # Converte o dicionário para uma string JSON

    @dbus.service.method(GATT_CHRC_IFACE, in_signature='a{sv}', out_signature='ay')
    def ReadValue(self, options):
        # Retorna a string JSON como um array de bytes
        return [dbus.Byte(b) for b in self.info_payload.encode('utf-8')]