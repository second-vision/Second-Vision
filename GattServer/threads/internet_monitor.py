# threads/internet_monitor.py
from threading import Event
from gatt.application import Application
from services.internet_service import get_wifi_connection_status


def internet_status_updater_loop(state: dict, event: Event, app_instance: Application):
    """
    Thread que verifica a conexão, atualiza o estado compartilhado e dispara notificações.
    """
    while True:
        app_instance.wifi_status_characteristic.update_and_notify_status()
        
        is_connected, _ = get_wifi_connection_status()
        
        if is_connected != state.get('internet_connected'):
            #print(f"[Internet Check] Status da internet mudou para: {'Conectado' if is_connected else 'Desconectado'}")
            state['internet_connected'] = is_connected
        
        event.wait(timeout=15)
        event.clear()