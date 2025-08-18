# services/vision_service.py

import cv2
import time

# --- Importações dos Módulos Refatorados ---
# Importa as funções que executam os modelos locais
from services.models.local_vision import detect_objects_local, detect_text_local
# Importa a função que se comunica com a API da nuvem
from services.api.cloud_vision import process_frame
# Importa as classes de estabilização
from services.stabilizers.vision_stabilizers import ObjectTracker, TextStabilizer

def camera_capture_loop(characteristic_objects, characteristic_texts, shared_state):
    """
    Loop principal que captura frames da câmera e orquestra o processamento
    de objetos e texto, alternando entre local e nuvem com base no estado da internet.
    
    Args:
        characteristic_objects: A instância da característica GATT para objetos.
        characteristic_texts: A instância da característica GATT para textos.
        shared_state (dict): Dicionário compartilhado que contém 'internet_connected'.
    """
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("[Vision Service] ERRO: Não foi possível acessar a câmera.")
            return
    except Exception as e:
        print(f"[Vision Service] ERRO ao tentar abrir a câmera: {e}")
        return

    # --- Inicialização dos Componentes ---
    tracker = ObjectTracker(window_size=5, stability_threshold_ratio=0.6)
    text_stabilizer = TextStabilizer(similarity_threshold=85, stability_count=3)

    # --- Variáveis de Controle do Loop ---
    frame_count = 0
    PROCESS_EVERY_N_FRAMES = 2  # Controla a frequência de processamento geral
    last_sent_objects_str = None

    print("[Vision Service] Loop de captura e processamento iniciado.")
    while True:
        try:
            ret, frame = cap.read()
            if not ret:
                print("[Vision Service] Falha ao capturar imagem. Tentando novamente...")
                time.sleep(0.5)
                continue

            frame_count += 1
            if frame_count % PROCESS_EVERY_N_FRAMES != 0:
                time.sleep(0.01)
                continue

            is_online = shared_state.get('internet_connected', False)
            
            # --- 1. Processamento de Objetos ---
            if is_online:
                # Delega o trabalho para o serviço de API na nuvem
                final_objects_for_tracker = process_frame(frame, is_object_detection=True) or []
            else:
                # Delega o trabalho para o serviço de modelo local
                final_objects_for_tracker = detect_objects_local(frame)
            
            tracker.update(final_objects_for_tracker)
            stable_objects_list = tracker.get_stable_objects()
            stable_objects_list.sort()
            current_objects_str = ", ".join(stable_objects_list) if stable_objects_list else "nenhum objeto detectado"
      
            if current_objects_str != last_sent_objects_str:
                characteristic_objects.send_update(current_objects_str)
                last_sent_objects_str = current_objects_str
                print(f"[Vision Service] Objetos enviados: {current_objects_str}")

            # --- 2. Processamento de Texto (OCR) ---
            if is_online:
                # Delega para a API. A correção ortográfica não é necessária.
                extracted_texts_phrases = process_frame(frame, is_object_detection=False) or []
            else:
                # Delega para o modelo local. A correção é feita dentro da função.
                extracted_texts_phrases = detect_text_local(frame, perform_correction=True)
            
            current_text = " | ".join(extracted_texts_phrases)
            stabilized_text = text_stabilizer.update(current_text)
            
            if stabilized_text is not None: # Pode ser uma string vazia "", que é um update válido
                characteristic_texts.send_update(stabilized_text)
                print(f"[Vision Service] Texto enviado: '{stabilized_text}'")

        except Exception as e:
            print(f"[Vision Service] ERRO INESPERADO NO LOOP PRINCIPAL: {e}")
            # Adiciona uma pausa para evitar spam de logs em caso de erro contínuo
            time.sleep(5)

    print("[Vision Service] Encerrando o loop de captura.")
    cap.release()