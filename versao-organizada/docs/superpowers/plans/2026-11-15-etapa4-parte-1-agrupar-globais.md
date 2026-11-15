# Etapa 4, parte 4.1 (agrupar globais pequenos em objetos de estado) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (execução nativa). Steps usam checkbox.

**Goal:** Reduzir os globais mutáveis de nível superior de 45 para 19, movendo 26 deles para objetos `estadoX` das suas donas, sem mudar comportamento.

**Architecture:** Um codemod (`tools/migrar_globais.mjs`) analisa o bloco montado com `eslint-scope`, acha cada referência que resolve ao global alvo (nunca variável local homônima) e a reescreve para `estadoX.nome`; a declaração `let` é reescrita à mão (tira o nome da lista, põe no objeto `estadoX`, no mesmo ponto da carga). Prova: suíte verde com o backup real.

**Spec:** [docs/superpowers/specs/2026-11-15-etapa4-estado-design.md](../specs/2026-11-15-etapa4-estado-design.md)

## Global Constraints

- Formato do backup, chaves, esquema do IndexedDB: intactos. `salvar()` síncrono. Sem `git push`.
- Troca por escopo, nunca por texto: variável local de mesmo nome (`w`, `erro`, `db`...) não pode mudar.
- O objeto `estadoX` fica declarado onde estava o `let` (mesma ordem de carga). Arquivo novo entra em `src/_ordem.txt`.
- Mapeamento fixo (nome -> objeto):
  - `estadoArmazenamento` (14): `sT`, `chain`, `snapL`, `snapC`, `restaurando`, `corrompido`, `ftSalvas`, `histSep`, `romGravP`, `romST`, `romTem`, `romInfo`, `romArm`, `tabArm`, `AUTOR`, `ARQ`.
  - `estadoRomaneio`: `romCriando`, `romChaveL`, `relTem`.
  - `estadoConfig`: `romUI`, `impT`, `impConfigAntes`.
  - `estadoExportacao`: `lastExport`.
  - `estadoPlanilha`: `w`.
  - `estadoBase` (novo, em `src/js/10-limites-e-colunas.js`): `bancoAberto`, `HIST_SUG`.
- Ficam globais (decisão do desenho; HIST e REDO ficam juntos até o desfazer por ações): `S`, `ROM`, `G`, `editId`, `abertos`, `sel`, `rascunho`, `NF`, `dirty`, `conflito`, `TABS`, `ROMS`, `HIST`, `REDO`, `celEd`, `db`, `romConflito`, `undo`, `erro`.
- Pronto de cada tarefa: `npm run lint` (0 `no-undef`), `node tools/fatias.mjs --validar`, `npm run mapa`, `npm run test:unit`, `npm run build`, suíte completa com `CP_BACKUP="C:/Users/mathe/Downloads/cadastro-pecas-backup-completo-2026-11-08.json" python tests/run_all.py --paralelo=4` (falha só em paralelo: rodar com `--so=`). Obrigatórios: t58 a t63, t94, t121.
- Testes em `vm` que recortam fontes e leem esses nomes (`let impConfigAntes=` etc.) mudam junto: renomear stubs/recortes.

## Review Focus

- Variável local homônima não é trocada; atribuição composta (`+=`, `++`), propriedade abreviada (`{sT}`), `typeof x`, desestruturação e `x=>` com parâmetro homônimo.
- Nenhuma referência ao `estadoX` antes de ele existir na ordem de carga (execução em nível superior).
- `chain=chain.then(flush)` e os timers (`sT`, `romST`) continuam coerentes entre fatias.

---

### Task 1: Codemod por escopo (`tools/migrar_globais.mjs`)

**Files:** Create `tools/migrar_globais.mjs`, `tests/unit/migrar_globais.test.mjs`.

