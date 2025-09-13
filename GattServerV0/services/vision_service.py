# services/vision_service.py

import time

# --- Importações dos Módulos ---
# Importa as funções que interagem com o hardware da câmera e os modelos
from services.models.local_vision import (ai_camera_service, 
                                          detect_objects_local_ai_cam, 
                                          detect_text_local)
# Importa a função que se comunica com a API da nuvem
from services.api.cloud_vision import process_frame
# Importa a classe de estabilização de objetos
from services.stabilizers.vision_stabilizers import ObjectTracker, TextStabilizer

def camera_capture_loop(characteristic_objects, characteristic_texts, shared_state):
    """
    Loop principal que orquestra o processamento de imagem para a versão Pi Zero 2W.
    Utiliza a Câmera com IA para detecção de objetos offline.
    
    Args:
        characteristic_objects: A instância da característica GATT para objetos.
        characteristic_texts: A instância da característica GATT para textos.
        shared_state (dict): Dicionário compartilhado que contém 'internet_connected'.
    """
    if not ai_camera_service or not ai_camera_service.is_running:
        print("[Vision Service] ERRO: Serviço da Câmera com IA não foi inicializado. Encerrando o loop de visão.")
        return

    # --- Inicialização dos Componentes ---
    # O tracker é útil para suavizar as detecções da Câmera AI, que podem variar entre frames.
    tracker = ObjectTracker(window_size=5, stability_threshold_ratio=0.6)
    text_stabilizer = TextStabilizer(similarity_threshold=85, stability_count=3)

    # --- Variáveis de Controle do Loop ---
    frame_count = 0
    PROCESS_EVERY_N_FRAMES = 1  # Controla a frequência de processamento geral
    last_sent_objects_str = None

    print("[Vision Service] Loop de captura e processamento iniciado.")
    while True:
        try:
            # Pega o frame mais recente que o AICameraService capturou em background.
            frame = ai_camera_service.get_latest_frame()
            if frame is None:
                print("[Vision Service] Aguardando o primeiro frame da câmera...")
                time.sleep(1)
                continue

            frame_count += 1
            if frame_count % PROCESS_EVERY_N_FRAMES != 0:
                time.sleep(0.01)
                continue

            is_online = shared_state.get('internet_connected', False)
            
            # --- 1. Processamento de Objetos ---
            stable_objects_list = []

            if is_online:
                # MODO ONLINE: Envia o frame para a API da nuvem.
                api_detections = process_frame(frame, is_object_detection=True) or []
                # Remove duplicatas para ter uma lista limpa de tipos de objetos.
                stable_objects_list = list(set(api_detections))
            else:
                # MODO OFFLINE: Pega os resultados já processados pela Câmera AI.
                local_detections = detect_objects_local_ai_cam()
                # Passa as detecções pelo estabilizador para suavizar o resultado.
                tracker.update(local_detections)
                stable_objects_list = tracker.get_stable_objects()

            # Lógica de envio da notificação de objetos
            stable_objects_list.sort()
            current_objects_str = ", ".join(stable_objects_list) if stable_objects_list else "none"
      
            if current_objects_str != last_sent_objects_str:
                characteristic_objects.send_update(current_objects_str)
                last_sent_objects_str = current_objects_str
                print(f"[Vision Service] Objetos enviados: {current_objects_str}")

            # --- 2. Processamento de Texto (OCR) ---
            extracted_texts_phrases = []

            if is_online:
                # MODO ONLINE: Envia o frame para a API de OCR da nuvem.
                extracted_texts_phrases = process_frame(frame, is_object_detection=False) or []
            else:
                # MODO OFFLINE: Não há suporte para OCR local nesta versão.
                # A função detect_text_local() retorna uma lista vazia.
                extracted_texts_phrases = detect_text_local(frame)
            
            # Lógica de estabilização e envio de notificação de texto
            current_text = " | ".join(extracted_texts_phrases)
            stabilized_text = text_stabilizer.update(current_text)
            
            if stabilized_text:
                characteristic_texts.send_update(stabilized_text)
                # print(f"[Vision Service] Texto enviado: '{stabilized_text}'")

            # Pequena pausa para não sobrecarregar a CPU com o loop Python
            time.sleep(0.1) 

        except Exception as e:
            print(f"[Vision Service] ERRO INESPERADO NO LOOP PRINCIPAL: {e}")
            time.sleep(5)

    print("[Vision Service] Encerrando o loop de captura.")
    ai_camera_service.stop()