# services/models/local_vision.py

import threading
import time
import sys

# Tenta importar as bibliotecas essenciais
try:
    import numpy as np
    from picamera2 import Picamera2
    from picamera2.devices import IMX500
    from picamera2.devices.imx500 import (NetworkIntrinsics, 
                                          postprocess_nanodet_detection)
    PICAMERA2_AVAILABLE = True
except ImportError as e:
    print(f"\n[AI Cam] ERRO: Dependência não encontrada: {e}.")
    print("[AI Cam] O modo offline de detecção de objetos não funcionará.\n")
    PICAMERA2_AVAILABLE = False


class AICameraService:
    """
    Gerencia a Câmera com IA (IMX500) adaptando o código de exemplo oficial
    para rodar em um thread e fornecer uma lista de detecções.
    """
    def __init__(self, 
                 model_path="/usr/share/imx500-models/imx500_network_ssd_mobilenetv2_fpnlite_320x320_pp.rpk",
                 labels_path="assets/coco_labels.txt", 
                 threshold=0.70):
        
        self.latest_objects = []
        self._lock = threading.Lock()
        self.is_running = False
        self.latest_frame = None
        self.threshold = threshold
        self.picam2 = None
        self.imx500 = None
        self.intrinsics = None

        if not PICAMERA2_AVAILABLE:
            return

        try:
            # --- 1. Inicialização do IMX500 e Intrinsics (do exemplo) ---
            print("[AI Cam] Inicializando dispositivo IMX500...")
            self.imx500 = IMX500(model_path)
            self.intrinsics = self.imx500.network_intrinsics
            if not self.intrinsics: self.intrinsics = NetworkIntrinsics()
            if self.intrinsics.task != "object detection":
                raise RuntimeError("O modelo carregado não é de detecção de objetos.")
            
            with open(labels_path, "r") as f:
                self.intrinsics.labels = f.read().splitlines()
            self.intrinsics.update_with_defaults()
            # Adiciona o threshold aos intrinsics para que 'parse_detections' possa usá-lo
            self.intrinsics.threshold = self.threshold
            print("[AI Cam] Modelo e labels carregados.")

            # --- 2. Inicialização da Picamera2 ---
            self.picam2 = Picamera2(self.imx500.camera_num)
            config = self.picam2.create_preview_configuration(controls={"FrameRate": self.intrinsics.inference_rate})
            self.picam2.configure(config)
            
            self.imx500.show_network_fw_progress_bar()
            self.picam2.start()
            print("[AI Cam] Câmera iniciada.")
            
            # --- 3. Inicia nosso thread de processamento ---
            self.is_running = True
            self.thread = threading.Thread(target=self._processing_loop, daemon=True)
            self.thread.start()

        except Exception as e:
            print(f"[AI Cam] ERRO CRÍTICO ao inicializar a Câmera com IA: {e}")
            if self.picam2: self.picam2.stop()
            self.picam2 = None

    def _parse_detections(self, metadata):
        """
        Parse robusto para postprocess_nanodet_detection.
        Retorna somente nomes de labels com score >= self.intrinsics.threshold.
        Protege contra shapes estranhos como (1,0,4) e mismatches.
        """
        np_outputs = self.imx500.get_outputs(metadata, add_batch=True)
        if np_outputs is None:
            return []
    
        try:
            # chama o postprocess (mantive iou fixo como antes)
            res = postprocess_nanodet_detection(
                outputs=np_outputs[0],
                conf=self.intrinsics.threshold,
                iou_thres=0.70
            )[0]
        except Exception as e:
            print(f"[AI Cam] postprocess_nanodet_detection error: {e}")
            return []
    
        # espera (boxes, scores, classes)
        if not (isinstance(res, (list, tuple)) and len(res) >= 3):
            print("[AI Cam] Unexpected postprocess return:", type(res))
            return []
    
        boxes, scores, classes = res
    
        # normalize para numpy
        boxes = np.asarray(boxes)
        scores = np.asarray(scores)
        classes = np.asarray(classes)
    
        # Se houver dimensão de batch (1, ...), "aperta" para ficar sem a batch
        if boxes.ndim == 3 and boxes.shape[0] == 1:
            boxes = boxes[0]
        if scores.ndim >= 2 and scores.shape[0] == 1:
            scores = scores[0]
        if classes.ndim >= 2 and classes.shape[0] == 1:
            classes = classes[0]
    
        # Se não há elementos em boxes -> sem detecções
        if boxes.size == 0 or (boxes.ndim >= 1 and boxes.shape[0] == 0):
            return []
    
        # Flatten scores/classes caso estejam em (N,1) ou similares
        try:
            scores = scores.reshape(-1)
        except Exception:
            scores = np.ravel(scores)
    
        try:
            classes = classes.reshape(-1)
        except Exception:
            classes = np.ravel(classes)


        print("[AI Cam DEBUG] boxes.shape:", boxes.shape, "boxes.size:", boxes.size)
        print("[AI Cam DEBUG] scores.shape:", scores.shape)
        print("[AI Cam DEBUG] classes.shape:", classes.shape)
        # Proteção extra: use apenas o número mínimo consistente entre arrays
        n = min(len(boxes), len(scores), len(classes))
        if n == 0:
            return []
    
        detected_labels = []
        all_labels = self.intrinsics.labels
        for i in range(n):
            score = float(scores[i])
            cat_idx = int(classes[i])
            if score >= getattr(self.intrinsics, "threshold", self.threshold):
                if 0 <= cat_idx < len(all_labels):
                    label = all_labels[cat_idx]
                    if label and label != "-":
                        detected_labels.append(label)
    
        return detected_labels

    def _processing_loop(self):
        """
        Loop em background que captura metadados e os processa usando a lógica do exemplo.
        """
        print("[AI Cam Loop] Thread de processamento iniciado.")
        while self.is_running and self.picam2:
            try:
                frame = self.picam2.capture_array("main")
                metadata = self.picam2.capture_metadata()
                
                # Chama a nossa função de parse adaptada
                objects = self._parse_detections(metadata)
                
                with self._lock:
                    self.latest_frame = frame
                    self.latest_objects = objects
            except Exception as e:
                print(f"[AI Cam] Erro no loop de processamento: {e}")
                time.sleep(1)

    def get_latest_objects(self):
        # Retorna a lista de objetos únicos para consistência com o modo online
        with self._lock:
            return list(set(self.latest_objects))

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
ai_camera_service = AICameraService(threshold=0.70)

def detect_objects_local_ai_cam():
    if ai_camera_service and ai_camera_service.picam2:
        return ai_camera_service.get_latest_objects()
    return []

def detect_text_local(frame, perform_correction=True):
    return []
