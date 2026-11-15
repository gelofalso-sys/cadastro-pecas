# Etapa 3, passos 3.5 e 3.6 (funil de dados e fechamento) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (execução nativa). Steps usam checkbox.

**Goal:** Nenhum arquivo fora de `src/store/` usa as funções finas de armazenamento (`lerPref`/`gravarPref`/`removerPref`, `idbGet`/`idbPut`/`idbDel`/`idbOp`/`idbAbrir`); todo acesso a dado de negócio passa por funções nomeadas do store, com o comportamento de hoje.

**Architecture:** `src/store/dados.js` (chaves de dado do localStorage, lista fechada) e `src/store/banco.js` (lojas do IndexedDB: ler, gravar, apagar, chaves, todos, adicionar) embrulham as funções finas sem mudar semântica (mesmas chaves, mesmos retornos, `null` do IndexedDB em falha, `undefined` quando falta). Chamadores trocam só o nome.

**Spec:** [desenho](../specs/2026-11-15-etapa3-store-design.md), passos 3.5 e 3.6 de [PLANO-ETAPA-3-STORE.md](../../PLANO-ETAPA-3-STORE.md).

## Rulings de desenho (registrados)

- **Não migrar os chamadores para `storeLocal` (async) agora.** Motivos: `flushJa` (pagehide/beforeunload) precisa gravar o blob de forma síncrona; leituras de abertura (`32-ler-indices`) são síncronas; romaneios e tabelas gravam dentro de `exSalvarComLock` com diário de exclusões (revisão do 3.4, achado 2). Trocar isso por `await` é a mudança de ordem de gravação que o desenho proíbe. A adoção de `storeLocal` fica para a Etapa 6, quando houver adaptador remoto com cache local. O 3.5 entrega o funil nomeado, que já é o ponto único de troca. Custo se errado: a Etapa 6 ainda precisa converter os chamadores de síncrono para assíncrono.
- Chave de dado desconhecida lança (`chave de dado desconhecida: <x>`); na restauração de backup a chave sempre vem da lista fixa de `bkMontar`, então backups antigos restauram igual.
- `exPreparar`, `exRestaurar`, `bkLerBanco` (já nomeadas por operação) ficam como estão.

## Global Constraints

- Formato do backup, chaves, esquema `cadpecas-big` v3, `EX_PREFIXO`, `BK_JOURNAL`: intactos. Sem chave nova, sem dependência npm nova. Sem `git push`, sem publicar.
- Arquivo novo entra em `src/_ordem.txt` depois de `store/prefs.js`. Em texto gerado, nada de `\n` literal.
- Pronto de cada tarefa: `npm run lint` (0 `no-undef`), `node tools/fatias.mjs --validar`, `npm run mapa`, `npm run test:unit`, `npm run build` e suíte completa com `CP_BACKUP` (falha só em paralelo: rodar com `--so=`). Obrigatórios: t58, t59, t60, t61, t62, t63, t94, t121.

## Review Focus

- Chave de dado fora da lista (restauração, diagnóstico, `gravarIdx`) não pode passar a falhar em silêncio onde antes funcionava.
- `bancoLer` devolve `undefined` quando falta e `null` quando o banco falha (os chamadores distinguem).
- Testes em `vm` que recortam fontes e stubam `idbGet`/`lerPref` continuam válidos.

---

### Task 1: `dados.js` e migração do localStorage de dado

**Files:** Create `src/store/dados.js`, `tests/unit/dados.test.mjs`; Modify `src/_ordem.txt`, todos os `.js` de `src/` fora de `store/` que chamam `lerPref|gravarPref|removerPref`, testes em `vm` que carregam `local.js`.

**Interfaces — Produces:** `DADOS` (lista fechada: `cadpecas4`, `cadpecas3`, `cadpecas4-corrompido`, `cadpecas-rom`, `cadpecas-roms`, `cadpecas-rom-info`, `cadpecas-tabs`, `cadpecas-rel`, `cadpecas-nf`), `dadoLer(chave): string|null`, `dadoGravar(chave, valor): void`, `dadoRemover(chave): void`; chave fora de `DADOS` lança `Error("chave de dado desconhecida: "+chave)`.

