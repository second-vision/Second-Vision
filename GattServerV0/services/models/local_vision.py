# services/models/local_vision.py

import sys
import time

try:
    from picamera2 import Picamera2
    from picamera2.post_processing import PostProcessing
    from picamera2.devices import IMX500
    from picamera2.devices.imx500 import postprocess_nanodet_detection
    PICAMERA2_AVAILABLE = True
except ImportError:
    print("\n[AI Cam] ERRO: Biblioteca 'picamera2' não encontrada.")
    print("[AI Cam] O modo offline de detecção de objetos não funcionará.")
    print("[AI Cam] Instale com: pip install picamera2\n")
    PICAMERA2_AVAILABLE = False
except Exception as e:
    print(f"\n[AI Cam] ERRO ao importar dependências da Picamera2: {e}")
    PICAMERA2_AVAILABLE = False


class AICameraService(PostProcessing):
    """
    Gerencia a Câmera com IA (IMX500) usando o framework de pós-processamento
    da Picamera2 para extrair os resultados da detecção de objetos.
    """
    def __init__(self, 
                 model_path="/usr/share/imx500-models/imx500_network_ssd_mobilenetv2_fpnlite_320x320_pp.rpk",
                 labels_path="assets/coco_labels.txt", 
                 threshold=0.70):
        """
        Inicializa e inicia o serviço da câmera com IA.
        """
        super().__init__()
        
        self.latest_objects = []
        self._lock = threading.Lock() # Usamos um lock para thread-safety ao acessar latest_objects
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

            # --- 2. Inicialização e Configuração da Picamera2 ---
            self.picam2 = Picamera2(self.imx500.camera_num)
            config = self.picam2.create_preview_configuration(
                main={"size": (640, 480)},
                raw=self.picam2.sensor_modes[self.imx500.mode_index]
            )
            self.picam2.configure(config)
            
            # --- 3. Anexa este objeto como o hook de pós-processamento ---
            self.picam2.start_post_processing(self)
            
            self.imx500.show_network_fw_progress_bar()
            self.picam2.start()
            print("[AI Cam] Câmera iniciada com o framework de Pós-Processamento.")

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

    def process(self, request):
        """
        Este método é chamado automaticamente pela Picamera2 para cada frame
        e contém a lógica de decodificação dos resultados da IA.
        """
        metadata = request.capture_metadata()
        
        np_outputs = self.imx500.get_outputs(metadata, add_batch=True)
        if np_outputs is None:
            return

        boxes, scores, classes = \
            postprocess_nanodet_detection(outputs=np_outputs[0], conf=self.threshold, iou_thres=0.70)[0]
        
        detected_labels = []
        labels = self.intrinsics.labels
        for score, category_index in zip(scores, classes):
            if score > self.threshold:
                label = labels[int(category_index)]
                if label and label != "-":
                    detected_labels.append(label)
        
        with self._lock:
            self.latest_objects = detected_labels

    def get_latest_objects(self):
        """Retorna a lista mais recente de objetos detectados (thread-safe)."""
        with self._lock:
            return list(self.latest_objects)

    def stop(self):
        """Para a câmera e o framework de pós-processamento."""
        if self.picam2:
            try:
                self.picam2.stop_post_processing()
                self.picam2.stop()
                print("[AI Cam] Câmera parada com sucesso.")
            except Exception as e:
                print(f"[AI Cam] Erro ao parar a câmera: {e}")

# --- Instância Única do Serviço da Câmera ---
ai_camera_service = AICameraService()

# --- Funções de Interface Pública para o Vision Service ---

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