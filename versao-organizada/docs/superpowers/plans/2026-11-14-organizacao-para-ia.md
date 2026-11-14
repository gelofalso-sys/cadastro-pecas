# Organização do código para manutenção por IA — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar o app em fatias por funcionalidade (`src/fatias/<nome>/`) com contrato, mapa gerado e lint de fronteira, sem mudar o comportamento visível.

**Architecture:** O HTML continua sendo um bloco único montado por `tools/montar.py`. Um manifesto único `src/_ordem.txt` define a ordem de carga; mover um arquivo para uma fatia é `git mv` mais uma linha nesse manifesto, e o HTML gerado fica **byte a byte idêntico** (prova de que nada quebrou). Cada fatia tem `FATIA.json` (contrato) e `LEIA-ME.md`; ferramentas Node leem o grafo de dependências já existente (`tools/grafo_puro.mjs`) para gerar o mapa e checar fronteiras.

**Tech Stack:** JavaScript sem framework, Node 20 (ESLint, `node --test`), Python 3 (montador, suíte Playwright + Edge).

**Spec:** [docs/superpowers/specs/2026-11-14-organizacao-para-ia-design.md](../specs/2026-11-14-organizacao-para-ia-design.md). Contexto: [PLANO-TRANSICAO-SAAS.md](../../PLANO-TRANSICAO-SAAS.md) e [PROMPT-CONTINUACAO-SAAS.md](../../PROMPT-CONTINUACAO-SAAS.md) (ferramentas, comandos e armadilhas).

## Global Constraints

- O app não para de funcionar em nenhuma etapa; a suíte completa fica verde ao fim de cada tarefa de fatia: `CP_BACKUP="C:/Users/mathe/Downloads/cadastro-pecas-backup-completo-2026-11-08.json" python tests/run_all.py --paralelo=4`. O que falhar em modo paralelo roda sozinho antes de ser tratado como falha (`t19` é conhecido).
- O formato do backup é o contrato; backups antigos continuam sendo lidos.
- O HTML final continua sendo um bloco único embutido por `tools/montar.py`, abrindo offline como arquivo único.
- Mudanças só na pasta de trabalho; sem `git push`, sem publicar no Netlify, sem apagar sem pedido.
- Nenhum arquivo acima de cerca de 400 linhas legíveis; nenhuma linha acima de 160 caracteres (nos arquivos que passarem por fatia).
- Não-metas: servidor, contas, assinatura, framework de interface, mudança visual, funcionalidade nova, mudança no formato do backup.
- Pendências da auditoria de 09/11 (por exemplo AUD-A-007, AUD-C-001, AUD-C-003) não são corrigidas aqui; a fatia dona registra cada uma no seu `LEIA-ME.md` como problema conhecido.
- Armadilhas: ao gerar código com quebra de linha em string use `chr(10)`/`String.fromCharCode(10)`; arquivos reescritos por Python no Windows saem com CRLF (rodar `python tools/normalizar_eol.py` antes de comparar hash); nunca disparar `change` à mão em campo; a suíte roda numa cópia temporária, então mudanças feitas depois da cópia não entram na rodada.
- Commits em português, terminando com a linha de atribuição do harness (`Co-Authored-By: ...`).

## Review Focus

1. **Ordem de carga alterada sem querer** (listeners registrados em outra ordem, `const` usado antes de declarado): mover arquivo nunca pode mudar o hash do HTML; reordenar só com `tools/checar_ordem.mjs` e suíte verde. Testado na Tarefa 1 (hash) e no procedimento de fatia (passo 3).
2. **Manifesto inconsistente** (arquivo em `FATIA.json` fora de `_ordem.txt`, ou o contrário; `usa` apontando fatia inexistente): a ferramenta falha com mensagem que nomeia o arquivo. Testado na Tarefa 3.
3. **Símbolo declarado em dois arquivos** (um esconde o outro no grafo): `tools/grafo_puro.mjs` passa a reportar duplicadas e o checador falha. Testado na Tarefa 4.
4. **Ação de clique registrada duas vezes ou perdida na migração do `switch`**: `registrarAcoes` lança erro em nome repetido; o `switch` continua como reserva até esvaziar. Testado na Tarefa 6.
5. **Suíte "verde" por teste pulado** (sem `CP_BACKUP`, `t18`/`t94` pulam): rodar sem `CP_BACKUP` e sem `--permitir-pulos` tem de sair com código não zero. Verificado na Tarefa 5.

