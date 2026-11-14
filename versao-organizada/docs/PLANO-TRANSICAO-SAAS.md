# Plano de transição para SaaS — Cadastro de Peças

Data: 14/11/2026. Base: auditoria de organização do código (36 arquivos JS em `src/js/`, 756 KB, montados num só bloco por `tools/montar.py`).

## Princípios

1. **O app não para de funcionar em nenhuma etapa.** Cada etapa termina com a suíte inteira verde (`python tests/run_all.py`, com `CP_BACKUP` apontando para um backup real) e o HTML único continua abrindo offline.
2. **Refatorar antes de hospedar.** Nenhuma etapa de servidor começa antes de o núcleo de cálculo estar isolado e coberto por testes de unidade.
3. **Comportamento idêntico até a etapa 6.** As etapas 1 a 5 não mudam o que o usuário vê; só reorganizam o código. Isso permite validar com o backup real a cada passo.
4. **O formato do backup é o contrato.** O JSON de backup (`app`, `tipo`, `v`, `em`, `config`, `lanc`, `form`, `roms`, `fotos`, `rascunho`, `rel`, `tabs`, `autor`) vira o formato de importação do SaaS. Nenhuma etapa pode quebrar a leitura de backups antigos.

## Visão geral

| Etapa | Entrega | Risco | Depende de |
|---|---|---|---|
| 0. Linha de base | Congelar versão, medir, arquivar ruído | Baixo | — |
| 1. Ferramentas e higiene | `package.json`, lint, formatação, `vendor/` | Baixo | 0 |
| 2. Núcleo puro | Módulo de cálculo sem DOM, sem estado global, com testes de unidade | Médio | 1 |
| 3. Camada de armazenamento | Interface `store` com adaptador local | Médio | 2 |
| 4. Estado explícito | Objeto de estado único e ações nomeadas | Alto | 3 |
| 5. Interface em módulos | Módulos ES: eventos, templates, telas | Médio | 4 |
| 6. Servidor | Contas, organizações, API, sincronização, fotos | Alto | 3 e 4 |
| 7. Migração de dados e lançamento | Importar backups, piloto, cobrança | Médio | 6 |

A etapa 6 pode começar em paralelo à 5 depois que 3 e 4 estiverem prontas.

---

## Etapa 0 — Linha de base

**Objetivo:** ter um ponto de retorno e saber o que existe.

- Comitar e enviar o estado atual (hoje há commits locais não enviados).
- Marcar a versão: tag `v-pre-saas`.
- Arquivar do repositório: HTMLs antigos da raiz (`Cadastro_de_Pecas_-_abrir_no_Chrome_corrigido_parte2.html`, `..._em_revisao_parte3_4.html`), `publicar-netlify.zip`, `publicar-netlify-atualizado.zip`, `revisao-organizada/`, `auditoria-ui-temporario/`, `suite-auditoria-atual.log`. Mover para uma pasta `arquivo/` fora do Git (já está no `.gitignore` em parte).
- Decidir o destino da árvore duplicada na pasta acima (`tests/`, `tools/`, `lib/`, `demo-netlify/`): mover ou apagar, mantendo uma só fonte de verdade.
- Registrar métricas atuais: 161 testes, 756 KB de JS, 53 globais mutáveis, 541 funções, 88 usos de `localStorage` e 84 de IndexedDB.

**Pronto quando:** repositório limpo, tag criada, métricas gravadas neste documento.

## Etapa 1 — Ferramentas e higiene

**Objetivo:** ganhar rede de segurança estática sem mexer no comportamento.

- Criar `package.json` com scripts `build`, `test`, `lint`, `format`.
- ESLint com regras mínimas (`no-undef`, `no-unused-vars`, `no-shadow`) e Prettier. Rodar em modo que só **aponta**, sem reformatar tudo de uma vez: aplicar formatação arquivo a arquivo nas etapas seguintes para manter o histórico legível.
- Mover as bibliotecas embutidas (PDF.js, 1,4 MB em `02-corpo-e-bibliotecas.html`; SheetJS em `lib/`) para `vendor/` com versão e hash registrados; o montador continua embutindo no HTML final.
- Documentar o build em `LEIA-ME.md`.

**Pronto quando:** `npm run lint` e `npm test` rodam; o HTML gerado é idêntico ao de antes (comparar hash).

**Riscos:** o lint vai apontar muitos avisos por causa dos globais. Tratar como lista de trabalho para as etapas 2 e 4, não como bloqueio.

## Etapa 2 — Núcleo puro (o que o servidor vai reutilizar)

**Objetivo:** extrair a regra de negócio para funções que recebem dados e devolvem dados.

