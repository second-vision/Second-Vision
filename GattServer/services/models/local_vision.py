# models/local_vision.py
from ultralytics import YOLO
from paddleocr import PaddleOCR
from spellchecker import SpellChecker
from config import ALLOWED_OBJECTS, TRANSLATION_DICT, MIN_WORD_COUNT_FOR_MEANINGFUL_TEXT, MIN_AVG_WORD_LENGTH

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
        extracted_phrases: Uma lista de strings, onde cada string é uma frase significativa
                   detectada e processada. Retorna uma lista vazia se nada for encontrado.
    """
    extracted_phrases = []

    try:
        ocr_result_list = ocr_model.ocr(frame, cls=True)
        if not ocr_result_list or not ocr_result_list[0]:
            return[]

        paddle_results = ocr_result_list[0]

        for line_data in paddle_results:

            if isinstance(line_data, list) and len(line_data) == 2:

                text_details = line_data[1]

                if isinstance(text_details, (tuple, list)) and len(text_details) == 2:

                    text_from_ocr, confidence = text_details

                    if isinstance(text_from_ocr, str):

                        words_in_line = text_from_ocr.split()

                        if perform_correction:
                           corrected_words = [spell_checker.correction(w) or w for w in words_in_line]
                        else:
                           corrected_words = words_in_line

                        meaningful_words = is_text_meaningful(corrected_words)
                        if meaningful_words:
                            extracted_phrases.append(" ".join(meaningful_words))
    except Exception as e:
        print(f"[Local OCR] Erro inesperado ao processar resultado do Paddle: {e}")
        return []


    return extracted_phrases
