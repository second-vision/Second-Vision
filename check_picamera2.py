import inspect
import picamera2
import picamera2.devices.imx500 as imx500
from picamera2.devices import IMX500

with open("picamera2_info.txt", "w") as f:
    f.write("=== Picamera2 ===\n")
    f.write(str(dir(picamera2)) + "\n\n")

    f.write("=== picamera2.devices.IMX500 (classe) ===\n")
    f.write(str(dir(IMX500)) + "\n\n")
    f.write(inspect.getdoc(IMX500) or "Sem docstring\n\n")

    f.write("=== picamera2.devices.imx500 (módulo) ===\n")
    for name, obj in inspect.getmembers(imx500):
        if inspect.isfunction(obj):
            f.write(f"- função: {name}\n")
