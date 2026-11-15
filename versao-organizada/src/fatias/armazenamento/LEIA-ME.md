# Fatia armazenamento

## Para que serve
Onde os dados ficam e como voltam: `salvar` (agenda 600 ms) e `flush` (conta, se houver, e depois `cadpecas4` no armazenamento local, sem as miniaturas, que vao ao IndexedDB),
`flushJa` ao fechar/esconder a aba, historico de desfazer (`HIST`, `REDO`, `histNota`, `histIni`, `desfazer`), dados danificados (`dadosCorrompidos`: nada e gravado ate a pessoa escolher),
pontos de restauracao (`pontoSalvar`, `pontoAuto`, `pontoRestaurar`), backup em pasta (`bkPasta`, `bkEscrever`, `bkAuto`), backup completo (`bkMontar`, `backupTotal`) e restauracao
com registro (`aplicarBackupTotal` -> `bkPrepararJournal` -> grava -> `flush` -> indices; falha reverte por `bkReverterJournal`), exclusao com diario (`romExcluirConfirmado`,
`exReverter`, `exRecuperar`), indice e rascunho de romaneios salvos (`romIndex`, `romSalvar`, `romRetomar`, `romAbrirSalvo`, `romHist*`), bloqueios entre abas, aviso de outra aba e diagnostico.

## Arquivos (ordem de carga)
`14-persistencia.js` (`estadoArmazenamento`, salvar/flush, historico, pontos, backup em pasta, migracoes, `carregar`), `20-armazenamento-idb.js` (romaneios salvos, diario de exclusoes,
backup completo e restauracao, rascunho do romaneio), `21c-diagnostico-dados.js`, `acoes.js` (bk-*, ponto-*, diag-dados, backup-total). Vindos do legado na Tarefa 18: `21d6-lembrete-backup.js`
(`backupLembrarPosCriar`, depois de criar pecas do romaneio), `27b2-desfazer.js` (`desfazer`/`desfazer0`), `32-ler-indices.js` (le `ROMS`/`TABS`/`AUTOR`/`romTem`/`relTem` na abertura),
`33c-lembrete-backup.js` (`lembreteBackup`, chamado pela abertura em `app/33c-abertura.js`) e `33c-outra-aba.js` (eventos `storage`: outra aba gravou `cadpecas4` ou o rascunho do romaneio).

## src/store (acesso direto ao armazenamento)
Nenhum arquivo fora de `src/store/` toca o armazenamento do navegador (teste `tests/unit/store_unico.test.mjs`). `store/local.js`: `lerPref`, `gravarPref`, `removerPref`,
`lerSessao`/`gravarSessao`/`removerSessao`, `ehAreaLocal`. `store/idb.js`: `idbAbrir`, `idbOp`, `idbPut/Get/Del`, `exPreparar`, `exRestaurar`, `bkLerBanco`. Funcoes finas: o try/catch fica em quem chama.
`store/prefs.js`: preferencias de tela e de controle por nome (`prefLer`/`prefGravar`/`prefRemover`, tabela `PREFS`; mesmas chaves `cadpecas-*`); chaves de dado de negocio nao entram ali. `store/eventos.js`: `armOuvir`/`armEmitir` com os eventos `salvo`, `erro`, `conflito` e `cota`; o `flush` emite (texto e `erro`, e `toast` em `cota`) e a casca `app` (`33d-avisos-armazenamento.js`) chama `setStatus`/`toast`. Emissao sincrona, mesmos textos. O `salvar()` em si nunca mostrou toast nem redesenhou. Inventario das chaves: `docs/inventario-store.md` (`node tools/inventario_store.mjs`).
`store/store-local.js`: `storeLocal`, interface assincrona (`getConfig`, `saveConfig`, `listPecas`, `putPeca`, `deletePeca`, `listRomaneios`, `getRomaneio`, `putRomaneio`, `putFoto`, `getFoto`, `listTabelas`, `exportBackup`, `importBackup`) sobre as mesmas chaves e lojas. So persiste: o indice do romaneio vem pronto de quem chama (`putRomaneio(rec, indice)`); `exportBackup`/`importBackup` chamam ganchos ligados aqui em `20-armazenamento-idb.js` (`bkMontar`, `aplicarBackupTotal`). Ainda nenhum chamador do app a usa (passo 3.5); a exclusao com diario segue aqui. Contrato reutilizavel: `tests/contrato_store.js`, rodado por `t121_store_contrato.py`. Risco para o 3.5: `putPeca`/`saveConfig` regravam o blob `cadpecas4` inteiro, igual ao `flush`; trocar chamadores exige definir quem grava por ultimo. Requisitos do 3.5: (1) `putRomaneio` NAO pega o bloqueio `cadpecas-exclusoes` que o app usa (`exSalvarComLock`) nem faz o diario de exclusoes; o chamador deve gravar dentro desse bloqueio, senao uma exclusao concorrente pode ressuscitar o romaneio ou deixar indice sem registro e o retrato do `bkMontar` perde a consistencia. (2) `putPeca`/`saveConfig`/`deletePeca` recusam (`dados danificados`) quando `cadpecas4` esta danificado, para nao passar por cima do aviso de `dadosCorrompidos`; leituras lancam se o armazenamento estiver bloqueado e `getRomaneio`/`getFoto` rejeitam quando o IndexedDB falha (ausente e `null`). (3) `importBackup` devolve `true` so quando a restauracao foi aplicada (`false` nas falhas; o motivo continua no toast).
Funil da Etapa 3 (3.5): `store/dados.js` (`dadoLer`/`dadoGravar`/`dadoRemover`, lista fechada `DADOS` das chaves de dado) e `store/banco.js` (`bancoLer`/`bancoGravar`/`bancoApagar`/`bancoChaves`/`bancoTodos`/`bancoAdicionar`, lojas `fotos`, `roms`, `tabs`, `pontos`) sao o que as fatias chamam; `lerPref`/`gravarPref`/`removerPref` e `idb*` ficam privados do store (teste `store_unico`). Mesma semantica de antes (sincrono, `null` do IndexedDB em falha); chave de dado ou loja fora da lista lanca. `storeLocal` (async) segue sem chamadores: adota-lo exige `flush` sincrono em pagehide, leitura sincrona na abertura e gravacao dentro de `exSalvarComLock`, entao fica para a Etapa 6.
Ficam fora do store (aceito): `navigator.storage` (persistencia/estimativa), `showDirectoryPicker` (backup em pasta) e os metodos de object store usados dentro dos callbacks de `idbOp`.