---

## Fundação

### Task 1: Manifesto de ordem único e prova de hash

**Files:**
- Create: `src/_ordem.txt`, `tools/hash_html.py`
- Modify: `tools/montar.py`, `tools/_nucleo.mjs`, `tools/checar_ordem.mjs`, `tools/extrair_para_core.mjs`, `tools/publicar.py`, `tests/_fonte.js` (qualquer ferramenta que leia `_ordem*.txt`; achar com `grep -rn "_ordem" tools tests`)
- Delete (depois da troca): `src/core/_ordem.txt`, `src/js/_ordem-a.txt`, `src/js/_ordem-b.txt`

**Interfaces:**
- Produces: `src/_ordem.txt` com uma linha por arquivo, caminho relativo a `src/` (`core/formulas.js`, `js/10-limites-e-colunas.js`, depois `fatias/<nome>/<arq>.js`); nesta ordem exata: núcleo, `_ordem-a`, `_ordem-b`. `tools/_nucleo.mjs`: `export function lerOrdem(raiz = <raiz do projeto>): string[]`; `arquivosDoBloco()` mantém o formato `{n, f, modulo}` com `n` = caminho relativo a `src/` e `modulo = n.startsWith("core/")`. `python tools/hash_html.py` imprime o SHA-256 do HTML que `montar.py` gera (monta em arquivo temporário).

- [ ] **Step 1: Registrar o hash de referência.** Rodar `python tools/hash_html.py` (criar o script: monta em `tempfile` e imprime sha256) e anotar o valor no commit.
- [ ] **Step 2: Escrever `src/_ordem.txt`** concatenando as três listas atuais com os prefixos `core/` e `js/`.
- [ ] **Step 3: Trocar a leitura** em `montar.py` e `_nucleo.mjs` para o manifesto único; `tirar_modulo` aplica-se a caminhos que começam com `core/`. Atualizar as demais ferramentas achadas no `grep`. Apagar os três manifestos antigos.
- [ ] **Step 4: Verificar.** `python tools/hash_html.py` imprime **o mesmo hash** do Step 1; `npm run lint` e `npm run test:unit` passam; `python tests/run_all.py --so=t1\.py` verde.
- [ ] **Step 5: Commit** (`Manifesto de ordem unico (src/_ordem.txt); HTML identico`).

### Task 2: Ferramenta para dividir arquivo sem mudar o hash

**Files:**
- Create: `tools/dividir_arquivo.mjs`, `tests/unit/dividir_arquivo.test.mjs`

**Interfaces:**
- Produces: `export function dividir(texto: string, cortes: number[]): string[]` (cada corte é o número da linha, 1-based, onde começa o próximo pedaço; recusa corte que caia dentro de função, bloco ou template literal, usando `espree` para confirmar que o corte está entre duas declarações/instruções de nível superior) e a CLI `node tools/dividir_arquivo.mjs <arquivo> <corte>:<destino> ... <destino-final>`. Substitui a linha do arquivo em `src/_ordem.txt` pelas linhas dos pedaços, **na mesma posição**.

- [ ] **Step 1: Escrever testes** em `tests/unit/dividir_arquivo.test.mjs`: `dividir(t, [3])` devolve dois pedaços cuja concatenação é igual a `t`; corte dentro de `function f(){` ... `}` lança erro; corte dentro de template literal lança erro; entrada com CRLF preserva o fim de linha.
- [ ] **Step 2: Rodar e ver falhar** (`node --test tests/unit/dividir_arquivo.test.mjs`; "dividir is not a function").
- [ ] **Step 3: Implementar `dividir` e a CLI.** A CLI, depois de gravar os pedaços e atualizar `src/_ordem.txt`, roda `python tools/hash_html.py` e compara com o hash anterior; se diferir, desfaz e sai com erro.
- [ ] **Step 4: Rodar os testes** até passar; testar a CLI em cópia de um arquivo pequeno (`src/js/37-moeda.js`) e confirmar hash idêntico; `git checkout` para descartar a experiência.
- [ ] **Step 5: Commit.**

