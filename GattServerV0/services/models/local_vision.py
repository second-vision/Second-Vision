# services/models/local_vision.py

import threading
import time
import sys

# Tenta importar as bibliotecas essenciais e define uma flag de disponibilidade
try:
    from picamera2 import Picamera2
    from picamera2.devices import IMX500
    from picamera2.devices.imx500 import postprocess_nanodet_detection
    PICAMERA2_AVAILABLE = True
except ImportError:
    print("\n[AI Cam] ERRO: Biblioteca 'picamera2' ou dependências não encontradas.")
    print("[AI Cam] O modo offline de detecção de objetos não funcionará.\n")
    PICAMERA2_AVAILABLE = False
except Exception as e:
    print(f"\n[AI Cam] ERRO ao importar dependências da Picamera2: {e}")
    PICAMERA2_AVAILABLE = False


class AICameraService:
    """
    Gerencia a Câmera com IA (IMX500), capturando e processando os metadados
    de detecção de objetos e os frames de imagem em um thread de background.
    """
    def __init__(self, 
                 model_path="/usr/share/imx500-models/imx500_network_ssd_mobilenetv2_fpnlite_320x320_pp.rpk",
                 labels_path="assets/coco_labels.txt", 
                 threshold=0.70):
        
        self.latest_objects = []
        self.latest_frame = None 
        self._lock = threading.Lock()
        self.is_running = False
        self.threshold = threshold
        self.picam2 = None
        self.imx500 = None
        self.intrinsics = None

        if not PICAMERA2_AVAILABLE:
            return

        try:
            # --- 1. Inicialização do IMX500 ---
            print("[AI Cam] Inicializando dispositivo IMX500...")
            self.imx500 = IMX500(model_path)
            self.intrinsics = self.imx500.network_intrinsics
            
            if not self.intrinsics or self.intrinsics.task != "object detection":
                raise RuntimeError("O modelo carregado não é de detecção de objetos ou falhou ao carregar intrinsics.")
            
            with open(labels_path, "r") as f:
                self.intrinsics.labels = f.read().splitlines()
            self.intrinsics.update_with_defaults()
            print("[AI Cam] Modelo e labels carregados.")

            # --- 2. Inicialização da Picamera2 ---
            self.picam2 = Picamera2(self.imx500.camera_num)
            config = self.picam2.create_preview_configuration(main={"size": (640, 480)})
            self.picam2.configure(config)
            
            self.imx500.show_network_fw_progress_bar()
            self.picam2.start()
            print("[AI Cam] Câmera iniciada com Picamera2.")
            
            # --- 3. Inicia nosso thread de processamento ---
            self.is_running = True
            self.thread = threading.Thread(target=self._processing_loop, daemon=True)
            self.thread.start()

        except FileNotFoundError:
            print(f"\n[AI Cam] ERRO CRÍTICO: Arquivo de modelo ou de labels não encontrado.")
            print(f"  - Modelo: '{model_path}'")
            print(f"  - Labels: '{labels_path}'")
            print("[AI Cam] Verifique os caminhos e a instalação dos assets da câmera.\n")
            self.picam2 = None
        except Exception as e:
            print(f"[AI Cam] ERRO CRÍTICO ao inicializar a Câmera com IA: {e}")
            if self.picam2: self.picam2.stop()
            self.picam2 = None
    
    def _parse_detections(self, metadata):
        """
        Decodifica os metadados da IA e retorna uma lista de nomes de objetos.
        """
        np_outputs = self.imx500.get_outputs(metadata, add_batch=True)
        if np_outputs is None:
            return None

        boxes, scores, classes = \
            postprocess_nanodet_detection(outputs=np_outputs[0], conf=self.threshold, iou_thres=0.70)[0]
        
        detected_labels = []
        labels = self.intrinsics.labels
        for score, category_index in zip(scores, classes):
            if score > self.threshold:
                label = labels[int(category_index)]
                if label and label != "-":
                    detected_labels.append(label)
        
        return detected_labels

    def _processing_loop(self):
        """
        Loop em background que captura frames de imagem e metadados, 
        processa os resultados e os armazena de forma segura.
        """
        while self.is_running and self.picam2:
            try:
                # Captura o frame da imagem
                frame = self.picam2.capture_array("main")
                # Captura os metadados associados
                metadata = self.picam2.capture_metadata()
                
                objects = self._parse_detections(metadata)
                
                # Armazena ambos (frame e objetos) de forma segura
                with self._lock:
                    self.latest_frame = frame
                    if objects is not None:
                        self.latest_objects = objects
            except Exception as e:
                print(f"[AI Cam] Erro no loop de processamento: {e}")
                time.sleep(1)

    def get_latest_objects(self):
        """Retorna a lista mais recente de objetos detectados (thread-safe)."""
        with self._lock:
            return list(self.latest_objects)

    def get_latest_frame(self):
        """Retorna o frame de imagem mais recente capturado (thread-safe)."""
        with self._lock:
            return self.latest_frame

    def stop(self):
        """Para a câmera e o thread."""
        self.is_running = False
        if self.picam2:
            self.picam2.stop()
            print("[AI Cam] Câmera parada.")

# --- Instância Única e Funções Públicas ---
# Esta instância é criada quando o módulo é importado pela primeira vez.
ai_camera_service = AICameraService()

def detect_objects_local_ai_cam():
    """
    Interface pública para obter a detecção de objetos mais recente 
    do serviço da Câmera com IA.
    """
    if ai_camera_service and ai_camera_service.picam2:
        return ai_camera_service.get_latest_objects()
    return []

def detect_text_local(frame, perform_correction=True):
    """
    Na versão do Pi Zero 2W, a detecção de texto local não é suportada.
    Esta função sempre retorna uma lista vazia.
    """
    return []
