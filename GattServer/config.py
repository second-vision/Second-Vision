# config.py

import dbus
import os
from hardware.ina219 import INA219

# --- Constantes BlueZ/DBus ---
BLUEZ_SERVICE_NAME = 'org.bluez'
LE_ADVERTISING_MANAGER_IFACE = 'org.bluez.LEAdvertisingManager1'
DBUS_OM_IFACE = 'org.freedesktop.DBus.ObjectManager'
DBUS_PROP_IFACE = 'org.freedesktop.DBus.Properties'
LE_ADVERTISEMENT_IFACE = 'org.bluez.LEAdvertisement1'
GATT_MANAGER_IFACE = 'org.bluez.GattManager1'
GATT_SERVICE_IFACE = 'org.bluez.GattService1'
GATT_CHRC_IFACE = 'org.bluez.GattCharacteristic1'
GATT_DESC_IFACE = 'org.bluez.GattDescriptor1'

# --- Inicialização de Hardware ---
# Tenta inicializar o sensor. Se falhar, ina219 será None.
try:
    ina219 = INA219(addr=0x42)
    #print("Sensor INA219 inicializado com sucesso.")
except Exception as e:
    print(f"ERRO: Não foi possível inicializar o sensor INA219: {e}")
    ina219 = None

# --- Configurações de Visão Computacional ---

# Chaves e Endpoints da API
OBJECT_API_ENDPOINT = os.getenv("IMAGE_ENDPOINT")
OBJECT_API_KEY = os.getenv("IMAGE_SUBSCRIPTION_KEY")
TEXT_API_ENDPOINT = os.getenv("OCR_ENDPOINT")
TEXT_API_KEY = os.getenv("OCR_SUBSCRIPTION_KEY")

# Constantes de Processamento
ALLOWED_OBJECTS = ['person', 'bicycle', 'car', 'motorcycle', 'bus', 'train', 'truck', 'traffic light', 'stop sign', 'fire hydrant']
TRANSLATION_DICT = {
    'person': 'pessoa', 'bicycle': 'bicicleta', 'car': 'carro', 'motorcycle': 'moto',
    'bus': 'ônibus', 'train': 'trem', 'truck': 'caminhão',
    'traffic light': 'semáforo', 'stop sign': 'placa de pare', 'fire hydrant': 'hidrante'
}

# --- Configurações para Filtragem de Texto ---
MIN_TEXT_SIMILARITY_RATIO = 85
MIN_WORD_COUNT_FOR_MEANINGFUL_TEXT = 2
MIN_AVG_WORD_LENGTH = 2
