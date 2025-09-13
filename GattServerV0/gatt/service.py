# gatt/service.py
import dbus
import dbus.service
import uuid
from config import GATT_SERVICE_IFACE, DBUS_PROP_IFACE, ina219
from .characteristics import YoloCharacteristic, OcrPaddle, ShutdownCharacteristic, BatteryCharacteristic, WifiStatusCharacteristic, WifiCommandCharacteristic, DeviceInfoCharacteristic

class Service(dbus.service.Object):
    PATH_BASE = '/org/bluez/example/service'

    def __init__(self, bus, index, uuid_str, primary):
        unique_id = str(uuid.uuid4())[:8]
        self.path = f"{self.PATH_BASE}{index}_{unique_id}"
        self.bus = bus
        self.uuid = uuid_str
        self.primary = primary
        self.characteristics = []
        dbus.service.Object.__init__(self, bus, self.path)

    def get_properties(self):
        return {
            GATT_SERVICE_IFACE: {
                'UUID': self.uuid,
                'Primary': self.primary,
                'Characteristics': dbus.Array(
                    self.get_characteristic_paths(),
                    signature='o')
            }
        }

    def get_path(self):
        return dbus.ObjectPath(self.path)

    def add_characteristic(self, characteristic):
        self.characteristics.append(characteristic)

    def get_characteristic_paths(self):
        result = []
        for chrc in self.characteristics:
            result.append(chrc.get_path())
        return result

    def get_characteristics(self):
        return self.characteristics

    @dbus.service.method(DBUS_PROP_IFACE,
                         in_signature='s',
                         out_signature='a{sv}')
    def GetAll(self, interface):
        if interface != GATT_SERVICE_IFACE:
            raise exceptions.InvalidArgsException()
        return self.get_properties()[GATT_SERVICE_IFACE]

class TestService(Service):
    TEST_SVC_UUID = '12345678-1234-5678-1234-56789abcdef0'

    def __init__(self, bus, index, connection_event):
        Service.__init__(self, bus, index, self.TEST_SVC_UUID, True)
        self.add_characteristic(YoloCharacteristic(bus, 0, self))
        self.add_characteristic(OcrPaddle(bus, 1, self))
        self.add_characteristic(ShutdownCharacteristic(bus, 2, self))
        self.add_characteristic(BatteryCharacteristic(bus, 3, self, ina219))
        self.add_characteristic(WifiStatusCharacteristic(bus, 4, self))
        self.add_characteristic(WifiCommandCharacteristic(bus, 5, self, connection_event))
        self.add_characteristic(DeviceInfoCharacteristic(bus, 6, self))