### Task 3: `FATIA.json` e validador de manifestos

**Files:**
- Create: `tools/fatias.mjs`, `tests/unit/fatias.test.mjs`, `src/fatias/.gitkeep`

**Interfaces:**
- Produces: contrato de `src/fatias/<nome>/FATIA.json`:
  `{ "nome": string, "descricao": string, "arquivos": string[], "expoe": string[], "usa": string[], "testes": string[], "fronteira": "aponta" | "falha" }` (`arquivos` relativos à pasta da fatia; `usa` são nomes de fatias ou `"core"`; `testes` são regex para `run_all.py --so=`).
  `export function carregarFatias(raiz?: string): Fatia[]`; `export function validarFatias(fatias: Fatia[], ordem: string[], existe: (caminho: string) => boolean): string[]` (lista de erros; vazia = ok); `export function donoDoArquivo(fatias: Fatia[]): Map<string, string>` (chave `fatias/<nome>/<arq>`, valor nome da fatia).
- Consumes: `lerOrdem` da Tarefa 1.

- [ ] **Step 1: Escrever testes** (fixtures em objetos, sem disco): `validarFatias` devolve erro que cita o arquivo quando (a) um `arquivos` não existe, (b) existe em `FATIA.json` mas falta em `ordem`, (c) está em `ordem` sob `fatias/x/` mas nenhum `FATIA.json` o lista, (d) `usa` cita fatia inexistente, (e) `fronteira` inválida, (f) campo obrigatório ausente; com tudo certo devolve `[]`.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** `fatias.mjs` com a CLI `node tools/fatias.mjs --validar` (exit 1 com erros). Sem fatias no disco, passa.
- [ ] **Step 4: Rodar testes até passar; adicionar `node tools/fatias.mjs --validar` ao script `lint` do `package.json`.**
- [ ] **Step 5: Commit.**

### Task 4: Medição de acoplamento e checagem de fronteiras

**Files:**
- Modify: `tools/grafo_puro.mjs` (cada declaração ganha `escritas: Set<string>` com nomes de globais escritos dentro dela, via `reference.isWrite()`; `analisar()` devolve também `duplicadas: {nome, arqs: string[]}[]`)
- Create: `tools/acoplamento.mjs`, `tools/checar_fronteiras.mjs`, `tests/unit/fronteiras.test.mjs`, `docs/acoplamento-base.md`, `docs/fronteiras-base.json`

**Interfaces:**
- Consumes: `analisar()` (decls: `Map<nome, {arq, linha, tipo, mut, refs, escritas}>`), `carregarFatias`, `donoDoArquivo`.
- Produces: `export function arestas(decls, dono: (arq: string) => string): {de: string, para: string, simbolos: string[]}[]` (`dono` devolve nome da fatia, `"core"` ou `"legado"`); `export function violacoes(decls, fatias): {fatia, arquivo, simbolo, dona, tipo: "uso-nao-exposto" | "escrita-externa" | "fatia-nao-declarada"}[]` (símbolos de `core` e de `legado` nunca são violação como alvo; arquivos `legado` nunca são origem); `export function globaisPorFatia(decls, dono): Map<string, number>` (declarações com `mut`).

