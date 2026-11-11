# Plano — Benefícios Formis

## Objetivo
Construir um sistema local para organizar benefícios dos colaboradores da Formis Instrumentos de Medicina Ltda. e da Instrulabor Licitação Ltda., inspirado na planilha fornecida. O MVP permite cadastrar e editar empresas e colaboradores, registrar cargo e VA/VR/cesta, filtrar por empresa, consultar totais e persistir dados em MongoDB. A aplicação terá interface React responsiva e empacotamento desktop Electron para Windows. Não serão inventados valores nem importados automaticamente os registros da imagem.

## Arquitetura
React + Vite no frontend; Node.js + Express na API REST, organizada em Models, Controllers e Routes com Mongoose; MongoDB configurado por `MONGODB_URI`; Electron como desktop wrapper, com preload/contextBridge e `nodeIntegration` desativado. Credenciais ficam fora do código em `.env`; a documentação explica que o MongoDB deve estar acessível. O desktop empacotado carrega recursos compilados e inicia a API local.

## Estrutura
`client/` contém interface, componentes e chamadas API; `server/src/models/` define Empresa e Colaborador, `controllers/` concentra operações e indicadores, `routes/` expõe a API e `config/` conecta MongoDB; `electron/` contém processo principal e preload; a raiz mantém scripts, `.env.example`, documentação, este plano e `TODO.md`.

## Design
Direções consideradas: painel operacional inspirado na planilha com azul e âmbar (0,06); painel corporativo escuro (0,03); interface editorial monocromática (0,02). Escolha: painel operacional contemporâneo que conserva azul para Formis e âmbar para Instrulabor, com estados verdes/vermelhos, fundo neutro e dados tabulares legíveis. Navegação lateral compacta, resumos no topo, filtros próximos da tabela e edição contextual. Interações diretas, confirmações claras, transições discretas e responsividade. Tipografia sans-serif de interface. Marca textual “Benefícios Formis”, com símbolo geométrico de duas colunas.

## Limites
MVP local, sem serviços Manus, publicação, login multiusuário, sincronização, importação Excel, exportação Excel ou cálculo de folha/pagamentos. MongoDB não acompanha o pacote e deve estar instalado/acessível e configurado pelo operador.