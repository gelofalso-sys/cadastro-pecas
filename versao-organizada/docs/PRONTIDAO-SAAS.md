# Prontidão para a transição SaaS (estado em 15/11/2026)

O objetivo desta fase era deixar o app **organizado e preparado** para virar SaaS, sem fazer a transição. Este documento diz o que está pronto, como cada peça se usa, o que de propósito **não** foi feito e o que decidir antes de começar a Etapa 6. O plano completo continua em [PLANO-TRANSICAO-SAAS.md](PLANO-TRANSICAO-SAAS.md).

## O que está pronto

| Peça | Onde | O que garante |
|---|---|---|
| Núcleo de negócio puro | `src/core/` (612 de 971 declarações puras; sem ciclos) | Gera linhas, banhos, rateio, exportação e lê/valida backup sem DOM, estado global nem armazenamento. Roda em Node. |
| Prova de que roda sem navegador | `tools/exemplo_nucleo_node.mjs`, teste `exemplo_nucleo.test.mjs` | Com o backup real: 86 peças, 155 linhas de saída, 8 romaneios, só com `src/core`. |
| Caracterização com o backup real | `tests/t_caracterizacao_gerar.py` + `caracterizacao_gerar.test.mjs` | Núcleo em Node = app, peça a peça (ver o aviso no cabeçalho do teste sobre auto-comparação). |
| Camada de armazenamento | `src/store/` | Único lugar que toca `localStorage`, `sessionStorage` e IndexedDB (teste `store_unico`). Chaves de dado (`dados.js`), preferências (`prefs.js`), lojas do IndexedDB (`banco.js`), eventos de salvar, erro, conflito e cota (`eventos.js`). |
| Interface de armazenamento para trocar de backend | `src/store/store-local.js` (`storeLocal`) e `tests/contrato_store.js` | 13 métodos assíncronos; a mesma bateria de contrato vale para um adaptador remoto. Ainda sem chamadores no app. |
| Estado explícito | `estadoBase`, `estadoArmazenamento`, `estadoRomaneio`, `estadoConfig`, `estadoPlanilha` e outros | 0 globais mutáveis (`let`) de nível superior (eram 103 no início). |
| Código por funcionalidade | `src/fatias/` (9 fatias) e `docs/ARQUITETURA.md` | Fronteiras checadas por ferramenta; cada fatia tem `FATIA.json` e `LEIA-ME.md`. |
| Rede de segurança | suíte completa (169 verificações, 0 falhas), lint, fronteiras, `store_unico`, `expoe_existe` | `python tests/run_all.py --paralelo=4` com `CP_BACKUP`. |
| Ferramentas de migração | `tools/migrar_globais.mjs`, `tools/escritas_entre_fatias.mjs`, `tools/inventario_store.mjs` | Trocas por escopo (não por texto) e inventários gerados. |

## Contratos que o servidor vai reaproveitar (não mudar sem decisão)

- **Formato do backup**: `{app:"cadastro-pecas", tipo:"total", v:1, config, lanc, form, roms, tabs, fotos, rascunho, rel, autor, ...}`; backups antigos continuam sendo lidos (`validarBackup`). O `POST /importar` da Etapa 6 lê isso.
- **Chaves de armazenamento** (`cadpecas4`, `cadpecas-roms`, `cadpecas-tabs` etc.) e **esquema do IndexedDB** `cadpecas-big` v3 (lojas `fotos`, `roms`, `tabs`, `pontos`; diário de exclusões `EX_PREFIXO`, registro `BK_JOURNAL`).
- **IDs** de peça e romaneio: texto de 8 caracteres (`uid`). UUID foi adiado para a Etapa 6.
- **Núcleo**: funções `nome$(S, ...)` recebem o estado como argumento (`S = {config, lanc, form}`); exemplo em `tools/exemplo_nucleo_node.mjs`.

## O que NÃO foi feito, de propósito

- Nenhum servidor, conta, sincronização ou publicação. Nada foi enviado ao GitHub nem ao Netlify.
- Os chamadores do app ainda usam o funil síncrono (`dadoLer`, `bancoLer`...), não `storeLocal` (assíncrono): o `flush` precisa gravar de forma síncrona ao fechar a aba, e romaneios e tabelas gravam dentro de bloqueio com diário de exclusões. Adotar `storeLocal` é trabalho da Etapa 6.
- `despachar` com ações nomeadas e desfazer por ações (4.3): o desfazer atual é por fotografia do estado; só decidir na Etapa 6, conforme a sincronização.
- Cortar as 52 escritas de uma fatia em estado de outra (`docs/escritas-entre-fatias.md`).
- Etapa 5 (interface em módulos, 160 colunas): não é pré-requisito do servidor.

## Requisitos já registrados para quem adotar `storeLocal`

1. Gravar romaneio e índice dentro do bloqueio `cadpecas-exclusoes` (`exSalvarComLock`) e preservar o diário de exclusões; sem isso um romaneio excluído pode ressuscitar.
2. `putPeca` e `saveConfig` regravam o blob `cadpecas4` inteiro, como o `flush`; definir quem grava por último. Hoje peças, config e formulário vivem num único blob: o servidor precisa de versão por registro.
3. Dados danificados não podem ser sobrescritos (o adaptador já recusa com "dados danificados: nada foi gravado").

## Decisões em aberto antes da Etapa 6 (perguntas do plano, com a recomendação)

1. **Quem usa:** uma loja por conta na primeira versão (o plano já prevê); várias lojas e papéis depois.
2. **Preço:** decidir depois de validar com lojas reais; não bloqueia o desenho técnico.
3. **Offline:** é a decisão que mais pesa. Recomendação: servidor como fonte de verdade com cópia local, como no plano; offline completo (fila de operações) só se os clientes exigirem.
4. **Pilha:** Node com Postgres (reaproveita o núcleo em JavaScript, comprovado acima).
5. **Integrações:** manter exportação por arquivo na primeira versão.
6. **Fotos:** hoje link externo (imgbb); mover para armazenamento de objetos do próprio SaaS na Etapa 6.

## Como começar a Etapa 6 (quando decidir)

1. Responder as 6 perguntas acima e registrar em `PLANO-TRANSICAO-SAAS.md`.
2. Brainstorm e plano em `docs/superpowers/` (CLAUDE.md: trabalho grande vai por etapas).
3. Fatia mínima: uma organização por conta; importar backup pelo núcleo; exportar a mesma planilha; adaptador remoto que passe `tests/contrato_store.js`.
4. Só então decidir `despachar`, o desfazer por ações e a adoção de `storeLocal` pelos chamadores.