- [ ] **Step 1: Escrever testes** em `tests/unit/fronteiras.test.mjs` com `decls` montado à mão: uso de símbolo não listado em `expoe` da dona → `uso-nao-exposto`; uso de símbolo exposto sem a dona em `usa` → `fatia-nao-declarada`; escrita em variável de outra fatia → `escrita-externa`; uso de símbolo de `core` → nada; duas declarações com o mesmo nome em arquivos diferentes → `analisar` lista em `duplicadas` e o CLI sai com erro.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** as três funções e a CLI `node tools/checar_fronteiras.mjs` (relatório; exit 1 se houver `duplicadas` ou violação em fatia com `fronteira: "falha"`; fatia `aponta` só lista). Estender `grafo_puro.mjs` conforme Interfaces.
- [ ] **Step 4: Medir o estado atual.** `node tools/acoplamento.mjs --escrever` grava `docs/acoplamento-base.md` (matriz arquivo→arquivo e proposta de agrupamento pela tabela do spec); `node tools/checar_fronteiras.mjs --base` grava `docs/fronteiras-base.json` com globais mutáveis por arquivo (confirma 53).
- [ ] **Step 5: Revisar a tabela de fatias** do spec contra `docs/acoplamento-base.md`: se um arquivo tem mais acoplamento com outra fatia do que com a proposta, ajustar a tabela no spec (uma nota "Ajuste após medição") e seguir o ajuste nas Tarefas de fatia.
- [ ] **Step 6: Rodar testes, `npm run lint`; ligar `checar_fronteiras.mjs` ao `npm run lint`. Commit.**

### Task 5: Mapa gerado e integração com a suíte

**Files:**
- Create: `tools/mapa.mjs`, `tests/unit/mapa.test.mjs`, `docs/ARQUITETURA.md` (gerado)
- Modify: `tests/run_all.py`, `package.json`

**Interfaces:**
- Produces: `export function gerarMapa(fatias: Fatia[], arestas, globais: Map<string, number>): string` (Markdown: tabela de fatias com descrição, arquivos, `expoe`, `usa`, quem usa a fatia, testes, globais mutáveis, estado da fronteira; ordem determinística) e a CLI `node tools/mapa.mjs --escrever | --conferir` (`--conferir` sai com 1 se `docs/ARQUITETURA.md` diferir do gerado). Script `npm run mapa`.

- [ ] **Step 1: Escrever testes:** `gerarMapa` com duas fatias fictícias contém cada nome, cada símbolo de `expoe` e a aresta `de→para`; chamar duas vezes devolve texto idêntico.
- [ ] **Step 2: Rodar e ver falhar. Step 3: Implementar.**
- [ ] **Step 4: Integrar à suíte:** `run_all.py` roda no início `node tools/fatias.mjs --validar`, `node tools/checar_fronteiras.mjs`, `node tools/mapa.mjs --conferir` e `node --test tests/unit/*.test.mjs`, tratando exit não zero como falha.
- [ ] **Step 5: Verificar o review focus 5:** `python tests/run_all.py --so=t18` **sem** `CP_BACKUP` e sem `--permitir-pulos` deve sair com código não zero.
- [ ] **Step 6: `node tools/mapa.mjs --escrever`; commit.**

### Task 6: Registro de ações de clique e `CLAUDE.md`

**Files:**
- Create: `src/core/acoes.js`, `tests/unit/acoes.test.mjs`, `CLAUDE.md`
- Modify: `src/js/30-eventos-mouse-e-clique.js` (o `switch(a)` do listener `click`, linhas 97 em diante), `src/_ordem.txt` (linha nova `core/acoes.js`)

**Interfaces:**
- Produces: `export function registrarAcoes(registro: object, fatia: string, mapa: Record<string, (ctx) => void | false>): void` (lança `Error` com o nome da ação e das duas fatias se a ação já existe). No navegador: `const ACOES = {}` declarada uma vez (em `src/js/30-…`, antes do listener). O listener monta `ctx = {t, e, a, C, tr, ci, bi}` (os valores já calculados hoje antes do `switch`) e faz `if (ACOES[a]) { if (ACOES[a](ctx) === false) return } else switch (a) { … }`. Convenção para quem migra um `case`: `break` vira `return`; `return` (que pula o código depois do `switch`) vira `return false`. O `snapCfg`/`CFG_UNDO` e o código pós-`switch` ficam no listener.

