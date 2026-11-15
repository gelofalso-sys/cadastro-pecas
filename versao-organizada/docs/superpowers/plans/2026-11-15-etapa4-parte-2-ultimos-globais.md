# Etapa 4, parte 4.2 (últimos globais mutáveis) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (execução nativa).

**Goal:** Zerar os globais mutáveis (`let`) de nível superior: 4 viram `const`, 15 viram campos de `estadoBase`, `estadoArmazenamento` e `estadoRomaneio`, sem mudar comportamento.

**Architecture:** O codemod `tools/migrar_globais.mjs` (escopo, não texto) ganha os nomes novos no `MAPA`; declarações reescritas à mão no mesmo ponto da carga. Prova: suíte verde com o backup real.

**Spec:** [desenho, seção 4.2](../specs/2026-11-15-etapa4-estado-design.md)

## Global Constraints
- Backup, chaves, IndexedDB, `salvar()` síncrono: intactos. Sem `git push`.
- `MAPA` final: `estadoBase`: `bancoAberto`, `HIST_SUG`, `lastExport`, `editId`, `rascunho`, `undo`, `erro`, `celEd`, `G`, `abertos`; `estadoArmazenamento`: os 16 da 4.1 mais `dirty`, `conflito`, `db`, `TABS`, `ROMS`, `romConflito`; `estadoRomaneio`: `romCriando`, `romChaveL`, `relTem`, `ROM`, `NF`; `estadoConfig`, `estadoPlanilha` como na 4.1. `estadoExportacao` sai do `MAPA` (`lastExport` é de `estadoBase`).
- `const`: `S`, `sel`, `HIST`, `REDO` (declaração `let` -> `const`; nenhuma reatribuição existe).
- Ao mover um nome exposto de uma fatia, atualizar `expoe` (trocar por `estadoX`) com justificativa no LEIA-ME; `tests/unit/expoe_existe.test.mjs` e `checar_fronteiras` devem seguir verdes.
- Testes `vm` que stubam/recortam esses nomes mudam junto.
- Pronto de cada tarefa: `npm run lint` (0 `no-undef`), `node tools/fatias.mjs --validar`, `npm run mapa`, `npm run test:unit`, `npm run build`, suíte completa com `CP_BACKUP="C:/Users/mathe/Downloads/cadastro-pecas-backup-completo-2026-11-08.json" python tests/run_all.py --paralelo=4` (flake de carga: rodar com `--so=`); obrigatórios t58 a t63, t94, t121.

## Review Focus
- `const S` quebra algum código que reatribui `S` (`S=`) fora do bloco analisado (testes `vm`, HTML inline)?
- TDZ: `estadoBase` em `src/js/10` antes de qualquer uso; `estadoRomaneio` (19c) vs. `ROM` lido em arquivos anteriores só em funções.
- `abertos` é lido/escrito na carga (`prefLer`) antes de `estadoBase.abertos` existir?

### Task 1: `const` para `S`, `sel`, `HIST`, `REDO`
- [ ] Trocar `let` por `const` nas declarações; `npm run lint`, `test:unit`, `build`, testes `vm` por nome, suíte. Commit `estado: S, sel, HIST e REDO como const (4.2)`.

### Task 2: `estadoBase` (editId, rascunho, undo, erro, celEd, G, abertos)
- [ ] Teste: `migrar_globais.test.mjs` ganha caso de `let a=1,b;` com atribuição `a=2` e leitura em função. Atualizar `MAPA` (e remover `estadoExportacao`). Rodar `node tools/migrar_globais.mjs --grupo=estadoBase --aplicar`; reescrever as declarações de `src/js/10`; ajustar testes `vm`; verde; commit.

### Task 3: `estadoArmazenamento` (dirty, conflito, db, TABS, ROMS, romConflito)
- [ ] Mesmo procedimento; declarações em `14-persistencia.js` e `20-armazenamento-idb.js`; `expoe` de `armazenamento` (trocar `dirty`, `conflito`, `db`, `TABS`, `ROMS`, `romConflito` por `estadoArmazenamento`, já exposto); verde; commit.

### Task 4: `estadoRomaneio` (ROM, NF)
- [ ] Mesmo procedimento; declarações em `19c0-romaneio-global.js` e `23c-nota-fiscal.js`; `expoe` de `romaneio` (`ROM`, `NF` -> `estadoRomaneio`); verde; commit.

### Task 5: Fechamento
- [ ] `node tools/checar_fronteiras.mjs --base` deve dar 0 globais mutáveis; LEIA-ME e registro em `PLANO-TRANSICAO-SAAS.md`; suíte completa; revisor novo (Opus); uma passada de correção só para Crítico/Importante, cada uma com teste que falha antes.
