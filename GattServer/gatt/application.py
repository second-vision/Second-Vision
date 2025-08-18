# gatt/application.py
import dbus
import dbus.service
from config import DBUS_OM_IFACE
from gatt.service import TestService

class Application(dbus.service.Object):
    def __init__(self, bus, connection_event):
        self.path = '/'
        self.services = []
        dbus.service.Object.__init__(self, bus, self.path)
        
        service = TestService(bus, 0, connection_event)
        self.add_service(service)
        
        # A referência agora deve apontar para a característica de status dentro do serviço
        self.wifi_status_characteristic = service.characteristics[4]

    def get_path(self):
        return dbus.ObjectPath(self.path)

    def add_service(self, service):
        self.services.append(service)

    @dbus.service.method(DBUS_OM_IFACE, out_signature='a{oa{sa{sv}}}')
    def GetManagedObjects(self):
        response = {}
        print('GetManagedObjects')
        for service in self.services:
            response[service.get_path()] = service.get_properties()
            chrcs = service.get_characteristics()
            for chrc in chrcs:
                response[chrc.get_path()] = chrc.get_properties()
                descs = chrc.get_descriptors()
                for desc in descs:
                    response[desc.get_path()] = desc.get_properties()
        return response