- [ ] **Step 1: Escrever testes:** registrar a mesma ação em duas fatias lança erro que cita as duas; registrar ações distintas funciona; `ACOES` fica com todas as chaves.
- [ ] **Step 2: Rodar e ver falhar. Step 3: Implementar `registrarAcoes`; adaptar o listener como em Interfaces, sem migrar nenhum `case` ainda.**
- [ ] **Step 4: Verificar:** HTML idêntico não vale aqui (o código mudou); então suíte completa verde com `CP_BACKUP`.
- [ ] **Step 5: Escrever `CLAUDE.md`** (curto): comandos de build, teste, lint, mapa, hash; ponteiro para `docs/ARQUITETURA.md`; armadilhas dos Global Constraints; regra "mexa só na pasta da fatia; para usar outra fatia, use o que ela expõe em `FATIA.json`; `expoe` novo exige justificativa no `LEIA-ME.md` da dona". Máximo 60 linhas.
- [ ] **Step 6: Commit.**

---

## Etapa 2: fechar o núcleo

### Task 7: Teste de caracterização de `gerar` com o backup real

**Files:**
- Create: `tests/t_caracterizacao_gerar.py` (Playwright), `tests/unit/caracterizacao_gerar.test.mjs`
- Test data: nada de dados reais no repositório; o teste lê `CP_BACKUP`.

**Interfaces:**
- Produces: o teste Python carrega o app com o backup, lê `lanc` e `config`, chama no app `gerar(...)`/`saidaLinhas(...)` para cada peça e grava o resultado em arquivo temporário JSON; o teste Node (executado pelo mesmo `run_all.py` com `CP_BACKUP` definido, pulado sem ele) lê o mesmo backup, chama as funções do núcleo e compara linha a linha.

- [ ] **Step 1: Escrever o teste Python** (copiar o padrão de carga de backup de `tests/t18.py`) que exporta `{id: linhas}` por peça para `%TEMP%/cp_golden_linhas.json`.
- [ ] **Step 2: Escrever o teste Node** que importa os módulos de `src/core/` e compara; neste ponto compara só o que o núcleo já calcula (`saidaLinhas`, `calcBanho`, `pesoLinha`) e **falha** para `gerar` (ainda no app).
- [ ] **Step 3: Rodar** (`CP_BACKUP=... python tests/run_all.py --so=caracterizacao`) e ver o comportamento esperado: o trecho de `gerar` falha.
- [ ] **Step 4: Commit** com o teste marcado como esperado-falho (`test.todo`) para `gerar`; a Tarefa 8 o ativa.

### Task 8: `conjSync` e `fixarRefs` sem DOM; `gerar` vai ao núcleo

**Files:**
- Modify: `src/js/18-conjunto.js` (`conjSync`), `src/js/12-motor-linhas.js` (`fixarRefs`, `renumerarRefs`, `gerar`), `src/core/dominio.js`, `tests/unit/caracterizacao_gerar.test.mjs`

**Interfaces:**
- Produces: em `src/core/dominio.js`: `conjCalcular(S, f)` (cálculo de `conjSync` sem tocar no formulário) e `gerar$(S, ...)` (mesma assinatura atual de `gerar` com `S` na frente, como as 108 funções já migradas). Em `src/js/`: `conjSync(f)` passa a chamar `conjCalcular` e só então escreve no DOM; `gerar(...)` vira adaptador (`gerar$(S, ...)`). Segue o padrão de `src/js/00-adaptadores-nucleo.js` (gerado por `tools/injetar_estado.mjs`).

- [ ] **Step 1: Ler** `conjSync`, `fixarRefs` e `gerar` e listar, num comentário no commit, cada acesso ao DOM e cada escrita em `S.form`.
- [ ] **Step 2: Ativar no teste** o `gerar$` (remover `todo`); rodar e ver falhar ("gerar$ is not a function").
- [ ] **Step 3: Separar** o cálculo em `conjCalcular` e mover `fixarRefs`/`renumerarRefs`/`gerar` com `tools/extrair_para_core.mjs` e `tools/injetar_estado.mjs`; o que tocar no DOM fica em `conjSync` no `src/js`.
- [ ] **Step 4: Rodar** `node --test tests/unit/*.test.mjs` com `CP_BACKUP` e a suíte completa; `node tools/checar_ordem.mjs`.
- [ ] **Step 5: Commit.**

