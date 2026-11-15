# Etapa 3 (passos 3.0 a 3.3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inventariar o acesso ao armazenamento, isolar preferências de tela/controle em `src/store/prefs.js` e fazer `flush` emitir eventos em vez de chamar `setStatus`/`toast`, sem mudar nada visível.

**Architecture:** `src/store/` ganha `prefs.js` (nomes lógicos -> chaves existentes) e `eventos.js` (emissor síncrono). `armazenamento` emite `salvo`/`erro`/`conflito`/`cota`; a casca `app` ouve e chama `setStatus`/`toast` com os mesmos textos. Dados de negócio continuam em `lerPref`/`gravarPref`/`idb*` até o plano seguinte (3.4 a 3.6).

**Tech Stack:** JS de arquivo único montado por `tools/montar.py`; testes `node --test` (tests/unit) e Playwright (tests/run_all.py).

**Spec:** [docs/superpowers/specs/2026-11-15-etapa3-store-design.md](../specs/2026-11-15-etapa3-store-design.md) (e [PLANO-ETAPA-3-STORE.md](../../PLANO-ETAPA-3-STORE.md)).

## Global Constraints

- Formato do backup, chaves de armazenamento, esquema IndexedDB `cadpecas-big` v3, `EX_PREFIXO` e `BK_JOURNAL` NÃO mudam. Chave ou formato novo: parar e perguntar.
- Sem UUID (Etapa 6). `salvar()` continua síncrono; ordem de gravação inalterada.
- Textos de aviso idênticos, byte a byte. Em texto gerado, `chr(10)`/`String.fromCharCode(10)`, nunca `\n` literal.
- `tests/unit/store_unico.test.mjs`: `lerPref`, `gravarPref`, `removerPref`, `lerSessao`, `idb*` etc. só em `src/store/` (inclusive comentários).
- Arquivo novo entra em `src/_ordem.txt`; `src/store/*` carrega logo depois de `src/core`.
- Mexer só em `src/store/`, `armazenamento` (flush) e `app` (ouvinte); respeitar `FATIA.json`/`expoe` (justificar `expoe` novo no LEIA-ME da dona).
- Não consertar AUD-A-001..009 nem ciclos de lancamento/armazenamento. Sem `git push`.
- Pronto de cada tarefa: `npm run lint`, `node tools/fatias.mjs --validar`, `npm run mapa`, `npm run test:unit`, `npm run build`. Suíte completa: `CP_BACKUP="C:/Users/mathe/Downloads/cadastro-pecas-backup-completo-2026-11-08.json" python tests/run_all.py --paralelo=4` (falha só em paralelo: rodar com `--so=`; flakes conhecidos no CLAUDE.md).

## Review Focus

- Ordem: `setStatus` e `toast` de `flush` ocorrem na mesma ordem e de forma síncrona após virar evento (teste de ordem).
- Cota: o toast de memória cheia continua limitado a 1 a cada 20 s (`avisoMem`) e só sem `db`.
- Ouvinte ausente (emissão antes da casca registrar) não lança nem perde o estado de `dirty`.
- Nome de preferência desconhecido lança erro claro, não grava chave inventada.
- Armazenamento bloqueado (`localStorage` lança): `prefLer`/`prefGravar` lançam como o navegador; quem chamava com try/catch continua com ele.

---

### Task 1: Linha de base e branch (3.0)

**Files:** nenhum código.

**Produces:** branch `etapa3-store` saída de `main`; tag local `v-pre-etapa3`; números de base em `docs/superpowers/plans/` não, só no ledger/relatório.

- [ ] **Step 1:** `git switch -c etapa3-store` (de `main` em `43b0f23`); `git tag v-pre-etapa3 43b0f23`; commitar os três documentos (`PLANO-ETAPA-3-STORE.md`, `PROMPT-ETAPA-3.md`, spec e este plano) com a mensagem `docs: desenho e plano da Etapa 3 (store)`.
- [ ] **Step 2:** `python tools/hash_html.py` e anotar o hash. Run suíte completa com `CP_BACKUP` e tempo. Expected: verde (flakes conhecidos rodados sozinhos com `--so=`). Se algo falhar na base, parar e relatar, não seguir.

### Task 2: Inventário e classificação (3.1)

**Files:** Create `tools/inventario_store.mjs`, `docs/inventario-store.md`, `tests/unit/inventario_store.test.mjs`.

**Interfaces:** Produces `docs/inventario-store.md`: tabela `chave ou loja | arquivo | fatia | uso (ler/gravar/remover) | classe`, classe em `dado` | `tela` | `controle`; mais função exportada `classificar(chave): "dado"|"tela"|"controle"|null`.

