# gatt/characteristics/shutdown_characteristics.py
import dbus
import os
from gatt.characteristic import Characteristic
from config import GATT_CHRC_IFACE

class ShutdownCharacteristic(Characteristic):
    SHUTDOWN_CHRC_UUID = '12345678-1234-5678-1234-56789abcdef3'

    def __init__(self, bus, index, service):
        Characteristic.__init__(
            self, bus, index,
            self.SHUTDOWN_CHRC_UUID,
            ['write'],
            service)
        self.value = []

    @dbus.service.method(GATT_CHRC_IFACE,
                         in_signature='aya{sv}',
                         out_signature='ay')
    def WriteValue(self, value, options):
        #print('Shutdown command received, shutting down...')
        self.value = value
        os.system('sudo systemctl stop bluetooth')
        os.system('sudo shutdown now')