**Interfaces — Produces:** `migrar(codigo: string, mapa: Record<string,string>): {codigo: string, trocas: number}` (puro; reescreve referências a variáveis de nível superior de `codigo` conforme `mapa`, p.ex. `{sT:"estadoArmazenamento"}`; NÃO mexe nas declarações dos alvos, devolve-as intactas) e CLI `node tools/migrar_globais.mjs [--aplicar]` que lê o bloco montado, aplica o mapa fixo e, com `--aplicar`, grava de volta nos arquivos de `src/` (mapeando offsets do bloco para arquivo, usando `arquivosDoBloco`/`lerBloco` de `tools/_nucleo.mjs`).

- [ ] **Step 1: teste que falha** (`migrar_globais.test.mjs`): `let sT=null; function a(){sT=1;return sT}` -> referências viram `estadoA.sT` e a declaração fica; local homônimo (`function b(sT){return sT}`) e parâmetro de seta (`x=>sT`? não: `sT=>sT`) NÃO mudam; `sT++` e `sT+=2` viram `estadoA.sT++`/`estadoA.sT+=2`; `{sT}` vira `{sT:estadoA.sT}`; `typeof sT` vira `typeof estadoA.sT`; `[sT,x]=[1,2]` (desestruturação) vira `[estadoA.sT,x]=[1,2]`; nome fora do mapa não muda; `trocas` conta cada referência.
- [ ] **Step 2:** `node --test tests/unit/migrar_globais.test.mjs`. Expected: FAIL.
- [ ] **Step 3:** Implementar `migrar` com `espree` + `eslint-scope` (`analyze`, variáveis do escopo global/módulo cujo nome está em `mapa`; para cada `reference` não-declaração, substituir `identifier.range` por `mapa[nome]+"."+nome`, tratando `Property.shorthand`). Aplicar de trás para frente. CLI conforme acima; recusar gravar se o bloco já tiver `estadoX.nome` (idempotência).
- [ ] **Step 4:** `node --test tests/unit/migrar_globais.test.mjs`. Expected: PASS. Commit `tools: codemod por escopo para agrupar globais (4.1)`.

### Task 2: Aplicar por dona e reescrever as declarações

**Files:** os `.js` de `src/` que declaram ou usam os 26 nomes; `tests/*.js` e `tests/unit/*.mjs` que recortam ou stubam esses nomes; `src/_ordem.txt` só se necessário.

- [ ] **Step 1:** Por grupo, nesta ordem: `estadoArmazenamento`, `estadoRomaneio`, `estadoConfig`, `estadoExportacao`, `estadoPlanilha`, `estadoBase`. Para cada grupo: rodar o CLI com `--aplicar` só para o mapa do grupo; reescrever à mão as declarações `let` (tirar o nome da lista, pôr o campo no objeto `estadoX`, mesmo valor inicial, mesmo ponto da carga); `estadoBase` nasce em `10-limites-e-colunas.js`.
- [ ] **Step 2:** `npm run lint` (0 `no-undef`), `fatias --validar`, `npm run test:unit`, `npm run build`; rodar os testes `vm` por nome (`node tests/<nome>.js`) e corrigir recortes/stubs que citam os nomes antigos. Expected: tudo verde.
- [ ] **Step 3:** `--so="t58|t59|t60|t61|t62|t63|t94|t121"` com `CP_BACKUP`, depois suíte completa. Expected: verde (flakes de carga: rodar sozinhos). Commit por grupo: `estado: <grupo> agrupado em estadoX (4.1)`.
- [ ] **Step 4 (depois do último grupo):** `node tools/checar_fronteiras.mjs --base` deve dar 19 globais mutáveis; `npm run mapa`.

### Task 3: Fechamento

**Files:** `docs/PLANO-TRANSICAO-SAAS.md`, LEIA-ME das fatias afetadas, `CLAUDE.md` (se citar algum nome movido).

- [ ] **Step 1:** Atualizar LEIA-ME de `armazenamento`, `romaneio`, `configuracao`, `exportacao`, `planilha` (campos novos dos `estadoX`) e o registro de execução (globais 45 -> 19; o que ficou: 4.2 `S`/`ROM`/`G`/..., 4.3 `despachar` e desfazer por ações).
- [ ] **Step 2:** Suíte completa; revisor novo (Opus) sobre o diff; uma passada de correção só para Crítico/Importante, cada uma com teste que falha antes. Commit final.