- [ ] **Step 1: teste que falha** `inventario_store.test.mjs`: `classificar("cadpecas4")==="dado"`, `classificar("cadpecas-roms")==="dado"`, `classificar("zoom")==="tela"`, `classificar("bk-ult")==="controle"`, `classificar("chave-inexistente")===null`. Cobrir todas as chaves listadas em PLANO-ETAPA-3-STORE.md "Onde estamos" (dado: `cadpecas4`, `cadpecas3`, `cadpecas4-corrompido`, `cadpecas-roms`, `cadpecas-rom-info`, `cadpecas-tabs`; tela: `zoom`, `vista`, `colw`, `split`, `filtro`, `abertos`, `autor`; controle: `bk-ult`, `bk-em`, `rel`, `persist-aviso`, `origem-ok`, `cad-estrito`, `imgbb`, `imgbb-auto`, `imgbb-consent-v1`). As chaves reais têm o prefixo usado no código: conferir por grep e usar a chave literal. Teste adicional: toda chave literal achada no código por `tools/inventario_store.mjs` é classificada (nenhuma `null`).
- [ ] **Step 2:** `node --test tests/unit/inventario_store.test.mjs`. Expected: FAIL (módulo inexistente).
- [ ] **Step 3:** Implementar `tools/inventario_store.mjs` (varre `src/**/*.js`, acha chamadas a `lerPref|gravarPref|removerPref|lerSessao|gravarSessao|removerSessao` com chave literal e `idbGet|idbPut|idbDel|idbOp` com loja literal; chaves não literais saem numa seção "dinâmicas" para revisão manual; `rel`-prefixos e `EX_PREFIXO` entram como dinâmicas). Gera `docs/inventario-store.md`. Classes `dado` = tudo que entra no backup ou é registro de negócio; `controle` = estado de backup/serviço; `tela` = o resto. Dúvida real de classe: decidir o mais conservador (`dado`) e registrar em "dúvidas" no próprio inventário.
- [ ] **Step 4:** `node --test tests/unit/inventario_store.test.mjs` e `node tools/inventario_store.mjs`. Expected: PASS; inventário gerado; sem mudança de código em `src/`.
- [ ] **Step 5:** `npm run test:unit`, `npm run lint`; commit `docs: inventario do store (3.1)`. HTML não muda (`hash_html.py` igual à base).

### Task 3: `src/store/prefs.js` (3.2)

**Files:** Create `src/store/prefs.js`, `tests/unit/prefs.test.mjs`; Modify `src/_ordem.txt` (após `store/local.js`), os arquivos de `src/` que hoje leem/gravam chaves de classe `tela`/`controle` (lista no inventário), `tests/unit/store_unico.test.mjs` só se precisar reconhecer `prefs.js`.

**Interfaces:**
- Consumes: `lerPref/gravarPref/removerPref` de `store/local.js`; classes do inventário.
- Produces (globais simples, em `store/prefs.js`): `PREFS` (objeto nome lógico -> chave real, só `tela` e `controle`), `prefLer(nome): string|null`, `prefGravar(nome, valor: string): void`, `prefRemover(nome): void`. Nome fora de `PREFS` lança `Error("preferencia desconhecida: "+nome)`. Chaves de classe `dado` NÃO entram em `PREFS`.

- [ ] **Step 1: teste que falha** `prefs.test.mjs` (carrega `local.js` e `prefs.js` em `vm` com `localStorage` falso, como `calculos_auditoria_regressao`): ida e volta `prefGravar("zoom","1.2")` -> `prefLer("zoom")==="1.2"` e a chave real no fake é a mesma do código atual; `prefLer` de ausente é `null`; `prefRemover` apaga; nome desconhecido lança; `localStorage` que lança na gravação propaga o erro; toda chave de `PREFS` bate com o inventário (classe tela/controle) e nenhuma de classe `dado` está em `PREFS`.
- [ ] **Step 2:** `node --test tests/unit/prefs.test.mjs`. Expected: FAIL.
- [ ] **Step 3:** Criar `prefs.js` a partir da tabela do inventário (nomes lógicos curtos e iguais ao assunto, ex.: `zoom`, `vista`, `backupUltimo`, `imgbbToken`: chaves literais iguais às atuais). Registrar em `_ordem.txt`.
- [ ] **Step 4:** Migrar, fatia por fatia, cada `lerPref("<chave tela/controle>")` etc. para `prefLer("<nome>")`. Chaves de dado ficam como estão. Depois de cada fatia: `npm run lint` e os testes da fatia (`FATIA.json` `testes`, `--so=`). Usos dentro de `registrarAcoes({...})` e listeners de nível superior: achar também por grep.
- [ ] **Step 5:** `npm run test:unit`, lint (0 `no-undef`), `fatias --validar`, `mapa`, `build`, suíte completa com `CP_BACKUP`. Expected: verde; chaves no localStorage antes/depois idênticas (comparar a lista de chaves gravadas num teste Playwright existente ou no inventário). Commit `store: prefs.js para preferencias de tela e controle (3.2)`.

