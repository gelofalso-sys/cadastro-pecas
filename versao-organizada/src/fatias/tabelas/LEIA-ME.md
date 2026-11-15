# Fatia tabelas

## Para que serve
O historico de tabelas montadas ("Tabelas salvas") e tudo o que fica em volta dele:
- salvar a tabela atual com os romaneios usados (`tabSalvar`), restaurar (`tabRestaurar`, que antes guarda a atual),
  ver detalhes (`tabVer`), excluir com protecao de diario (`tabExcluirSalvo`), baixar CSV (`tab-csv`, via `tabCsv` do nucleo);
- ver um romaneio e seu historico a partir de uma tabela (`romVer`);
- indice de tabelas no `localStorage` (`gravarIdx`, `tabIndex`, `tabsMigrar`) e o historico de sugestoes (`histSugAgendar`);
- fotos: `fotoViva` / `varrerFotos` / `varrerTudo` apagam do IndexedDB so a foto que nenhuma peca, tabela salva, ponto de restauracao ou desfazer usa.

## Arquivos
- `19d-tabelas-indice-e-fotos.js`: `estadoTabelas`, sugestoes, autor, indice, varredura de fotos, migracao e exclusao.
- `19d2-tabelas-salvar-e-ver.js`: janelas e acoes de salvar, listar, restaurar, ver tabela e ver romaneio.
- `acoes.js`: cliques `tab-lista`, `tab-salvar-abrir`, `tab-salvar-ok`, `tab-ver`, `tab-del`, `tab-restaurar`, `tab-csv`, `rom-ver`.
- `repModal` (janela generica `.rep`) estava no meio de 19d e e usada por outras areas: ficou na base `src/js/19d1-modal-rep.js` (usada por exportacao, tabelas, armazenamento, lancamento e app; numa fatia criaria ciclo).

## Fluxos principais
1. Salvar: `tab-salvar-abrir` -> `tab-salvar-ok` -> `tabSalvar` (foto consistente do estado, grava em `tabs`, anota no indice; se o indice falha NAO limpa a tabela).
2. Restaurar: guarda a tabela atual como "Antes de restaurar" e depois repoe as pecas; a numeracao nunca volta atras.
3. Excluir: `tab-del` arma a tabela (`tabArm`, declarado na fatia `armazenamento`) e na segunda vez chama `tabExcluirSalvo`, que usa o lock e o diario do armazenamento.

## O que a fatia expoe e por que
`gravarIdx`, `tabIndex`, `tabsMigrar`, `arqRef`, `histSugAgendar`, `setAutor`: o armazenamento (20) e a persistencia (14) os usam.
`pontosIds`, `varrerFotos`: 14 (persistencia). `varrerTudo`, `estadoTabelas`: `app/33c-abertura.js` (abertura do app liga `estadoTabelas.semVarredura`).

## Armadilhas
- `tabArm`, `TABS`, `AUTOR`, `ARQ` sao declarados na fatia `armazenamento` (20): esta fatia grava `TABS`/`ARQ`/`AUTOR` por `definirTabs`/`definirArq`/`definirAutor`.
  Armazenamento do navegador so por `src/store` (`lerPref`/`gravarPref`, `idbOp`/`idbGet`/`idbPut`/`idbDel`, `exPreparar`).
- `tab-csv` grava o arquivo com `arqSalvar`, exposto pela fatia `romaneio` (por isso `usa` lista `romaneio`). `avisoEdicao` vem de `lancamento` (19d2), que tambem esta em `usa`.
- `estadoTabelas.semVarredura` impede a varredura de fotos (app aberto sem varrer, apos recuperacao de backup).
- Texto com quebra de linha: `String.fromCharCode(10)`.

## Pendencias conhecidas (auditoria, nao corrigidas)
- AUD-A-004: `gravarIdx` devolve falso se o localStorage falha e quem salva romaneio ignora o retorno; `tabsMigrar` reconstroi o indice de tabelas, nao o de romaneios.
- AUD-A-008: exclusao pode seguir sem o ponto de restauracao prometido (14/27, ao apagar peca).
- Linhas acima de 160 caracteres em quase todo o codigo da fatia (minificado a mao): reformatar antes de mexer a fundo.
- Usa `planilha`: `renderListas` (19d).
