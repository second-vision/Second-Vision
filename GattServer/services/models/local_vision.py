# models/local_vision.py
from ultralytics import YOLO
from paddleocr import PaddleOCR
from spellchecker import SpellChecker
from config import ALLOWED_OBJECTS, TRANSLATION_DICT

yolo_model = YOLO("yolov8n.pt")
ocr_model = PaddleOCR(use_angle_cls=True, lang="pt")
spell_checker = SpellChecker(language='pt')

def is_text_meaningful(text_list):
    if not text_list:
        return []
    full_text = " ".join(text_list)
    words = full_text.split()
    if not words:
        return []
    if len(words) < MIN_WORD_COUNT_FOR_MEANINGFUL_TEXT:
        # print(f"Texto descartado (poucas palavras): '{full_text}'")
        return []
    avg_word_len = sum(len(word) for word in words) / len(words)
    if avg_word_len < MIN_AVG_WORD_LENGTH:
        # print(f"Texto descartado (palavras muito curtas/avg): '{full_text}'")
        return []
    return text_list

def detect_objects_local(frame):
    """Executa o YOLO no frame e retorna uma lista de objetos traduzidos."""
    results = yolo_model(frame, verbose=False)
    detected_and_translated = []
    for r in results:
        for c in r.boxes.cls:
            obj_name = r.names[int(c)]
            if obj_name in ALLOWED_OBJECTS:
                translated = TRANSLATION_DICT.get(obj_name, obj_name)
                detected_and_translated.append(translated)
    return detected_and_translated

def detect_text_local(frame, perform_correction=True):
    """
    Executa o modelo PaddleOCR localmente em um frame, processa o resultado
    (correção ortográfica, filtragem) e retorna uma lista de frases detectadas.

    Args:
        frame: O frame da imagem capturada pela câmera (formato OpenCV).
        perform_correction (bool): Se a correção ortográfica deve ser aplicada.

    Returns:
        list[str]: Uma lista de strings, onde cada string é uma frase significativa
                   detectada e processada. Retorna uma lista vazia se nada for encontrado.
    """
    extracted_phrases = []

    paddle_results = ocr_model.ocr(frame, cls=True)[0]

    if paddle_results:
        for line_data in paddle_results:
            if line_data:
                words_in_line = []
                
                for word_info in line_data:
                    if word_info and len(word_info) > 1 and word_info[1] and len(word_info[1]) > 0:
                        text_from_ocr = word_info[1][0]
                        
                        if perform_correction:
                            corrected_word = spell_checker.correction(text_from_ocr) or text_from_ocr
                            words_in_line.append(corrected_word)
                        else:
                            words_in_line.append(text_from_ocr)
                
                meaningful_words = is_text_meaningful(words_in_line)
                
                if meaningful_words:
                    extracted_phrases.append(" ".join(meaningful_words))
    
    return extracted_phrases