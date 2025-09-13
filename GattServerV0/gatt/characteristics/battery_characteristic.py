# gatt/characteristics/battery_characteristic.py

import dbus
from gatt.characteristic import Characteristic
from config import GATT_CHRC_IFACE

class BatteryCharacteristic(Characteristic):
    BATTERY_CHRC_UUID = '12345678-1234-5678-1234-56789abcdef4'

    def __init__(self, bus, index, service, ina219_instance):
        Characteristic.__init__(
            self, bus, index,
            self.BATTERY_CHRC_UUID,
            ['read', 'notify'],
            service)
        # O valor é fixo e definido na inicialização por não haver a UPS
        self.fixed_status_str = "100%, 3h 33min"
        self.value = dbus.Array(self.fixed_status_str.encode('utf-8'), signature='y')

    @dbus.service.method(GATT_CHRC_IFACE, in_signature='a{sv}', out_signature='ay')
    def ReadValue(self, options):
        """Retorna o valor fixo de status da bateria."""
        return self.value

    @dbus.service.method(GATT_CHRC_IFACE)
    def StartNotify(self):
        """Sobrescreve para enviar o valor fixo imediatamente após a inscrição."""
        if self.notifying:
            return
        self.notifying = True
        self.PropertiesChanged(GATT_CHRC_IFACE, {'Value': self.value}, [])

    def send_battery_update(self):
        battery_info_str = "100%, 3h 33min"
        self.send_update(battery_info_str)