# threads/internet_monitor.py

# --- Imports para Type Hinting ---
from threading import Event
# A importação pode precisar de ajuste dependendo da estrutura final,
# mas a partir do diretório raiz, seria assim:
from gatt.application import Application
from services.internet_service import get_wifi_connection_status


def internet_status_updater_loop(state: dict, event: Event, app_instance: Application):
    """
    Thread que verifica a conexão, atualiza o estado compartilhado e dispara notificações.
    """
    while True:
        # Primeiro, dispara a atualização e notificação na característica
        app_instance.wifi_status_characteristic.update_and_notify_status()
        
        # --- LÓGICA DE ATUALIZAÇÃO DO ESTADO COMPARTILHADO SIMPLIFICADA ---
        is_connected, _ = get_wifi_connection_status() # Ignoramos o SSID aqui
        
        if is_connected != state.get('internet_connected'):
            print(f"[Internet Check] Status da internet mudou para: {'Conectado' if is_connected else 'Desconectado'}")
            state['internet_connected'] = is_connected
        
        event.wait(timeout=15)
        event.clear()