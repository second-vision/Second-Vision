# threads/battery_monitor.py

import time

def battery_monitor_loop(battery_characteristic):
    while True:
        battery_characteristic.send_battery_update()
        time.sleep(60)