**Escopo (arquivos):**
- `12-motor-linhas.js`, `13-modelo-e-variacoes.js`: geração de linhas, banhos, variações.
- `21b-romaneio-extras.js` (rateio de insumos), partes de cálculo de `21-edicao-em-lote-e-revisao.js`.
- `28-exportar.js` (montagem da planilha por sistema: Jueri, Bling, outros).
- `22-importar-pdf-romaneio.js` e leitura de texto de `19c-colar-romaneio.js` (parsing de romaneios, planilhas e XML).
- `11-utilidades.js` e `10-limites-e-colunas.js`: formatação, números, referências.

**Como:**
1. Criar `src/core/` (ou `src/domain/`) com módulos ES (`calculo.js`, `romaneio.js`, `exportar.js`, `referencias.js`).
2. Cada função passa a receber `config` e os dados como argumentos. Eliminar `cfg()`, `S.`, `G.`, `ROM` e `toast` de dentro do núcleo. Quem precisar de aviso devolve uma lista de mensagens (`{linhas, avisos}`).
3. Deixar adaptadores finos no código atual (`const cfg = () => S.config`) para não quebrar nada.
4. Trocar os testes que recortam texto do código-fonte e rodam em `vm` (`calculos_precisao_regressao.js`, etc.) por testes que importam o módulo.
5. Adicionar testes de unidade com o backup real: dado `config` + `lanc`, as linhas exportadas são idênticas às do app atual (teste de caracterização).

**Pronto quando:** o núcleo roda em Node sem navegador; os testes de caracterização com o backup real passam; a suíte inteira continua verde.

**Riscos:** regras escondidas em eventos de interface. Mitigação: antes de mover, escrever o teste de caracterização da função em questão.

## Etapa 3 — Camada de armazenamento (`store`)

**Objetivo:** trocar onde os dados moram sem tocar na interface.

- Definir a interface assíncrona: `getConfig`, `saveConfig`, `listPecas`, `putPeca`, `deletePeca`, `listRomaneios`, `getRomaneio`, `putRomaneio`, `putFoto`, `getFoto`, `listTabelas`, `exportBackup`, `importBackup`.
- Implementar o adaptador local sobre `localStorage` (`cadpecas4`) e IndexedDB (`fotos`, `pontos`, `roms`, `tabs`), com o comportamento atual (diário, cota, recuperação).
- Consolidar as 33 chaves de `localStorage` num único módulo `preferencias` (preferências de tela) separado dos dados de negócio.
- Remover acessos diretos a `localStorage` e IndexedDB fora desse módulo (hoje 14 arquivos).
- Separar `salvar()` de `toast` e de render: o armazenamento emite eventos (`salvo`, `erro`, `conflito`) e a interface decide o que mostrar.
- Trocar os IDs de 8 caracteres por UUID para registros **novos**; manter leitura dos IDs antigos.

**Pronto quando:** nenhum arquivo fora de `src/store/` toca em `localStorage` de dados nem em IndexedDB; testes de quota, conflito, duas abas e restauração (`t58`–`t63`, `t94`) passam.

**Riscos:** corrida entre abas e perda de dados. É a etapa mais sensível a regressão; cobrir com os testes de integridade já existentes e rodar sempre com o backup real.

## Etapa 4 — Estado explícito

**Objetivo:** acabar com os globais.

- Criar um objeto de estado único (`estado = { config, pecas, form, romaneio, ui }`) e uma função `despachar(acao)` com ações nomeadas (`lancarPeca`, `editarPeca`, `cancelarEdicao`, `abrirRomaneio`, `trocarCategoria`…).
- Migrar os 53 globais por grupos: primeiro os de domínio (`S`, `G`, `ROM`, `ROMS`), depois os de edição (`editId`, `rascunho`, `quick`), por último os de interface (`abertos`, `catUI`, `romUI`).
- O histórico de desfazer e refazer passa a ser consequência das ações, não de comparações do estado inteiro.
- Cada ação devolve o novo estado e uma lista de efeitos (salvar, avisar, renderizar), executados por um único ponto.

**Pronto quando:** `eslint no-undef` e `no-restricted-globals` passam sem exceções; nenhum módulo escreve em variável de outro módulo.

**Riscos:** é a mudança mais ampla. Fazer por fatias verticais (um fluxo inteiro por vez: lançar peça, depois edição, depois romaneio), sempre com a suíte verde.

## Etapa 5 — Interface em módulos

**Objetivo:** separar o que o usuário vê do que o sistema decide.

- Dividir os arquivos de eventos (`30`, `31`, `32`, `33`, `35`; cerca de 640 acessos ao DOM) por tela: lançamento, planilha, romaneio, cadastros, menus.
- Trocar HTML montado em strings longas (linhas de até 2.900 caracteres) por funções de template pequenas e testáveis, uma por componente (cartão de peça, cartão de romaneio, barra de formulário, menu lateral).
- Gerar o menu do celular e o do desktop a partir de uma única definição de navegação (hoje o do celular já é gerado do lateral).
- Decidir, com base nos componentes já isolados, se vale adotar um framework (Preact, Svelte ou Lit) ou manter JavaScript simples com módulos. Esta decisão só faz sentido aqui.

