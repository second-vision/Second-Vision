FROM node:22.14.0

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

RUN npm update

# Copie o restante dos arquivos da aplicação
COPY . .

# Exponha a porta padrão do Expo
EXPOSE 19000 19001 19002

# Comando para rodar a aplicação
CMD ["npm", "start"]