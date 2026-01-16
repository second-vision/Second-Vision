# Second Vision - Servidor GATT V5

![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)

Este repositório contém o código-fonte do servidor GATT V5 para o projeto **Second Vision**, um assistente de visão computacional para deficientes visuais. O servidor roda em um Raspberry Pi, realiza processamento de imagem localmente (offline) ou na nuvem (online), e se comunica com um aplicativo cliente via Bluetooth Low Energy (BLE).

## 📋 Principais Funcionalidades

*   **Servidor GATT BLE:** Expõe serviços e características Bluetooth para comunicação com o aplicativo cliente.
*   **Processamento Híbrido de IA:**
    *   **Modo Offline:** Utiliza modelos locais (YOLO para objetos, PaddleOCR para texto) para funcionar sem conexão com a internet.
    *   **Modo Online:** Utiliza APIs de nuvem para detecção de objetos e OCR com maior precisão e variedade quando uma conexão de internet está disponível.
*   **Gerenciamento de Conexão:** O Wi-Fi do dispositivo pode ser totalmente controlado pelo aplicativo cliente, incluindo conexão a novas redes e desconexão.
*   **Monitoramento de Hardware:** Expõe o status da bateria (porcentagem e tempo restante estimado) via BLE.
*   **Arquitetura Modular:** O código é estruturado em pacotes com responsabilidades únicas (GATT, serviços de IA, hardware, threads), seguindo boas práticas de engenharia de software.
*   **Diferenciação de Hardware:** O servidor pode ser configurado para diferentes versões de hardware (ex: Raspberry Pi 5 com modo offline e online híbridos, Raspberry Pi Zero apenas com modo online híbrido e offline somente para objetos).

## 🛠️ Requisitos de Hardware

1.  **Plataforma:** Raspberry Pi (Testado no RPi 5, adaptável para RPi Zero).
2.  **Câmera:** Módulo de Câmera compatível com o Raspberry Pi.
3.  **Energia:** UPS HAT (Testado com Waveshare UPS HAT B com sensor INA219) para monitoramento de bateria e operação portátil.

## ⚙️ Guia de Instalação Completo (Raspberry Pi)

Siga os passos abaixo para configurar o ambiente do servidor em um sistema operacional baseado em Debian, como o Ubuntu Server.

*OBS: O Raspberry Pi OS pode não ser uma boa escolha por provável conflito na intalação da dependência Pytorch*

### 1. Pré-requisitos: Configuração do Sistema, BlueZ e NetworkManager

O sistema operacional já inclui uma versão recente do BlueZ (serviço de Bluetooth). Porém, em alguns casos, pode ser necessário instalar manualmente o pacote completo do **BlueZ** e também o **NetworkManager**, já que o Netplan será configurado para utilizá-lo.

**a. Primeiro atualize a lista de repositórios de software, depois faça uma atualização completa.:**
```bash
sudo apt update && sudo apt full-upgrade
```

**b. Instalar BlueZ, NetworkManager:**
```bash
sudo apt-get update
sudo apt-get install -y bluez bluez-tools bluetooth network-manager
```

**c. Habilitar Funcionalidades Experimentais do BlueZ:**
Abra o arquivo de serviço do Bluetooth para edição.

```bash
sudo nano /lib/systemd/system/bluetooth.service
```
Localize a linha que começa com `ExecStart=` e certifique-se de que a flag `--experimental` está presente no final.

*Linha de Exemplo:*
`ExecStart=/usr/lib/bluetooth/bluetoothd --experimental`

Se você precisar adicioná-la, salve o arquivo e recarregue os serviços:
```bash
sudo systemctl daemon-reload
sudo systemctl restart bluetooth.service
```

**d. Instalar Dependências de Sistema:**
Instale os pacotes essenciais para a execução de scripts Python que interagem com o hardware e o sistema.

```bash
sudo apt-get update
sudo apt-get install -y \
  python3-pip python3-venv python3-dbus python3-gi python3-smbus i2c-tools \
  libdbus-1-dev libdbus-glib-1-dev python3-dev build-essential \
  libgirepository1.0-dev gir1.2-glib-2.0
```

### 2. Configuração de Rede (Netplan)

Para que o `NetworkManager` controle as interfaces de rede, o Netplan precisa ser configurado para usá-lo como renderizador.

**a. Crie, edite ou cole o arquivo de configuração do Netplan:**
```bash
sudo nano /etc/netplan/01-netcfg.yaml
```

**b. Insira o seguinte conteúdo:**
```yaml
# /etc/netplan/01-netcfg.yaml
network:
  version: 2
  renderer: NetworkManager
```

**c. Aplique a nova configuração de rede:**
```bash
sudo netplan apply
```
*OBS: Caso a internet pare de funcionar após esse processo, reinicie o sistema operacional.*

### 3. Estrutura de Diretórios e Ambiente Virtual

Este projeto utiliza o ambiente virtual localizado em `/home/second`.

**a. Crie os diretórios e o ambiente virtual:**
```bash
# Crie o diretório do projeto
mkdir -p /home/second/GattServerV5

# Crie o ambiente virtual no diretório /home/second
cd /home/second
python3 -m venv venv --system-site-packages
```

**b. Clone o repositório do projeto:**
```bash
cd /home/second/GattServerV5
git clone --branch GattServerV5 --single-branch https://github.com/second-vision/Second-Vision.git . 
# O ponto '.' no final clona o conteúdo na pasta atual
```

### 4. Dependências do Python

Instale todas as bibliotecas Python necessárias usando o arquivo `requirements.txt`.

