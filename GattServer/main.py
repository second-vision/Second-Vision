# main.py

import dbus
import dbus.mainloop.glib
import functools
import threading
import sys
import argparse
from gi.repository import GLib

# --- Importações dos nossos novos módulos ---
# A estrutura de diretórios torna os imports claros
from bluez import advertising, adapters
from gatt.application import Application
from threads import battery_monitor_loop, internet_status_updater_loop
from services.image_processor import camera_capture_loop
from config import GATT_MANAGER_IFACE, BLUEZ_SERVICE_NAME, ina219
from utils.callbacks import register_app_cb, register_app_error_cb

# --- Ponto de Entrada Principal ---
def main():
    # Inicializa o loop principal do GLib para o DBus
    dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)
    bus = dbus.SystemBus()
    mainloop = GLib.MainLoop()
    
    # --- Verificação de Hardware Crítico ---
    # Se o sensor de bateria não inicializou, o programa não pode continuar.
    if ina219 is None:
        print("[Main] ERRO CRÍTICO: Sensor INA219 não encontrado. Encerrando.")
        sys.exit(1)
        
    # --- Objetos de Comunicação entre Threads ---
    shared_state = {'internet_connected': False}
    internet_check_event = threading.Event()

    # --- Inicialização da Publicidade e Aplicação GATT ---
    parser = argparse.ArgumentParser()
    parser.add_argument('-a', '--adapter-name', type=str, help='Adapter name', default='')
    args = parser.parse_args()
    adapter_name = args.adapter_name
    adapter_path = adapters.find_adapter(bus, GATT_MANAGER_IFACE, adapter_name)
    if not adapter_path:
        print(f"[Main] ERRO: Adaptador GATT '{adapter_name or 'padrão'}' não encontrado.")
        sys.exit(1)

    # Inicia a publicidade (advertising)
    advertising.advertising_main(mainloop, bus, adapter_path)
    
    # Registra a aplicação GATT
    service_manager = dbus.Interface(bus.get_object(BLUEZ_SERVICE_NAME, adapter_path), GATT_MANAGER_IFACE)
    app = Application(bus, internet_check_event)
    
    print('[Main] Registrando aplicação GATT...')
    service_manager.RegisterApplication(app.get_path(), {},
                                        reply_handler=register_app_cb,
                                        error_handler=functools.partial(register_app_error_cb, mainloop))

    # --- Preparação das Características para os Threads (Forma Melhorada) ---
    # Acessa as características de forma mais explícita e segura
    try:
        main_service = app.services[0]
        # Supondo que você mantenha a ordem no TestService
        yolo_char = main_service.characteristics[0]
        ocr_char = main_service.characteristics[1]
        battery_char = main_service.characteristics[3]
        # A instância 'app' já tem a referência para a wifi_status_characteristic
    except IndexError:
        print("[Main] ERRO: Falha ao encontrar as características esperadas no serviço GATT.")
        sys.exit(1)

    # --- Inicialização dos Threads ---
    print("[Main] Iniciando threads de background...")
    
    threads = [
        threading.Thread(target=camera_capture_loop, args=(yolo_char, ocr_char, shared_state)),
        threading.Thread(target=battery_monitor_loop, args=(battery_char,)),
        threading.Thread(target=internet_status_updater_loop, args=(shared_state, internet_check_event, app))
    ]

    for t in threads:
        t.daemon = True
        t.start()

    print("[Main] Servidor GATT e threads iniciados. Pressione Ctrl+C para sair.")
    try:
        mainloop.run()
    except KeyboardInterrupt:
        print("\n[Main] Encerrando o programa...")
    finally:
        # Aqui você pode adicionar lógica de limpeza se necessário,
        # como desregistrar a aplicação GATT.
        mainloop.quit()

if __name__ == '__main__':
    main()