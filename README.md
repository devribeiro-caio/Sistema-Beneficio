# Benefícios Formis

Sistema local para organizar VA, VR e cesta das equipes Formis e Instrulabor. Usa React, Node.js/Express em arquitetura MVC, MongoDB e Electron para desktop Windows.

## Requisitos e configuração

Node.js 20+ e uma instância MongoDB acessível são necessários. Neste computador foi instalado o MongoDB Community Server 8.0.34 como serviço do Windows, com início automático e escuta local em `127.0.0.1:27017`. A conexão Mongoose e a API foram testadas com sucesso.

**Compatibilidade:** o computador está em Windows 10 (build 19045). A documentação oficial do MongoDB 8.0 lista Windows 11 e Windows Server 2022, não Windows 10; por isso, a execução neste computador é best effort e não tem suporte oficial. Consulte [requisitos oficiais do MongoDB 8.0 para Windows](https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-windows/).

No PowerShell, use `npm.cmd` (em vez de `npm`, caso a política bloqueie scripts). Na raiz do projeto, as dependências já estão instaladas; para restaurá-las, use `npm.cmd install` e `npm.cmd install --prefix client`. Para desenvolvimento, o arquivo `.env` local aponta para `mongodb://127.0.0.1:27017/beneficios_formis`. Ajuste `MONGODB_URI` se usar outra instância.

Para abrir a aplicação desktop e os serviços locais: `npm.cmd run dev`. A interface web fica em `http://127.0.0.1:5173`, com proxy para a API em `http://127.0.0.1:4317/api`. Apenas API: `npm.cmd run dev:server`. Apenas interface: `npm.cmd run dev:client` em outro terminal.

O serviço instalado chama-se `MongoDB` e inicia automaticamente. Para conferir: `Get-Service MongoDB`. Se estiver parado, em um PowerShell com privilégios de administrador use `Start-Service MongoDB`.

## Aplicativo instalado e empacotamento

O instalador 1.0.2 com ícone personalizado está em `dist-electron/Beneficios-Formis-Setup-1.0.2.exe`. O símbolo da prancheta com confirmação aparece na janela, no executável e nos atalhos. A correção anterior também define `base: './'` no Vite para o Electron carregar a interface por `file://`. Para gerar novamente, use `npm.cmd run desktop:pack`; `npm.cmd run desktop:dir` cria a pasta desempacotada sem instalador. O resultado fica em `dist-electron/`.

No aplicativo instalado, o banco continua sendo um serviço externo ao pacote. O app usa `MONGODB_URI` no arquivo `.env` da pasta de dados do Electron (`app.getPath('userData')`). Neste computador, esse arquivo foi criado em `%APPDATA%\beneficios-formis\.env` com a URI local padrão. Credenciais não são embutidas no instalador. Para outra instância MongoDB, altere essa URI e reabra o aplicativo.

## Estrutura

- `client/src/`: interface React.
- `server/src/models/`: schemas Mongoose; `controllers/`: regras CRUD e indicadores; `routes/`: API REST; `config/`: conexão com MongoDB.
- `electron/`: processo desktop e preload seguro.

Os dados ficam na instância MongoDB configurada, que nesta instalação está vinculada somente ao loopback local. Não há publicação, sincronização Manus, autenticação multiusuário, importação/exportação Excel ou cálculo de folha nesta versão.