**Pronto quando:** nenhum arquivo passa de cerca de 400 linhas legíveis; nenhuma linha passa de 160 caracteres; a suíte inteira continua verde.

## Etapa 6 — Servidor

**Objetivo:** hospedar contas, dados e sincronização.

**Decisões a tomar antes (ver "Perguntas em aberto"):** modelo de preço, nível de multiusuário, pilha técnica.

**Modelo de dados (a partir do backup):**
- `organizacao` (tenant) e `usuario` com papéis (dono, editor, leitor).
- `configuracao` por organização (categorias, banhos, galvânicas, fornecedores, modelos de planilha).
- `peca` (antes `lanc`), `romaneio`, `tabela_salva`, `rascunho`, `ponto_de_restauracao`.
- `foto` em armazenamento de objetos (S3 compatível), com URL assinada; sai de dentro do JSON.
- Autoria em cada registro: `criado_por`, `atualizado_em`, `versao`.

**API:**
- Autenticação (e-mail e senha ou provedor externo) e organização ativa.
- CRUD das entidades acima, com paginação (hoje o app carrega tudo; testado com 5.000 peças).
- Endpoint de cálculo e exportação reutilizando o **núcleo puro** da etapa 2 (a mesma planilha sai no navegador e no servidor).
- Importação de backup (`POST /importar`) lendo o formato atual, incluindo versões antigas.

**Sincronização:**
- Primeira versão: o servidor é a fonte de verdade e o navegador guarda cópia local para uso offline.
- Conflitos: versão por registro (`atualizado_em` mais `versao`); em conflito, mostrar a tela de resolução que o app já tem para romaneios.
- O adaptador `store` remoto implementa a mesma interface da etapa 3.

**Segurança:**
- Isolamento por organização em todas as consultas.
- Chave do imgbb deixa de ficar no navegador: o servidor envia as fotos.
- Registro de auditoria (quem mudou o quê).
- Backup automático no servidor e exportação pelo usuário.

**Pronto quando:** dois usuários da mesma organização editam sem perder dados; uma organização nunca enxerga a outra (teste automático de isolamento); o backup real importa e exporta a mesma planilha que o app local.

## Etapa 7 — Migração de dados e lançamento

- Assistente de importação: o usuário envia o JSON de backup do app atual e o servidor cria a organização.
- Piloto com 1 a 3 clientes reais, comparando a planilha exportada com a do app local (lado a lado) por pelo menos um ciclo completo de compra.
- Plano de contingência: o app local continua funcionando e exportando o backup.
- Cobrança, termos de uso, política de privacidade e conformidade com a LGPD (dados de fornecedores e notas fiscais).
- Monitoramento de erros e métricas de uso.

---

## Critérios de qualidade em todas as etapas

- Suíte inteira verde, incluindo `t18` e `t94` com backup real.
- Teste visual no celular (390 px) nas telas alteradas.
- Nenhum aumento de globais; contagem registrada a cada etapa.
- Backups antigos continuam sendo lidos.
- Pacote do Netlify regenerado e verificado (`tools/publicar.py`, `tools/verificar_pacote.py`).

## Riscos principais

| Risco | Mitigação |
|---|---|
| Regressão em cálculo de banho, verniz e rateio | Testes de caracterização com o backup real antes de mover qualquer função |
| Perda de dados na camada de armazenamento | Testes de quota, conflito, duas abas e restauração; manter o diário atual |
| Refatoração longa sem entregar valor | Cada etapa termina com versão publicável; etapa 6 pode começar em paralelo à 5 |
| Escopo do servidor crescer | Primeira versão: uma organização por conta, sincronização simples, sem offline-first completo |
| Dependência do selo do Netlify e de provedores | Manter a folga da barra inferior no celular; hospedar o front fora do Netlify gratuito quando for SaaS |

## Perguntas em aberto (decidir antes da etapa 6)

1. **Quem usa:** só uma loja por conta, ou várias lojas e vários usuários por conta?
2. **Modelo de preço:** assinatura por loja, por usuário ou por volume de peças?
3. **Offline:** o uso offline continua obrigatório, ou o SaaS pode exigir internet?
4. **Pilha técnica:** qual linguagem e banco no servidor (Node com Postgres facilita reaproveitar o núcleo em JavaScript)?
5. **Integrações:** exportar por arquivo continua, ou haverá integração direta com Jueri e Bling por API?
6. **Fotos:** continuar com link externo (imgbb) ou hospedar no próprio SaaS?

## Ordem sugerida das primeiras semanas

1. Etapa 0 e 1 (limpeza e ferramentas): poucos dias.
2. Etapa 2, começando por `12-motor-linhas.js` e `28-exportar.js` (maior valor para o servidor).
3. Em paralelo, responder as perguntas em aberto.
4. Etapa 3 antes de qualquer protótipo de servidor.
