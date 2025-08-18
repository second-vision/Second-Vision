# api/cloud_vision.py
import requests
import cv2
import time
from config import OBJECT_API_ENDPOINT, OBJECT_API_KEY, TEXT_API_ENDPOINT, TEXT_API_KEY


def _parse_object_api_response(result_json, threshold=0.75):
    """
    Analisa a resposta da API, filtra por probabilidade e retorna os nomes
    dos objetos, que já são esperados em português.

    Args:
        result_json (dict): Resultado da análise da imagem (Custom Vision).
        threshold (float): Limite de probabilidade para filtrar (padrão: 0.75).

    Returns:
        list: Uma lista de strings com os nomes dos objetos em português.
              Ex: ['carro', 'pessoa', 'semáforo']
    """
    detected_objects_in_portuguese = []
    try:
        predictions = result_json.get("predictions", [])
        
        for pred in predictions:
            # 1. Filtra pela probabilidade
            if pred.get("probability", 0) >= threshold:
                tag_name = pred.get("tagName") # Ex: "carro"
                
                # 2. Adiciona diretamente à lista, sem traduzir ou filtrar por nome
                if tag_name:
                    detected_objects_in_portuguese.append(tag_name)
        
        print(f"[API Parser] Objetos da API (>=75%): {detected_objects_in_portuguese}")
        return detected_objects_in_portuguese
        
    except Exception as e:
        print(f"[API Parser] Erro ao analisar resposta de objetos: {e}")
        return []

def _parse_text_api_response(result_json):
    """
    Adapta a lógica de 'exibir_texto_detectado' para retornar uma estrutura de dados
    compatível com o que o resto do sistema espera (formato similar ao PaddleOCR).

    Args:
        result_json (dict): Resultado da análise da imagem (OCR).

    Returns:
        list: Uma lista de "linhas", onde cada linha tem um formato similar ao do PaddleOCR.
              Ex: [ [bbox, [texto, confianca]], [bbox, [texto, confianca]], ... ]
    """
    ocr_like_results = []
    try:
        # Usa a mesma lógica de navegação da sua função
        for read_result in result_json.get("analyzeResult", {}).get("readResults", []):
            for line in read_result.get("lines", []):
                text = line.get("text")
                bbox = line.get("boundingBox") # A API fornece o bounding box da linha
                
                if text and bbox:
                    # Construímos a estrutura que imita a do PaddleOCR:
                    # [ [bounding_box], [texto, confiança] ]
                    # A API Read não dá confiança por linha, então usamos um valor fixo alto.
                    confidence = 0.85 
                    paddle_like_line = [bbox, [text, confidence]]
                    ocr_like_results.append(paddle_like_line)
                    
        print(f"[API Parser] Linhas de texto extraídas da API: {len(ocr_like_results)}")
        return ocr_like_results

    except Exception as e:
        print(f"[API Parser] Erro ao analisar resposta de texto: {e}")
        return [] # Retorna uma lista vazia em caso de erro


def process_frame(frame, is_object_detection):
    """
    Função principal para processar um frame usando a API da nuvem.
    Seleciona o endpoint e a chave corretos com base no tipo de detecção.
    """
    if is_object_detection:
        endpoint = OBJECT_API_ENDPOINT
        key = OBJECT_API_KEY
    else:
        endpoint = TEXT_API_ENDPOINT
        key = TEXT_API_KEY
    
    # Esta função interna contém a lógica de 'requests' que você já tinha
    return _send_image_to_api(endpoint, key, frame, is_object_detection)

def _send_image_to_api(endpoint, subscription_key, frame, is_object_detection):
    """
    Envia um frame de imagem para o endpoint da API e retorna o resultado processado e formatado.
    Lida com APIs síncronas (objetos) e assíncronas (texto).
    """
    if not endpoint or not subscription_key:
        print("[API] ERRO: Endpoint ou chave da API não definidos no arquivo .env")
        return None

    success, encoded_image = cv2.imencode('.jpg', frame)
    if not success:
        print("[API] Erro ao codificar imagem para envio.")
        return None
    
    image_data = encoded_image.tobytes()

    headers = {
        ('Prediction-Key' if is_object_detection else 'Ocp-Apim-Subscription-Key'): subscription_key,
         'Content-Type': 'application/octet-stream'
    }

    try:
        # --- PASSO 1: Enviar o pedido inicial ---
        response = requests.post(endpoint, headers=headers, data=image_data, timeout=10)
        response.raise_for_status()

        # --- CAMINHO A: API SÍNCRONA (ex: detecção de objetos) ---
        if response.status_code == 200:
            print("[API] Análise síncrona concluída.")
            return _parse_object_api_response(response.json())

        # --- CAMINHO B: API ASSÍNCRONA (ex: OCR de texto) ---
        elif response.status_code == 202:
            print("[API] Análise assíncrona iniciada...")
            operation_url = response.headers.get("Operation-Location")
            if not operation_url:
                print("[API] ERRO: A API retornou 202 mas não forneceu um Operation-Location.")
                return None

            # --- PASSO 2: Polling do resultado ---
            analysis_result = None
            for _ in range(10): # Tenta por no máximo ~10 segundos
                result_response = requests.get(operation_url, headers=headers, timeout=10)
                result_response.raise_for_status()
                result_json = result_response.json()
                status = result_json.get("status", "")
                
                if status == "succeeded":
                    print("[API] Análise assíncrona concluída com sucesso.")
                    analysis_result = result_json
                    break # Sai do loop de polling
                elif status == "failed":
                    print("[API] ERRO: Análise assíncrona falhou.")
                    return None
                
                time.sleep(1) # Espera 1 segundo antes de tentar novamente
            
            if analysis_result:
                return _parse_text_api_response(analysis_result)
            else:
                print("[API] ERRO: Timeout esperando pelo resultado da análise assíncrona.")
                return None
        
        else:
            print(f"[API] ERRO: Status code inesperado recebido: {response.status_code}")
            return None

    except requests.RequestException as e:
        print(f"[API] Erro de rede ao enviar a imagem: {e}")
        return None