### Task 9: Ciclos do núcleo e fim da ponte `_fonte.js`

**Files:**
- Modify: `src/core/colunas.js`, `src/core/formulas.js`, `src/core/utilidades.js`, `src/core/configuracao.js`, `tests/_fonte.js` (apagar), os 12 testes que o usam (`grep -l "_fonte" tests`)

**Interfaces:**
- Produces: nenhum `import` circular entre módulos de `src/core/`; testes importam módulos diretamente (`import { f } from "../src/core/<modulo>.js"`).

- [ ] **Step 1: Escrever teste** em `tests/unit/sem_ciclos.test.mjs` que lê os `import` de `src/core/*.js` e falha se houver ciclo (DFS). Ver falhar.
- [ ] **Step 2: Desfazer os ciclos** movendo `DEFAULT_CONFIG` e `semAc` para `src/core/configuracao.js`; ajustar `src/_ordem.txt` e rodar `node tools/checar_ordem.mjs`.
- [ ] **Step 3: Migrar os 12 testes** de `tests/_fonte.js` para import direto, um por vez, rodando cada um (`--so=<nome>`); apagar `_fonte.js` no fim.
- [ ] **Step 4: Suíte completa verde; commit.**

---

## Fatias

### Procedimento de fatia (aplicado por cada Tarefa 10 a 18)

Cada tarefa abaixo traz **a fatia, os arquivos de origem e o que pede atenção**; o procedimento é o mesmo e não se repete:

1. `node tools/acoplamento.mjs --fatia=<nome>` para ver de quem a fatia depende e quem depende dela (decide `usa` e `expoe`).
2. **Mover sem mudar nada:** `git mv src/js/<arq> src/fatias/<nome>/<arq>` e trocar a linha em `src/_ordem.txt` pelo novo caminho, **na mesma posição**. Arquivos de que só uma parte pertence à fatia são divididos com `tools/dividir_arquivo.mjs` (Tarefa 2). `python tools/normalizar_eol.py`; `python tools/hash_html.py` deve dar **o hash de antes**. Se não der, a ordem mudou: desfazer.
3. **Reordenar só se for preciso** (para agrupar a fatia): rodar `node tools/checar_ordem.mjs` e a suíte; o hash muda, então a prova passa a ser suíte verde mais teste do fluxo no navegador.
4. **Contrato:** escrever `FATIA.json` (`fronteira: "aponta"`, `testes` com os testes que cobrem os símbolos da fatia, achados por `grep -l` nos arquivos de `tests/`) e `LEIA-ME.md` (20 a 40 linhas: para que serve, fluxos principais, armadilhas, pendências da auditoria que a tocam). `node tools/fatias.mjs --validar`.
5. **Migrar eventos:** mover os `case` do `switch(a)` de `src/js/30-…` que pertencem à fatia para `src/fatias/<nome>/acoes.js` via `registrarAcoes(ACOES, "<nome>", {…})` (convenção da Tarefa 6); listeners de `31` a `35` cujo alvo é da fatia viram arquivos da fatia com `dividir_arquivo.mjs`.
6. **Fronteira:** `node tools/checar_fronteiras.mjs` lista as violações; resolver cada uma (acesso legítimo → entra em `expoe` com justificativa no `LEIA-ME.md`; acesso indevido → chamar a função da dona; escrita em variável alheia → função da dona). Depois pôr `"fronteira": "falha"`.
7. **Estado:** globais mutáveis que só a fatia usa viram um objeto da fatia (`estado<Nome>`); contar com `node tools/checar_fronteiras.mjs --base` e registrar a nova contagem na seção "Registro de execução" de `PLANO-TRANSICAO-SAAS.md`.
8. **Verificar:** `npm run lint`, `node tools/mapa.mjs --escrever`, suíte completa com `CP_BACKUP`, e as telas da fatia no celular a 390 px (`python tools/ao_vivo.py`, depois `python -m http.server 8765 --directory ../arquivo/ao-vivo`, abrir `/app.html`).
9. **Commit** (`Fatia <nome>: …`). Cada fatia é um commit (ou poucos) e deixa o app funcionando.

