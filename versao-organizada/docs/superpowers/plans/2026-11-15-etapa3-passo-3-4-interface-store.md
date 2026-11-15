# Etapa 3, passo 3.4 (interface `store` assíncrona e adaptador local) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (execução nativa escolhida pelo dono). Steps usam checkbox.

**Goal:** Criar a interface assíncrona do store e o adaptador local, com teste de contrato reutilizável, sem trocar nenhum chamador (isso é o 3.5).

**Architecture:** `src/store/store-local.js` define a constante global `storeLocal` com os 13 métodos do plano, sobre `lerPref/gravarPref` (blob `cadpecas4`, índices `cadpecas-roms` e `cadpecas-tabs`) e `idbGet/idbPut` (lojas `fotos`, `roms`). O adaptador só persiste; derivação de índice e regras de domínio ficam com o chamador. `exportBackup`/`importBackup` delegam a ganchos que `armazenamento` registra (o store não depende de fatia).

**Spec:** [desenho](../specs/2026-11-15-etapa3-store-design.md), [plano geral](../../PLANO-ETAPA-3-STORE.md) passo 3.4.

## Global Constraints

- Formato do backup, chaves, esquema `cadpecas-big` v3, `EX_PREFIXO`, `BK_JOURNAL` não mudam. Sem UUID, sem dependência npm nova (sem fake-indexeddb): o contrato roda em Playwright, no navegador real.
- Nada na interface expõe `localStorage` nem IndexedDB. Nenhum chamador do app muda neste passo; nada chama `storeLocal` ainda além do teste e dos ganchos.
- `store_unico` continua verde (acesso só dentro de `src/store/`). Arquivo novo entra em `src/_ordem.txt` depois de `store/eventos.js`.
- Textos em português; sem `\n` literal em texto gerado.

## Rulings de escopo (registrados)

- Exclusão com diário (`exPreparar`/`exRestaurar`, tombstones `ROMDEL`/`TABDEL`) NÃO entra no 3.4: a lista de métodos do plano não tem `deleteRomaneio`; fica em `armazenamento` até o 3.5.
- `putPeca`/`saveConfig` fazem ler-modificar-gravar do blob `cadpecas4`, preservando `form`, `edit`, `rasc`. Enquanto o `flush` regrava o blob inteiro a partir de `S`, trocar chamadores é risco de corrida: por isso só no 3.5, com a ordem definida lá.
- Erro de armazenamento (cota, bloqueio) vira rejeição da Promise; `idbPut` que devolve `null` vira rejeição `Error("falha ao gravar no IndexedDB: <loja>")`.

## Review Focus

- `putPeca` não pode apagar `form`/`edit`/`rasc` nem outras peças.
- `putRomaneio` não pode perder entradas de índice que outra aba gravou (mesclar por id, ordenar por `em` decrescente, como `gravarIdx`).
- Leitura de blob ausente ou corrompido devolve valor vazio (`null`/`[]`), não lança.

---

### Task 1: Contrato e adaptador (config, peças, fotos, romaneios, tabelas)

**Files:** Create `tests/contrato_store.js`, `tests/t121_store_contrato.py`, `src/store/store-local.js`; Modify `src/_ordem.txt`, `src/fatias/armazenamento/FATIA.json` (`testes`).

**Interfaces — Produces** (`storeLocal`, todos `async`):
`getConfig(): object|null`; `saveConfig(config): void`; `listPecas(): array`; `putPeca(peca): void`; `deletePeca(id): boolean`; `listRomaneios(): array` (índice); `getRomaneio(id): object|null`; `putRomaneio(rec, indice): void`; `putFoto(id, tipo: "m"|"r", dado: string): void`; `getFoto(id, tipo): string|null`; `listTabelas(): array` (índice).
`tests/contrato_store.js` exporta `async function contrato(store): string[]` (lista de falhas, vazia = passa) e roda a mesma bateria contra qualquer adaptador futuro.

