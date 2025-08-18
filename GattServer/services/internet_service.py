# services/internet_service.py
import subprocess

def get_wifi_connection_status():
    """
    Verifica o status da conexão Wi-Fi usando nmcli.

    Returns:
        tuple[bool, str | None]: Uma tupla contendo:
                                 - True se conectado, False caso contrário.
                                 - O nome do SSID se conectado, None caso contrário.
    """
    try:
        cmd = ["nmcli", "-t", "-f", "ACTIVE,SSID", "dev", "wifi"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        for line in result.stdout.strip().split('\n'):
            if line.startswith('yes:'):
                active_ssid = line.split(':', 1)[1]
                return True, active_ssid # Retorna True e o nome do SSID
        
        return False, None # Nenhuma conexão ativa encontrada
        
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False, None # O comando falhou ou não foi encontrado
    except Exception as e:
        print(f"[Internet Service] Erro inesperado ao verificar Wi-Fi: {e}")
        return False, None