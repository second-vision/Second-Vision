# gatt/characteristics/vision_characteristics.py
from gatt.characteristic import Characteristic

class YoloCharacteristic(Characteristic):
    YOLO_CHRC_UUID = '12345678-1234-5678-1234-56789abcdef1'

    def __init__(self, bus, index, service):
        Characteristic.__init__(self, bus, index, self.YOLO_CHRC_UUID, ['read', 'notify'], service)

class OcrPaddle(Characteristic):
    PADDLE_CHRC_UUID = '12345678-1234-5678-1234-56789abcdef2'

    def __init__(self, bus, index, service):
        Characteristic.__init__(self, bus, index, self.PADDLE_CHRC_UUID, ['read', 'notify'], service)