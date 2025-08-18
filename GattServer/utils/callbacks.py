# utils/callbacks.py

# É uma boa prática adicionar type hinting aqui também.
# A classe GLib.MainLoop não é facilmente importável para type hinting
# sem adicionar uma dependência completa do GI, então usamos 'any' ou uma string.
from typing import Any

def register_app_cb():
    """Callback executado quando a aplicação GATT é registrada com sucesso."""
    print('[Callback] Aplicação GATT registrada com sucesso.')

def register_app_error_cb(mainloop: Any, error: Any):
    """
    Callback executado quando há um erro ao registrar a aplicação GATT.
    
    Args:
        mainloop: A instância do GLib.MainLoop para ser encerrada.
        error: O objeto de erro retornado pelo DBus.
    """
    print(f'[Callback] ERRO: Falha ao registrar aplicação GATT: {error}')
    mainloop.quit()