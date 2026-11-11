# TODO — Benefícios Formis

## 1. Gestão de empresas e colaboradores
- Cadastrar e editar empresas Formis Instrumentos de Medicina Ltda. e Instrulabor Licitação Ltda.
- Cadastrar, editar e excluir colaboradores vinculados a uma empresa, com nome e cargo.
- Buscar por nome ou cargo e filtrar por empresa.

## 2. Benefícios e indicadores
- Registrar VA e VR com valor e estado Sim/Não; cesta com estado Sim/Não/45+45.
- Exibir os estados e valores cadastrados sem inventar dados da imagem.
- Consultar totais de valores VA/VR e quantitativos de colaboradores e cestas.

## 3. Web local em arquitetura MVC
- Interface responsiva em português brasileiro com React.
- API REST Node/Express separada entre models, controllers e routes.
- Persistir empresas e colaboradores em MongoDB via `MONGODB_URI`.
- Fornecer `.env.example`, instruções, erros claros e validações básicas.

## 4. Desktop Electron para Windows
- Empacotar como aplicativo Windows sem incluir credenciais.
- Usar `contextIsolation`, preload/contextBridge e `nodeIntegration` desativado.
- Documentar que o MongoDB precisa estar disponível e configurado no computador.

## 5. Limites e documentação
- Explicar dependências, MongoDB, configuração, desenvolvimento e build.
- Manter o MVP sem publicação, sincronização Manus, importação/exportação Excel, login multiusuário ou cálculo de folha/pagamentos.

## Estado de validação — 11/11/2026

- Frontend: `npm.cmd run build` concluído com sucesso; Vite gerou `client/dist`.
- API MVC: todos os módulos passaram na verificação de sintaxe e controllers/rotas foram importados como ESM.
- Desktop: Electron `v37.10.3` iniciou; instalador NSIS `dist-electron/Beneficios-Formis-Setup-1.0.2.exe` (aprox. 98 MB) foi gerado com `win-unpacked` e `app.asar`.
- Ícone: PNG-mestre de 512×512 e ICO de sete tamanhos (16–256 px) gerados e validados; configurados no executável, janela, instalador e atalhos. O executável da build contém o recurso de ícone.
- Renderer: `client/dist/index.html` agora referencia `./assets/...`; HTML, JS e CSS relativos foram verificados dentro do `app.asar` 1.0.2. Isso corrige os caminhos absolutos que deixavam a janela branca em `file://`.
- MongoDB: MSI oficial 8.0.34 teve assinatura Authenticode válida (`MongoDB, Inc.`) e foi instalado como serviço `MongoDB`, com início automático. O serviço escuta somente em `127.0.0.1:27017`.
- Persistência/conexão: Mongoose conectou a `beneficios_formis`; a build desktop respondeu `/api/health` com `database: connected`. Smoke test da API retornou `200` para saúde, empresas (2 registros padrão), colaboradores (0) e resumo.
- Configuração: `.env` de usuário do aplicativo criado em `%APPDATA%\beneficios-formis\.env` com URI local padrão. Nenhum cadastro de colaborador ou valor foi importado da imagem.
- Ressalva: o PC usa Windows 10 (build 19045), não listado como suportado pela documentação do MongoDB 8.0. A instalação e os testes funcionaram, mas essa combinação permanece sem suporte oficial; o usuário autorizou prosseguir best effort.