- [ ] **Step 1: teste que falha** (`dados.test.mjs`, `vm` com `localStorage` falso, como `prefs.test.mjs`): ida e volta em `cadpecas4`; chave de tela (`cadpecas-zoom`) e chave inventada lançam e não gravam; `localStorage` que lança propaga; `DADOS` é igual ao conjunto de chaves de classe `dado` do inventário (`classificar`).
- [ ] **Step 2:** `node --test tests/unit/dados.test.mjs`. Expected: FAIL.
- [ ] **Step 3:** Criar `dados.js`; entrar em `_ordem.txt`. Substituir por regex, fora de `src/store/`, `lerPref(`/`gravarPref(`/`removerPref(` por `dadoLer(`/`dadoGravar(`/`dadoRemover(`; incluir `src/store/store-local.js` só se necessário (ele continua usando as finas). Ajustar os testes `vm` que carregam `local.js` para carregar também `dados.js`.
- [ ] **Step 4:** `test:unit`, lint, `fatias --validar`, `mapa`, `build`, `--so="t58|t59|t60|t61|t62|t63|t94|t121"` com `CP_BACKUP`, suíte completa. Expected: verde. Commit `store: dados.js, chaves de dado por funil nomeado (3.5)`.

### Task 2: `banco.js` e migração do IndexedDB

**Files:** Create `src/store/banco.js`, `tests/unit/banco.test.mjs`; Modify `src/_ordem.txt` (depois de `store/dados.js`), `.js` de `src/` fora de `store/` que usam `idbGet|idbPut|idbDel|idbOp`, testes em `vm` com stub dessas funções.

**Interfaces — Produces:** `bancoLer(loja, chave)`, `bancoGravar(loja, chave, valor)`, `bancoApagar(loja, chave)`, `bancoChaves(loja)`, `bancoTodos(loja)`, `bancoAdicionar(loja, chave, valor)`: todos `Promise`, mesma semântica de `idbGet/idbPut/idbDel/idbOp` (`null` em falha, `undefined` quando falta em `bancoLer`). Lojas válidas: `fotos`, `roms`, `tabs`, `pontos`; outra lança.

- [ ] **Step 1: teste que falha** (`banco.test.mjs`, `vm` com `idbOp` falso que registra `(loja, modo)` e executa o callback sobre um objeto `st` falso): cada função chama `idbOp` com o modo e o método certos (`getAllKeys`, `getAll`, `add(valor, chave)`); loja inválida lança; `null` do `idbOp` é repassado.
- [ ] **Step 2:** `node --test tests/unit/banco.test.mjs`. Expected: FAIL.
- [ ] **Step 3:** Criar `banco.js` sobre `idbOp`/`idbGet`/`idbPut`/`idbDel`. Substituir os usos fora de `store/` (`idbGet(` por `bancoLer(`, `idbPut(` por `bancoGravar(`, `idbDel(` por `bancoApagar(`, e os `idbOp(loja,"readonly",st=>st.getAllKeys())`/`getAll()`/`add` por `bancoChaves`/`bancoTodos`/`bancoAdicionar`). Qualquer `idbOp` que não caiba nesses padrões: parar e ledger antes de decidir.
- [ ] **Step 4:** mesma bateria da Task 1. Expected: verde. Commit `store: banco.js, lojas do IndexedDB por funil nomeado (3.5)`.

### Task 3: Fechamento (3.6)

**Files:** Modify `tests/unit/store_unico.test.mjs`, `src/fatias/armazenamento/LEIA-ME.md`, `docs/PLANO-TRANSICAO-SAAS.md`, `docs/inventario-store.md` (regerado), `CLAUDE.md` (lista de funções do store).

- [ ] **Step 1: teste que falha:** em `store_unico.test.mjs`, acrescentar `\b(lerPref|gravarPref|removerPref|idbGet|idbPut|idbDel|idbOp|idbAbrir)\b` à lista proibida fora de `src/store/` (inclusive comentário). Expected: FAIL se sobrou algum uso ou comentário.
- [ ] **Step 2:** Corrigir os restos até o teste passar.
- [ ] **Step 3:** Atualizar LEIA-ME de `armazenamento` (funil `dados`/`banco`, `storeLocal` fica para a Etapa 6), CLAUDE.md (nomes novos), registro em `PLANO-TRANSICAO-SAAS.md`, `node tools/inventario_store.mjs`.
- [ ] **Step 4:** Gerar o pacote Netlify (`python tools/publicar.py`, só local, sem publicar) e conferir que o HTML do pacote contém `dadoLer` e abre sem erro; rodar suíte completa; revisor novo (Opus) sobre `43b0f23..HEAD` do 3.5 e do 3.6; uma passada de correção só para Crítico/Importante, cada uma com teste que falha primeiro. Commit final.