## Estado (globais 58 para 51)
`estadoArmazenamento = {snapF, snapE, rawCorrompido, avisoMem, avisoIdbT, bkUsoLiberar, bkUsoPedido}`. Seguem globais (outras fatias e a base leem ou gravam): `db`, `dirty`, `sT`, `chain`,
`HIST`, `REDO`, `snapL`, `snapC`, `restaurando`, `conflito`, `corrompido`, `ftSalvas`, `ROMS`, `TABS`, `ARQ`, `AUTOR`, `tabArm`, `romArm`, `romTem`, `romST`, `romInfo`, `romConflito`, `romGravP`, `histSep`.

## expoe (quem usa de fora)
`salvar` (quase todas), `flush`/`flushJa`/`dirty`/`setStatus`/`histNota`/`histIni`/`salvarCancelarAgendado`/`salvarEncadear` (configuracao grava ja), `definirTabs`/`definirArq`/`definirAutor` (tabelas),
`exComLock`/`exReverter`/`exSalvarComLock`/`ftSalvas`/`TABS`/`ARQ`/`AUTOR`/`HIST`/`REDO`/`snapL` (tabelas, fotos, app), `rom*`/`ROMS` (romaneio, configuracao, lancamento), `pontoAuto`/`pontoAviso`/`pontosCarregar`,
`bkUso*`, `restaurando`, `snapC`, `migrarGrades`, `desfazer` (planilha, configuracao, romaneio, lancamento, app), `backupLembrarPosCriar` (romaneio 25), `lembreteBackup` (app; a ferramenta nao ve: chamada em bloco de nivel superior).

## Fronteira "aponta": ciclo sem corte limpo (25 violacoes pendentes, eram 20)
Todas as fatias usam `salvar`, entao `armazenamento` nao declara nenhuma em `usa`. Usa sem declarar: `arqRef`, `gravarIdx`, `histSugAgendar`, `pontosIds`, `setAutor`, `tabIndex`, `tabsMigrar`,
`varrerFotos` (tabelas), `renderTopo`, `estadoPlanilha` (planilha), `renderForm`, `avisoEdicao`, `editar` (lancamento), `renderRom`, `relTem` (escreve), `impData`, `ROM` (le e escreve) (romaneio),
`renderCfg`, `impactoAgendar` (configuracao), `obterDL` (exportacao). Novas: `editar`/`estadoPlanilha` de 27b2, `impactoAgendar` (agora da configuracao) e `ROM` (agora da romaneio). Corte futuro: indices de tabelas para ca e um gancho unico de redesenhar.
## Armadilhas
- `flush` devolve `true` so com gravacao confirmada; `conflito`/`corrompido` bloqueiam toda gravacao; restaurar exige `navigator.locks` (`cadpecas-uso` exclusivo).
- Chaves (`cadpecas4`, `cadpecas-rom`, `cadpecas-roms`, `cadpecas-tabs`, `cadpecas-rel`...) e textos de aviso sao lidos por testes e backups antigos: nao renomeie.
## Pendencias da auditoria (conhecidas, NAO corrigidas)
AUD-A-001 (backup leve pode passar do limite de restauracao), AUD-A-002 (`migrarGrades` liga grades independentes), AUD-A-003 (reversao da restauracao pode afirmar sucesso sem conferir),
AUD-A-004 (retorno de `romIndex`/`gravarIdx` ignorado), AUD-A-005 (lembrete conta backup inadequado como recente), AUD-A-006 (fechar a aba durante gravacao pendente pode perder lancamento),
AUD-A-008 (exclusao segue sem o ponto prometido; `pontoAuto`). Linhas acima de 160 caracteres em quase todo 14 e 20 (minificado a mao): nao reformatadas.