### Task 10: Fatia `exportacao`

**Files:** origem `src/js/28-exportar.js`, `19b-assistente-outro-sistema.js`, `29-importar-e-copia.js`; destino `src/fatias/exportacao/`.
- [ ] **Steps 1 a 9 do procedimento.** Atenção: `gerarExport`/`montarXlsx` dependem de `gerar$` no núcleo (Tarefa 8) e a corrida de clipboard (AUD-D-001) vai para o `LEIA-ME.md` como problema conhecido, sem correção aqui. `expoe` esperado: `gerarExport`, `baixar`, `copiar`, `importar`, `backup`, `restaurar` (ajustar pela medição).

### Task 11: Fatia `tabelas`

**Files:** origem `src/js/19d-tabelas-salvas.js`; destino `src/fatias/tabelas/`.
- [ ] **Steps 1 a 9 do procedimento.** Atenção: usa `idbOp` e índices do armazenamento; registrar em `usa` a fatia `armazenamento` mesmo antes de ela existir (como `legado`, o checador ignora até a Tarefa 16).

### Task 12: Fatia `configuracao`

**Files:** origem `src/js/19-configuracoes-e-catalogo.js`, `36-cadastros-salvar.js`, `37-moeda.js`; destino `src/fatias/configuracao/`.
- [ ] **Steps 1 a 9 do procedimento.** Atenção: `37-moeda.js` só dispara `input`, nunca `change` (armadilha); `cadSalvar`/`cadConferir` tocam `romaneio` (resolver via `expoe` da fatia dona na Tarefa 14).

### Task 13: Fatias `fotos` e `notafiscal`

**Files:** origem `src/js/23-fotos-imgbb-e-nota-fiscal.js`, `27-fotos-escolher-colar.js` (parte de fotos), parte de `22-importar-pdf-romaneio.js` (`miniFoto`, `imgCanvas`, `melhorarFoto`, `abrirZoom`); destino `src/fatias/fotos/` e `src/fatias/notafiscal/`.
- [ ] **Steps 1 a 9 do procedimento, uma fatia de cada vez** (dividir `23` entre fotos e nota fiscal). Atenção: se a medição da Tarefa 4 mostrar acoplamento alto entre as duas, manter uma fatia só e ajustar o spec.

### Task 14: Fatia `romaneio`

**Files:** origem `src/js/19c-colar-romaneio.js`, `21-edicao-em-lote-e-revisao.js`, `21b-romaneio-extras.js`, `25-relatorio-romaneio.js`, restante de `22-importar-pdf-romaneio.js`, parte de `34-filtros-importacao-e-cartoes.js` (`imp*`); destino `src/fatias/romaneio/`.
- [ ] **Steps 1 a 9 do procedimento.** Atenção: é a maior fatia (`21` tem 314 linhas e 68 KB; dividir em arquivos de cerca de 400 linhas legíveis por assunto: lote, revisão, insumos, fotos do romaneio, relatório); AUD-C-001, AUD-C-003 e AUD-C-004 vão para o `LEIA-ME.md`.

### Task 15: Fatia `planilha`

**Files:** origem `src/js/15-planilha.js`, `16-selecao.js`, `24-ui-numeracao-e-colunas.js`, parte de `34-…` (filtros, cartões, `pilula*`); destino `src/fatias/planilha/`.
- [ ] **Steps 1 a 9 do procedimento.** Atenção: `15` tem linhas de até 2.900 caracteres de HTML em string; dividir em funções de template pequenas só se a linha passar de 160 caracteres (meta do spec), com o teste do fluxo correspondente.

### Task 16: Fatia `lancamento`

