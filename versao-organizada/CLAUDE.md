# Cadastro de Pecas (guia para IA)

App de arquivo unico (HTML) montado a partir de `src/`. Responda e comente em portugues.

## Comandos
- `npm run build` monta o HTML a partir de `src/` (tools/montar.py).
- `npm run test:unit` testes unitarios (node --test, tests/unit).
- `npm run lint` lint + validacao de FATIA.json + fronteiras entre fatias.
- `npm run mapa` regenera docs/ARQUITETURA.md (mapa gerado).
- `python tools/hash_html.py` hash do HTML montado (prova de refatoracao sem mudanca).
- Suite completa (alguns minutos):
  `CP_BACKUP="C:/Users/mathe/Downloads/cadastro-pecas-backup-completo-2026-11-08.json" python tests/run_all.py --paralelo=4`
  - `--so=<regex>` roda so os testes cujo nome casa.
  - A suite roda numa copia temporaria; nao suja o projeto.
  - Em `--paralelo` um teste Playwright diferente pode falhar por carga (ja vistos: t19, t62, t63_migracao_legada, t65_*, t69_*, t102, perf_5000 que estoura o tempo);
    rode sozinho (`--so=`) antes de tratar como falha real.
  - Requer Node >= 22.12 (testes `.js` fazem `require` de modulos ES de `src/core`; ver `engines` no package.json).

## Onde ler
- `docs/ARQUITETURA.md`: mapa das fatias e do nucleo.
- `docs/superpowers/specs/2026-11-14-organizacao-para-ia-design.md`: desenho da reorganizacao.
- `src/_ordem.txt`: ordem de carga unica (caminhos relativos a `src/`). Arquivo novo entra aqui.
- `src/fatias/<nome>/`: o codigo por funcionalidade (FATIA.json + LEIA-ME.md + acoes.js); `app` e a casca (janelas, menus, listeners globais).
- `src/js/`: so a base compartilhada (estado global `S`/`G`, utilidades, `render`, navegacao, `repModal`) e `00-adaptadores-nucleo.js` (gerado); motivo em `src/fatias/app/LEIA-ME.md`.
- `src/store/`: UNICO lugar que toca `localStorage`, `sessionStorage` e IndexedDB (scripts simples, carregados logo depois de `src/core`).
  Use: `prefLer`/`prefGravar`/`prefRemover` (preferencias de tela e de controle, `store/prefs.js`), `dadoLer`/`dadoGravar`/`dadoRemover` (chaves de dado, lista fechada em `store/dados.js`),
  `bancoLer`/`bancoGravar`/`bancoApagar`/`bancoChaves`/`bancoTodos`/`bancoAdicionar` (lojas do IndexedDB, `store/banco.js`), as operacoes com diario de exclusoes e backup `exPreparar`/`exRestaurar`/`bkLerBanco` (`store/idb.js`) e `storeLocal` (`store/store-local.js`, interface assincrona com contrato em `tests/contrato_store.js`; ainda sem chamadores no app), `lerSessao`/`gravarSessao`/`removerSessao`, `ehAreaLocal`, e os eventos `armOuvir`/`armEmitir` (`store/eventos.js`).
  Funcoes finas: lancam como o navegador, o try/catch fica em quem chama. Nao crie chave nem formato novo sem pedido.
  `tests/unit/store_unico.test.mjs` falha se `localStorage`, `sessionStorage`, `indexedDB` ou as funcoes finas (`lerPref`, `gravarPref`, `removerPref`, `idbGet`, `idbPut`, `idbDel`, `idbOp`, `idbAbrir`) aparecerem em outro `.js` de `src/` (inclusive comentario).
  Nas ferramentas (`tools/acoplamento.mjs`), `store/` e dono proprio, publico como o nucleo e nunca alvo de violacao.
