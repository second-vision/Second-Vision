# services/vision_service.py

import time

# --- Importações dos Módulos Refatorados ---
# Importa as funções que interagem com o hardware e a API
from services.models.local_vision import ai_camera_service, detect_objects_local_ai_cam
from services.api.cloud_vision import process_frame
# Importa as classes de estabilização
from services.stabilizers.vision_stabilizers import ObjectTracker, TextStabilizer
# Importa OpenCV apenas para a codificação de imagem para a API
import cv2

# Mapeamento de labels detectados para os textos desejados
OFFLINE_LABEL_TRANSLATIONS = {
    "person": "Pessoa",
    "bicycle": "Bicicleta",
    "car": "Carro",
    "motorcycle": "Moto",
    "bus": "Ônibus",
    "train": "Trem",
    "truck": "Caminhão",
    "traffic light": "Semáforo",
    "stop sign": "Placa de Pare",
    "fire hydrant": "Hidrante",
}

def camera_capture_loop(characteristic_objects, characteristic_texts, shared_state):
    """
    Loop principal que orquestra o processamento de imagem para a versão Pi Zero 2W.
    Utiliza a Câmera com IA para detecção de objetos offline.
    
    Args:
        characteristic_objects: A instância da característica GATT para objetos.
        characteristic_texts: A instância da característica GATT para textos.
        shared_state (dict): Dicionário compartilhado que contém 'internet_connected'.
    """
    if not ai_camera_service or not ai_camera_service.picam2:
        print("[Vision Service] ERRO: Serviço da Câmera com IA não foi inicializado. Encerrando o loop de visão.")
        return

    # --- Inicialização dos Componentes ---
    # O TextStabilizer é útil para o texto vindo da API da nuvem.
    text_stabilizer = TextStabilizer(similarity_threshold=85, stability_count=3)

    # --- Variáveis de Controle do Loop ---
    last_sent_objects_str = None

    while True:
        try:
            is_online = shared_state.get('internet_connected', False)
            
            # --- 1. Processamento de Objetos ---
            translated_objects = []

            if is_online:
                # MODO ONLINE: Pega o frame da câmera e envia para a API.
                frame = ai_camera_service.get_latest_frame()
                if frame is not None:
                    api_detections = process_frame(frame, is_object_detection=True) or []
                    # Remove duplicatas para ter uma lista limpa de tipos de objetos.
                    translated_objects = list(set(api_detections))
            else:
                # MODO OFFLINE: Pega os resultados já processados pela Câmera AI.
                detected_objects = detect_objects_local_ai_cam()
                # Traduz os labels detectados para o português
                translated_objects = [
                    OFFLINE_LABEL_TRANSLATIONS.get(label, None)
                    for label in detected_objects
                ]
                # Remove valores None caso o label não esteja no dicionário
                translated_objects = [obj for obj in translated_objects if obj is not None]

            # Lógica de envio da notificação de objetos
            translated_objects.sort()
            current_objects_str = ", ".join(translated_objects) if translated_objects else "none"
      
            if current_objects_str != last_sent_objects_str:
                characteristic_objects.send_update(current_objects_str)
                last_sent_objects_str = current_objects_str
                #print(f"[Vision Service] Objetos enviados: {current_objects_str}")

            # --- 2. Processamento de Texto (OCR) ---
            # O OCR só funciona no modo online para esta versão do hardware.
            if is_online:
                frame = ai_camera_service.get_latest_frame()
                if frame is not None:
                    extracted_texts_phrases = process_frame(frame, is_object_detection=False) or []
                    current_text = " | ".join(extracted_texts_phrases)
                    stabilized_text = text_stabilizer.update(current_text)
                    
                    if stabilized_text:
                        characteristic_texts.send_update(stabilized_text)
                        #print(f"[Vision Service] Texto enviado: '{stabilized_text}'")
            else:
                # No modo offline, garante que o texto seja limpo se estava mostrando algo antes.
                stabilized_text = text_stabilizer.update("")


            # Pequena pausa para o loop principal não consumir 100% da CPU
            time.sleep(0.5)

        except Exception as e:
            print(f"[Vision Service] ERRO INESPERADO NO LOOP PRINCIPAL: {e}")
            time.sleep(5)

    ai_camera_service.stop()