**Files:** origem `src/js/12-motor-linhas.js` (o que sobrar após a Tarefa 8), `13-modelo-e-variacoes.js`, `17-lancamento.js`, `18-conjunto.js`, `26-acoes.js`, parte de `27-…` (`adicionar`, `editar`, `desfazer`, `cancelar`), parte de `31-eventos-campos-e-grade.js`; destino `src/fatias/lancamento/`.
- [ ] **Steps 1 a 9 do procedimento.** Atenção: é a fatia mais acoplada ao estado (`S.form`, `editId`, `rascunho`, `quick`); migrar os globais de edição para `estadoLancamento`; AUD-A-007 (variação) vai para o `LEIA-ME.md`.

### Task 17: Fatia `armazenamento` e `store`

**Files:** origem `src/js/14-persistencia.js`, `20-armazenamento-idb.js`, `21c-diagnostico-dados.js`; destino `src/fatias/armazenamento/` e `src/store/`.

**Interfaces:**
- Produces: `src/store/` reúne **todo** acesso a `localStorage` e IndexedDB (hoje espalhado por 14 arquivos; contar com `grep -rln "localStorage\|indexedDB" src`) por funções nomeadas (`lerPref(chave)`, `gravarPref(chave, valor)`, `idbOp(...)` e as de diário/quota existentes), **sem mudar formato, chaves, diário nem comportamento**, sem API assíncrona nova e sem UUID.

- [ ] **Step 1: Escrever teste** em `tests/unit/store_unico.test.mjs` que varre `src/` e falha se `localStorage` ou `indexedDB` aparecer fora de `src/store/` (lista de exceções vazia no fim). Ver falhar, com a lista atual de arquivos.
- [ ] **Steps 2 a 9 do procedimento** (fatia `armazenamento`), depois mover os acessos restantes arquivo por arquivo para `src/store/`, rodando a cada arquivo os testes de armazenamento: `t58`, `t59`, `t60`, `t61`, `t62`, `t63`, `t94` e `t80` com `CP_BACKUP`. Cuidado máximo: é onde se perde dado; conferir duas abas, quota e restauração.
- [ ] **Step final:** o teste `store_unico` passa sem exceções; commit.

### Task 18: Fatia `app` e fechamento

**Files:** origem `src/js/33-janelas-busca-e-paleta.js`, `35-visoes-menu-e-final.js`, `21d-novidades.js`, `00-adaptadores-nucleo.js` (permanece gerado), restos de `30`–`32`; destino `src/fatias/app/`.

- [ ] **Steps 1 a 9 do procedimento.** Atenção: `menuCelularDoLateral` gera o menu do celular a partir do lateral; manter uma definição só.
- [ ] **Fechamento:** `src/js/` deve estar vazio (ou só com `00-adaptadores-nucleo.js`); `npm run lint:estrito` sem avisos (ou lista residual documentada); contagem final de globais registrada; `node tools/mapa.mjs --escrever`; `python tools/publicar.py` e `python tools/verificar_pacote.py` (gerar, **não publicar**); atualizar a seção "Registro de execução" e o `PROMPT-CONTINUACAO-SAAS.md`; commit.

---

## Auto-revisão

- **Cobertura do spec:** estrutura de pastas (T3, procedimento), mapa gerado (T5), lint de fronteira em modo aponta→falha (T4, procedimento 6), `CLAUDE.md` (T6), estado por fatia (procedimento 7), Etapa 2 (T7 a T9), fatias na ordem do spec, exceto que o spec lista `armazenamento` com o `store` no fim (T17) e `app` por último (T18), `store` concentrando acesso (T17), fechamento (T18). Medição de acoplamento antes de fixar fatias (T4).
- **Chamadas nomeadas consistentes:** `lerOrdem`, `carregarFatias`, `validarFatias`, `donoDoArquivo`, `arestas`, `violacoes`, `globaisPorFatia`, `gerarMapa`, `registrarAcoes`, `dividir`, `conjCalcular`, `gerar$` aparecem com a mesma assinatura onde são usadas.
- **Decisão do autor:** `FATIA.json` ganhou o campo `fronteira` para ligar o modo "falha" por fatia (o spec só descrevia o comportamento).
