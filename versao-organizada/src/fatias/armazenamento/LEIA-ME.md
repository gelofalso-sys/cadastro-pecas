# Fatia armazenamento

## Para que serve
Onde os dados ficam e como voltam: `salvar` (agenda 600 ms) e `flush` (conta, se houver, e depois `cadpecas4` no armazenamento local, sem as miniaturas, que vao ao IndexedDB),
`flushJa` ao fechar/esconder a aba, historico de desfazer (`HIST`, `REDO`, `histNota`, `histIni`), dados danificados (`dadosCorrompidos`: nada e gravado ate a pessoa escolher),
pontos de restauracao (`pontoSalvar`, `pontoAuto`, `pontoRestaurar`), backup em pasta (`bkPasta`, `bkEscrever`, `bkAuto`), backup completo (`bkMontar`, `backupTotal`) e restauracao
com registro (`aplicarBackupTotal` -> `bkPrepararJournal` -> grava -> `flush` -> indices; falha reverte por `bkReverterJournal`), exclusao com diario (`romExcluirConfirmado`,
`exReverter`, `exRecuperar`), indice e rascunho de romaneios salvos (`romIndex`, `romSalvar`, `romRetomar`, `romAbrirSalvo`, `romHist*`), bloqueios entre abas e diagnostico.

## Arquivos (ordem de carga)
`14-persistencia.js` (`estadoArmazenamento`, salvar/flush, historico, pontos, backup em pasta, migracoes `migrarGrades`/`migrarAnel`, `carregar`), `20-armazenamento-idb.js`
(romaneios salvos, diario de exclusoes, backup completo e restauracao, rascunho do romaneio), `21c-diagnostico-dados.js` e `acoes.js` (bk-*, ponto-*, diag-dados, backup-total). O cursor da descricao (fim do antigo 21c) foi para `lancamento/21c2-descricao-cursor.js`.

## src/store (acesso direto ao armazenamento)
Nenhum arquivo fora de `src/store/` toca o armazenamento do navegador (teste `tests/unit/store_unico.test.mjs`). `store/local.js`: `lerPref`, `gravarPref`, `removerPref`,
`lerSessao`/`gravarSessao`/`removerSessao`, `ehAreaLocal` (evento storage). `store/idb.js`: `idbAbrir`, `idbOp`, `idbPut/Get/Del`, `exPreparar`, `exRestaurar`, `bkLerBanco`.
As funcoes sao finas e lancam como o navegador: o try/catch, as chaves e o formato continuam em quem chama. Chave nova ou formato novo: nao (sem UUID, sem API nova).

## Estado (globais 58 para 51)
`estadoArmazenamento = {snapF, snapE, rawCorrompido, avisoMem, avisoIdbT, bkUsoLiberar, bkUsoPedido}` (antes globais soltos). Seguem globais
(outras fatias e o legado leem ou gravam: desfazer 27b2, 30, 32, 33c): `db`, `dirty`, `sT`, `chain`, `HIST`, `REDO`, `snapL`, `snapC`, `restaurando`, `conflito`, `corrompido`, `ftSalvas`, `ROMS`, `TABS`, `ARQ`, `AUTOR`, `tabArm`, `romArm`, `romTem`, `romST`, `romInfo`, `romConflito`, `romGravP`, `histSep`.

## expoe (quem usa de fora)
`salvar` (quase todas as fatias), `flush`/`flushJa`/`dirty`/`setStatus`/`histNota`/`histIni`/`salvarCancelarAgendado`/`salvarEncadear` (cadastros 36 gravam ja),
`definirTabs`/`definirArq`/`definirAutor` (a fatia tabelas grava TABS/ARQ/AUTOR por elas), `exComLock`/`exReverter`/`exSalvarComLock`/`ftSalvas`/`TABS`/`ARQ`/`AUTOR`/`HIST`/`REDO`/`snapL`
(tabelas e fotos), `rom*`/`ROMS` (romaneio, configuracao, lancamento), `pontoAuto`/`pontoAviso`/`pontosCarregar`, `backupTotal`, `bkUso*`, `undoBtns`, `restaurando`, `snapC`, `migrarGrades`.

## Fronteira "aponta": ciclo sem corte limpo (20 violacoes pendentes)
Todas as fatias usam `salvar`, entao `armazenamento` nao declara nenhuma em `usa`. Usa sem declarar: `arqRef`, `gravarIdx`, `histSugAgendar`, `pontosIds`, `setAutor`, `tabIndex`,
`tabsMigrar`, `varrerFotos` (tabelas), `renderTopo`, `estadoPlanilha` (planilha), `renderForm`, `avisoEdicao` (lancamento), `renderRom`, `relTem` (escreve), `impData` (romaneio), `renderCfg` (configuracao), `obterDL` (exportacao).
Corte futuro: indices de tabelas para ca e um gancho unico de redesenhar.

## Armadilhas
- `flush` devolve `true` so com gravacao confirmada; `conflito`/`corrompido` bloqueiam toda gravacao; restaurar exige `navigator.locks` (`cadpecas-uso` exclusivo).
- Chaves (`cadpecas4`, `cadpecas-rom`, `cadpecas-roms`, `cadpecas-tabs`, `cadpecas-rel`...) e textos de aviso sao lidos por testes e backups antigos: nao renomeie; `bkMontar` compara as chaves locais antes/depois para marcar copia incompleta (corrida entre abas).

## Pendencias da auditoria (conhecidas, NAO corrigidas)
AUD-A-001 (backup leve pode passar do limite de restauracao), AUD-A-002 (migracao de grades em `migrarGrades` liga grades independentes), AUD-A-003 (reversao da restauracao pode
afirmar sucesso sem conferir), AUD-A-004 (retorno de `romIndex`/`gravarIdx` ignorado ao salvar romaneio), AUD-A-005 (lembrete conta backup inadequado como recente),
AUD-A-006 (fechar a aba durante gravacao pendente pode perder lancamento), AUD-A-008 (exclusao segue sem o ponto prometido; `pontoAuto`). AUD-A-007 e da planilha/lancamento. Linhas acima de 160 caracteres em quase todo 14 e 20 (minificado a mao): nao reformatadas.