- [ ] **Step 1: teste que falha.** `contrato(store)` verifica, nesta ordem: `getConfig()` vazio -> `null`; `saveConfig({a:1})` e `getConfig()` igual; `putPeca({id:"x1",F:"A"})`, `putPeca({id:"x2"})` -> `listPecas()` tem 2; `putPeca({id:"x1",F:"B"})` troca sem duplicar; `form`/`edit`/`rasc` plantados no blob antes continuam depois (Review Focus); `deletePeca("x2")` devolve `true`, `deletePeca("zz")` devolve `false`; `putFoto("x1","m","data:a")` -> `getFoto("x1","m")==="data:a"` e `getFoto("x1","r")===null`; `putRomaneio({id:"r1",rows:[]},{id:"r1",em:1})` e `putRomaneio({id:"r2",rows:[]},{id:"r2",em:2})` -> `listRomaneios()` ids `["r2","r1"]`; índice pré-existente de outra aba (`cadpecas-roms` com `r9`) sobrevive; `getRomaneio("r1").id==="r1"`, `getRomaneio("nada")===null`; blob corrompido (`cadpecas4="{"`) -> `listPecas()` `[]`; `listTabelas()` com `cadpecas-tabs` plantada devolve a lista. O teste Playwright abre o HTML limpo (contexto novo), injeta `contrato` e roda contra `storeLocal`; falha se a lista não for vazia.
- [ ] **Step 2:** `python tests/run_all.py --so=t121_store_contrato`. Expected: FAIL (`storeLocal` não definido).
- [ ] **Step 3:** Implementar `store-local.js` com a assinatura acima (`lerPref`/`gravarPref`, `idbGet`/`idbPut`; fotos nas lojas `fotos` com chave `"m:"+id`/`"r:"+id`; romaneios na loja `roms` por `id`; mescla de índice por id e ordenação por `em` decrescente). Entrar em `_ordem.txt`.
- [ ] **Step 4:** Mesmo comando. Expected: PASS. Depois `lint`, `fatias --validar`, `mapa`, `test:unit`, `build`.
- [ ] **Step 5:** Commit `store: interface assincrona e adaptador local (3.4)`.

### Task 2: `exportBackup`/`importBackup` por ganchos e fechamento

**Files:** Modify `src/store/store-local.js`, `src/fatias/armazenamento/20-armazenamento-idb.js` (registro dos ganchos, 2 linhas), `tests/contrato_store.js`, `src/fatias/armazenamento/LEIA-ME.md`, `docs/PLANO-TRANSICAO-SAAS.md`, `tools/inventario_store.mjs` (corrige texto das chaves dinâmicas: `key` de 19d é `cadpecas-roms`/`cadpecas-tabs`).

**Interfaces — Produces:** `storeLocal.ligar({exportBackup: ()=>Promise<{o,falhas,hoje}>, importBackup: (o)=>Promise<boolean>})`; `exportBackup()`/`importBackup(o)` chamam o gancho e lançam `Error("backup nao ligado")` se ausente. `armazenamento` liga `bkMontar` e `aplicarBackupTotalComLock` (confirmar a assinatura real ao implementar).

- [ ] **Step 1: teste que falha.** Contrato: sem gancho, `exportBackup()` rejeita com `/backup nao ligado/`; com gancho falso (`ligar`), devolve o que o gancho devolve. Teste Playwright extra: no app real `await storeLocal.exportBackup()` devolve objeto com `o.app==="cadastro-pecas"` e `o.tipo==="total"`.
- [ ] **Step 2:** Rodar `--so=t121`. Expected: FAIL.
- [ ] **Step 3:** Implementar `ligar`, `exportBackup`, `importBackup`; registrar os ganchos em `armazenamento` sem mudar `bkMontar`/`aplicarBackupTotal`.
- [ ] **Step 4:** Rodar `--so=t121` e `--so="t58|t59|t60|t61|t62|t63|t94"` com `CP_BACKUP`. Expected: verde.
- [ ] **Step 5:** `lint`, `fatias --validar`, `mapa`, `test:unit`, `build`, suíte completa com `CP_BACKUP` (flakes: rodar sozinhos). LEIA-ME e registro atualizados; commit `store: ganchos de backup e fechamento do 3.4`. Revisão do branch por revisor novo (Opus), uma correção só para Crítico/Importante.
