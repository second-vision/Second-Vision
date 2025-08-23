# stabilizers/vision_stabilizers.py
from collections import deque
from fuzzywuzzy import fuzz
from config import MIN_TEXT_SIMILARITY_RATIO


class ObjectTracker:
    def __init__(self, window_size=5, stability_threshold_ratio=0.6):
        """
        window_size: Número de frames recentes a considerar para estabilidade.
        stability_threshold_ratio: Proporção de frames em window_size em que um objeto
                                   deve estar presente para ser considerado estável (ex: 0.6 para 60%).
        """
        self.history = deque(maxlen=window_size)
        self.window_size = window_size
        # Limiar de contagem para estabilidade: objeto precisa estar em X frames da janela
        self.stability_count_threshold = int(window_size * stability_threshold_ratio)
        if self.stability_count_threshold == 0 and window_size > 0:
            self.stability_count_threshold = 1 # Pelo menos 1 se a proporção for muito baixa mas window > 0

        self.currently_stable_objects = set() # Objetos atualmente considerados estáveis

    def update(self, current_frame_detections_list):
        """
        Atualiza o histórico com as detecções do frame atual e recalcula os objetos estáveis.
        current_frame_detections_list: Uma lista de strings dos objetos detectados no frame.
        """
        self.history.append(set(current_frame_detections_list))

        new_stable_objects = set()
        if not self.history:
            self.currently_stable_objects = new_stable_objects
            return

        possible_objects = set()
        for frame_set in self.history:
            possible_objects.update(frame_set)

        for obj_name in possible_objects:
            count = 0
            for frame_set in self.history:
                if obj_name in frame_set:
                    count += 1
            if count >= self.stability_count_threshold:
                new_stable_objects.add(obj_name)
        
        self.currently_stable_objects = new_stable_objects

    def get_stable_objects(self):
        """
        Retorna a lista de objetos atualmente considerados estáveis.
        """
        return list(self.currently_stable_objects)


class TextStabilizer:
    def __init__(self, similarity_threshold=MIN_TEXT_SIMILARITY_RATIO, stability_count=3):
        self.similarity_threshold = similarity_threshold  # Limiar para considerar textos "iguais"
        self.stability_count = stability_count          # Quantas vezes um candidato precisa ser visto
        
        self.current_candidate_text = ""      # O texto que está atualmente sendo "observado"
        self.current_candidate_counter = 0    # Contador para o current_candidate_text
        self.last_effectively_sent_text = None # O texto conceitual que foi enviado por último (pode ter pequenas variações)
        
    

    def update(self, new_text_raw):

        new_text_cleaned = " ".join(new_text_raw.split())

        if new_text_cleaned: # Se há um novo texto detectado
            # Compara o novo texto com o candidato atual
            if self.current_candidate_text and \
               fuzz.ratio(new_text_cleaned.lower(), self.current_candidate_text.lower()) >= self.similarity_threshold:
                # O novo texto é similar ao candidato atual, então incrementa o contador do candidato
                self.current_candidate_counter += 1
              
            else:
                # O novo texto é DIFERENTE do candidato atual (ou não havia candidato)
                # O novo texto se torna o novo candidato
                self.current_candidate_text = new_text_cleaned
                self.current_candidate_counter = 1
               
        else: # Novo texto detectado é vazio
            # Se havia um candidato, ele "desaparece"
            if self.current_candidate_text:
               
                self.current_candidate_text = ""
                self.current_candidate_counter = 0
           
                pass

        # --- Lógica de Decisão de Envio ---
        text_to_output = None

        if self.current_candidate_text and self.current_candidate_counter >= self.stability_count:
            # O candidato atual atingiu a contagem de estabilidade
           

            # Agora, verifica se este candidato estável é conceitualmente DIFERENTE do último texto enviado
            if self.last_effectively_sent_text is None or \
               fuzz.ratio(self.current_candidate_text.lower(), self.last_effectively_sent_text.lower()) < self.similarity_threshold:
                # É o primeiro envio OU o candidato estável é suficientemente diferente do último enviado
                text_to_output = self.current_candidate_text
                self.last_effectively_sent_text = self.current_candidate_text # Armazena a forma EXATA que foi enviada
               
                pass
        elif not self.current_candidate_text: # Não há candidato atual (ex: texto desapareceu da cena)
            if self.last_effectively_sent_text is not None and self.last_effectively_sent_text != "":
                # Havia um texto enviado anteriormente, e agora não há mais nada. Envia string vazia.
               
                text_to_output = ""
                self.last_effectively_sent_text = "" #
            
                pass
       
            pass
            
        return text_to_output