### Task 4: Eventos de armazenamento (3.3)

**Files:** Create `src/store/eventos.js`, `tests/unit/eventos_store.test.mjs`; Modify `src/fatias/armazenamento/14-persistencia.js` (`flush`, linhas ~44-67), arquivo de abertura/ouvintes em `src/fatias/app/` (registro do ouvinte), `src/_ordem.txt`, `src/fatias/armazenamento/LEIA-ME.md`, `src/fatias/app/LEIA-ME.md`.

**Interfaces:**
- Produces: `armOuvir(nome: "salvo"|"erro"|"conflito"|"cota", fn: (info)=>void): void` e `armEmitir(nome, info): void`. Emissão SÍNCRONA, na ordem de registro; sem ouvinte não faz nada; erro de um ouvinte é capturado e não interrompe `flush`. `info = {texto: string, erro: boolean}`; `cota` também leva `toast: string` (mesmo texto de hoje).
- Mapeamento (textos idênticos aos de hoje em `flush`): `conflito` = os dois `setStatus("Outra aba alterou…",true)` e o `corrompido` (`"Os dados salvos estavam danificados…",true`); `erro` = `"Não consegui salvar agora — tento de novo…"` (conta falhou); `cota` = `"Salvo na sua conta, mas NÃO neste navegador (memória cheia)"` ou `m` com `erro:true`, e `toast(m)` com a regra de 20 s mantida em `flush`; `salvo` = `"Salvo na sua conta"` / `"Salvo neste navegador"`.
- Ouvinte (em `app`): chama `setStatus(info.texto, info.erro)` e, se `info.toast`, `toast(info.toast)`.

- [ ] **Step 1: teste que falha** `eventos_store.test.mjs`: emissão síncrona (ouvinte já rodou ao retornar `armEmitir`); ordem de dois ouvintes; sem ouvinte não lança; ouvinte que lança não impede o seguinte; nome inválido lança.
- [ ] **Step 2:** `node --test tests/unit/eventos_store.test.mjs`. Expected: FAIL.
- [ ] **Step 3:** Implementar `eventos.js`; registrar em `_ordem.txt` depois de `store/prefs.js`.
- [ ] **Step 4:** Trocar em `flush` cada `setStatus(...)`/`toast(m)` por `armEmitir(...)` conforme o mapeamento, sem mexer em `dirty`, `conflito`, ordem de gravação nem retornos. Registrar os quatro ouvintes na casca `app` (carrega depois; `flush` só roda após ação do usuário). `setStatus("Salvando…")` de `salvar()` e os de outras funções ficam como estão (fora do `flush`).
- [ ] **Step 5:** Rodar sozinhos e ler a saída: `python tests/run_all.py --so="t58|t59|t60|t61|t62|t63|t94"` com `CP_BACKUP`. Expected: todos verdes. Depois lint, `fatias --validar` (o `armazenamento` não pode passar a depender de `app`), `mapa`, `test:unit`, `build`, suíte completa. Atualizar os dois LEIA-ME. Commit `armazenamento: flush emite eventos, app mostra aviso (3.3)`.

### Task 5: Parada e registro

**Files:** Modify `docs/PLANO-TRANSICAO-SAAS.md` (Registro de execução, "Etapa 3 — passos 3.0 a 3.3").

- [ ] **Step 1:** Registrar: hashes antes/depois, números do inventário, o que mudou, o achado de que `salvar()` já não mostrava toast nem redesenhava (só `flush` usava `setStatus`/`toast`), rulings, e o que ficou de fora (3.4, 3.5, 3.6, UUID).
- [ ] **Step 2:** Revisão final do branch (fresh reviewer), suíte completa verde, commit `docs: registro da Etapa 3 (3.0 a 3.3)`. NÃO fazer merge nem push. Relatar ao dono e perguntar se segue com 3.4 (plano novo).

## Fora deste plano (próximo plano, se o dono aprovar)
3.4 interface `store` assíncrona + adaptador local + teste de contrato; 3.5 migração por fatia (`exportacao`, `tabelas`, `configuracao`, `fotos`, `romaneio`, `planilha`, depois `lancamento` e `armazenamento`); 3.6 fechamento (`store_unico` ampliado, pacote Netlify sem publicar).
