# gatt/characteristics/batterry_characteristics.py
import dbus
import time
import threading
from collections import deque
from gatt.characteristic import Characteristic
from config import GATT_CHRC_IFACE

class BatteryCharacteristic(Characteristic):
    BATTERY_CHRC_UUID = '12345678-1234-5678-1234-56789abcdef4'

    def __init__(self, bus, index, service, ina219_instance):
        Characteristic.__init__(
            self, bus, index,
            self.BATTERY_CHRC_UUID,
            ['read', 'notify'],
            service)
        self.ina219 = ina219_instance
        # Para o buffer de corrente média
        self.current_buffer = deque(maxlen=60) # Armazena ~1 minuto de leituras se atualizado a cada segundo
        self.nominal_capacity_mah = 5200

        initial_info_str = self._get_formatted_battery_string()

        self.value = [dbus.Byte(b) for b in initial_info_str.encode('utf-8')]

        init_thread = threading.Thread(target=self._initial_buffer_fill)
        init_thread.daemon = True
        init_thread.start()

    def _initial_buffer_fill(self):
        """
        Função executada em um thread para preencher o buffer de corrente na inicialização.
        """
        #print("[Bateria Init] Iniciando preenchimento do buffer de corrente em segundo plano...")
        # Faz 15 leituras ao longo de 15 segundos (1 por segundo).
        # Isso dá uma média inicial.
        for i in range(15):
            try:
                
                _, current_mA, _, _ = self._get_current_status_and_percentage()
                self._update_current_buffer(current_mA)
                print(f"[Bateria Init] Leitura {i+1}/15: {current_mA:.2f} mA. Tamanho do buffer: {len(self.current_buffer)}")
                time.sleep(1)
            except Exception as e:
                print(f"[Bateria Init] Erro durante a leitura inicial: {e}")
        print("[Bateria Init] Preenchimento inicial do buffer concluído.")


    def _get_current_status_and_percentage(self):
        """Lê o sensor e calcula a porcentagem."""
        if not self.ina219:
            print("Warning: INA219 sensor not available in BatteryCharacteristic.")
            return 0.0, 0.0, True
        
        try:
            bus_voltage = self.ina219.getBusVoltage_V()
            current_mA = self.ina219.getCurrent_mA()

            min_voltage = 6.0  # Ajuste se a tensão de corte do UPS for diferente
            max_voltage = 8.4  # Tensão de 2S LiPo/Li-ion totalmente carregada
            
            if bus_voltage <= min_voltage:
                percentage = 0.0
            elif bus_voltage >= max_voltage:
                percentage = 100.0
            else:
                percentage = (bus_voltage - min_voltage) / (max_voltage - min_voltage) * 100.0
            
            percentage = max(0.0, min(100.0, percentage))
            return bus_voltage, current_mA, percentage, False
        except Exception as e:
            print(f"Error reading INA219 in BatteryCharacteristic: {e}")
            return 0.0, 0.0, 0.0, True

    def _update_current_buffer(self, current_mA):
        if current_mA < -10: 
            self.current_buffer.append(abs(current_mA))
        elif current_mA > 10: 
            self.current_buffer.clear()


    def _get_average_discharge_current_mA(self):
        """Calcula a corrente de descarga média do buffer."""
        if not self.current_buffer:
            return 0.0
        return sum(self.current_buffer) / len(self.current_buffer)

    def _calculate_remaining_time_hours(self, percentage, avg_discharge_current_mA):
        if avg_discharge_current_mA < 10:
            return float('inf') 
        
        remaining_capacity_mAh = (percentage / 100.0) * self.nominal_capacity_mah
        
        if remaining_capacity_mAh <= 0:
             return 0.0

        estimated_time_hours = remaining_capacity_mAh / avg_discharge_current_mA
        return estimated_time_hours

    def _format_time(self, time_hours):
        if time_hours == float('inf'):
             _, current_mA, _, _ = self._get_current_status_and_percentage()
             if current_mA > 20:
                 return "Carregando"
             if not self.current_buffer:
                 return "Calculando tempo restante..."
             return "Carga completa"
    
        if time_hours <= 0:
            return "Descarregado"
    
        # --- Cálculo de Horas e Minutos ---
        hours = int(time_hours)
        minutes = int((time_hours * 60) % 60)
    
        if hours == 0 and minutes < 1:
            return "Menos de 1 minuto"
    
        # --- Lógica de Pluralização e Construção da String ---
        hora_texto = "hora" if hours == 1 else "horas"
        minuto_texto = "minuto" if minutes == 1 else "minutos"
    
        partes_do_texto = []
        
        if hours > 0:
            partes_do_texto.append(f"{hours} {hora_texto}")
        
        if minutes > 0:
            partes_do_texto.append(f"{minutes} {minuto_texto}")
    
        return " e ".join(partes_do_texto)

    def _get_formatted_battery_string(self):
        """Obtém todos os dados da bateria e formata a string de saída."""
        bus_voltage, current_mA, percentage, error = self._get_current_status_and_percentage()

        if error:
            return "Bateria: Erro Leitura"

        self._update_current_buffer(current_mA)
        avg_discharge_current_mA = self._get_average_discharge_current_mA()
        
        estimated_time_hours = self._calculate_remaining_time_hours(percentage, avg_discharge_current_mA)
        formatted_time_str = self._format_time(estimated_time_hours)

        # Ex: "75.3%, 6h 30min"
        return f"{percentage:.1f}%, {formatted_time_str}"


    @dbus.service.method(GATT_CHRC_IFACE,
                         in_signature='a{sv}',
                         out_signature='ay')
    def ReadValue(self, options):
        battery_info_str = self._get_formatted_battery_string()
        current_value_bytes = [dbus.Byte(b) for b in battery_info_str.encode('utf-8')]
        return dbus.Array(current_value_bytes, signature='y')


    def send_battery_update(self):
        battery_info_str = self._get_formatted_battery_string()
        self.send_update(battery_info_str)