**a. Ative o ambiente virtual:**
```bash
source /home/second/venv/bin/activate
```

**b. Navegue para a pasta do projeto e instale as dependências:**
*(Esta etapa assume que você já está no ambiente virtual ativado)*
```bash
cd /home/second/GattServerV5
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Variáveis de Ambiente

As chaves de API e a versão do dispositivo são gerenciadas por um arquivo `.env`.

**a. Copie o arquivo de exemplo e edite-o:**
```bash
cp config/.env.example config/.env
nano config/.env
```

**b. Preencha as seguintes variáveis:**
```env
# config/.env

# Endpoints e Chaves para a API de Visão na Nuvem
IMAGE_ENDPOINT=URL_DA_SUA_API_DE_OBJETOS
IMAGE_SUBSCRIPTION_KEY=SUA_CHAVE_SECRETA_DE_OBJETOS
OCR_ENDPOINT=URL_DA_SUA_API_DE_TEXTO
OCR_SUBSCRIPTION_KEY=SUA_CHAVE_SECRETA_DE_TEXTO

```

### 6. Configuração do Serviço (Systemd)

O serviço `systemd` gerencia a execução do servidor, garantindo que ele inicie com o sistema e seja reiniciado em caso de falha.

**a. Crie ou cole o script de inicialização `start_gatt_server.sh`:**
```bash
sudo nano /home/second/start_gatt_server.sh
```
Cole o seguinte conteúdo:
```bash
#!/bin/bash
# Navega para /home/second para encontrar o venv
cd /home/second

# Ativa o ambiente virtual
source venv/bin/activate

# Navega para o diretório do projeto
cd GattServerV5

# Executa o servidor principal com saída sem buffer para logs em tempo real
python3 -u main.py
```

**b. Torne o script executável:**
```bash
sudo chmod +x /home/second/start_gatt_server.sh
```

**c. Crie ou cole o arquivo de serviço `gatt_server.service`:**
```bash
sudo nano /etc/systemd/system/gatt_server.service
```
Cole o seguinte conteúdo:
```ini
[Unit]
Description=Servidor GATT Second Vision
# Garante que o serviço só inicie após a rede e o bluetooth estarem prontos
Wants=bluetooth.service
After=bluetooth.service network.target

[Service]
Type=simple
ExecStart=/home/second/start_gatt_server.sh
WorkingDirectory=/home/second/GattServerV5
Restart=on-failure
RestartSec=5
# O serviço precisa de privilégios de root para gerenciar a rede com nmcli
User=root
Group=root

[Install]
WantedBy=multi-user.target
```

### ⚠️ Observação Importante: Bloqueio de Bluetooth (rfkill)

Em alguns casos, especialmente após reinicializações ou instalações limpas do sistema, o **Bluetooth pode iniciar bloqueado via `rfkill`**, o que impede o registro de anúncios BLE e faz o servidor GATT falhar silenciosamente ou apresentar erros como:

org.bluez.Error.Failed: Failed to register advertisement

Para verificar o estado do Bluetooth, utilize:
rfkill list

Se o dispositivo Bluetooth (`hci0`) aparecer como **Soft blocked: yes**, é necessário desbloqueá-lo manualmente:

```bash
sudo rfkill unblock bluetooth
sudo systemctl restart bluetooth
```

Após isso, confirme que o Bluetooth está ativo:
bluetoothctl
power on

IMPORTANTE:
Caso o Bluetooth esteja bloqueado no momento da inicialização, o serviço gatt_server.service não conseguirá anunciar o dispositivo, mesmo que o serviço esteja em execução.

(Opcional) Garantir desbloqueio automático no boot

Para garantir que o Bluetooth nunca inicie bloqueado, recomenda-se criar um serviço simples para executar o desbloqueio no boot ou adicionar o comando rfkill unblock bluetooth a um script de inicialização anterior ao serviço GATT.

**d. Habilite e inicie o serviço:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable gatt_server.service
sudo systemctl start gatt_server.service
```

## 🚀 Uso

O servidor foi projetado para rodar como um serviço de sistema.

*   **Verificar Status:**
    ```bash
    sudo systemctl status gatt_server.service
    ```

*   **Ver Logs em Tempo Real:**
    ```bash
    journalctl -fu gatt_server.service
    ```

*   **Reiniciar o Serviço:**
    ```bash
    sudo systemctl restart gatt_server.service
    ```

## 📂 Estrutura do Projeto

O código-fonte é organizado em pacotes com responsabilidades bem definidas:

```
/GattServerV5
├── main.py                 # Ponto de entrada principal da aplicação
├── config.py               # Configurações globais, constantes e chaves de API
├── requirements.txt        # Dependências do Python
|
├── /bluez/                 # Módulos de baixo nível para interagir com BlueZ
├── /config/                # Arquivos de configuração como .env
├── /gatt/                  # Estrutura do servidor GATT (Aplicação, Serviço, Características)
│   └── /characteristics/   # Implementação de cada característica BLE
├── /hardware/              # Drivers para componentes de hardware (ex: INA219)
├── /services/              # Lógica de negócio principal
│   ├── vision_service.py   # Orquestrador do loop da câmera
│   ├── /api/               # Módulos para comunicação com APIs de nuvem
│   ├── /models/            # Módulos para modelos de IA locais (YOLO, PaddleOCR)
│   └── /stabilizers/       # Lógica para estabilização de detecções
├── /threads/               # Módulos que definem os loops executados em threads
└── /utils/                 # Funções de ajuda e utilitários
```