- Acoes de clique: `ACOES` e `registrarAcoes` em `src/core/acoes.js`; cada fatia registra no seu `acoes.js`; o despacho (e o switch residual) fica em `src/fatias/app/30c-clique-acoes.js`.
  Ao migrar um `case`: `break` vira `return`; `return` que pulava o pos-switch vira `return false`.

## Armadilhas conhecidas
- Em texto gerado use `chr(10)` / `String.fromCharCode(10)`, nunca `\n` literal.
- CRLF no Windows: use `tools/normalizar_eol.py` e respeite o `.gitattributes`.
- Nunca dispare `change` a mao em campo; so `input` (ver `src/fatias/configuracao/37-moeda.js`).

- O checador de fronteiras nao ve usos dentro de `registrarAcoes({...})` nem de listeners de nivel superior: ao renomear ou mover um simbolo, procure-o tambem por grep.
- `src/core` e "puro" estruturalmente, mas `core/dominio.js` ainda usa `prefixoEmUso` (configuracao) e `uid` (legado) via globais do app.
- Testes manuais com PDF real (fora do run_all): `tests/pdf_real2.py`, `tests/auditoria_pdf_lote.py`.

## Regras de fatia
- Mexa so na pasta da fatia. Para usar outra fatia, use o que ela expoe em `FATIA.json`.
- `expoe` novo exige justificativa no `LEIA-ME.md` da fatia dona.

## Roteiro de uma tarefa (siga nesta ordem)
1. Ache a fatia em `docs/ARQUITETURA.md`; leia o `FATIA.json` e o `LEIA-ME.md` dela (fluxos, armadilhas, problemas conhecidos).
2. Mexa so nessa pasta. Dependencia de outra fatia: so pelo que ela expoe; se faltar, justifique no `LEIA-ME.md` da dona.
3. Teste rapido: os testes de `testes` do `FATIA.json` com `--so=<regex>`, mais `npm run test:unit` e `npm run lint`.
4. Fim da tarefa: suite completa uma vez (com `CP_BACKUP`); falha so em `--paralelo` roda sozinha antes de contar.
5. Pronto = lint sem `no-undef`, `node tools/fatias.mjs --validar` e `npm run mapa` em dia, suite verde, `LEIA-ME.md` atualizado se o contrato mudou e HTML regenerado (`npm run build`).

## Hash do HTML
- Mover arquivo sem mudar a posicao em `src/_ordem.txt` deixa o hash igual (`python tools/hash_html.py`): essa e a prova de que nada quebrou.
- Mudar codigo ou a ordem muda o hash; ai a prova e a suite verde.

## Pare e pergunte ao usuario
- Chave de armazenamento nova, mudanca no formato do backup ou no esquema do IndexedDB.
- O checador de fronteiras reclama de algo que parece legitimo, ou uma regra do `FATIA.json` conflita com o pedido.
- A tarefa exige mexer em `lancamento` ou `armazenamento` alem do pedido (ver pendencias).

## Trabalho grande
- Funcionalidade nova ou refatoracao: use brainstorm -> plano -> execucao por etapas (modelo em `docs/superpowers/specs/` e `docs/superpowers/plans/`), nao edite direto.

## Pendencias conhecidas (nao "conserte" no meio de outra tarefa)
- `lancamento` e `armazenamento` ficam em `fronteira: "aponta"` (26 e 22 violacoes pelo checador em 15/11/2026, listadas nos `LEIA-ME`; escritas em campos de `estadoX` por outra fatia nao entram na contagem: `docs/escritas-entre-fatias.md`, gerado por `node tools/escritas_entre_fatias.mjs --escrever`): o formulario e a tabela se redesenham e quase toda fatia usa `salvar`.
- Linhas acima de 160 caracteres (cerca de 1.600): adiado de proposito; reformatar quebra a prova de hash.
- Auditoria de 09/11: itens por fatia estao nos `LEIA-ME` como problemas conhecidos, nao corrigidos.

## Git
- Nao faca `git push` nem publique nada sem o usuario pedir.
