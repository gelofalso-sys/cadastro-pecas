# Inventario do store (gerado por tools/inventario_store.mjs)

Chaves literais `cadpecas*` em `src/` (inclui `store/prefs.js`). Classe: `dado` (negocio), `tela` (preferencia de tela), `controle` (backup/servicos). Gerado: nao edite a mao.

| chave | classe | ocorrencias | fatias | arquivos |
|---|---|---|---|---|
| `cadpecas-abertos` | tela | 1 | base | store/prefs.js |
| `cadpecas-autor` | tela | 1 | base | store/prefs.js |
| `cadpecas-big` | (nome de lock/banco, nao e chave) | 3 | base | store/banco.js, store/idb.js |
| `cadpecas-bk` | (nome de lock/banco, nao e chave) | 1 | armazenamento | fatias/armazenamento/acoes.js |
| `cadpecas-bk-em` | controle | 1 | base | store/prefs.js |
| `cadpecas-bk-ult` | controle | 1 | base | store/prefs.js |
| `cadpecas-cad-estrito` | controle | 2 | configuracao, base | fatias/configuracao/36-cadastros-salvar.js, store/prefs.js |
| `cadpecas-colw` | tela | 1 | base | store/prefs.js |
| `cadpecas-exclusoes` | (nome de lock/banco, nao e chave) | 4 | armazenamento | fatias/armazenamento/20-armazenamento-idb.js |
| `cadpecas-filtro` | tela | 1 | base | store/prefs.js |
| `cadpecas-imgbb` | controle | 1 | base | store/prefs.js |
| `cadpecas-imgbb-auto` | controle | 1 | base | store/prefs.js |
| `cadpecas-imgbb-consent-v1` | controle | 1 | base | store/prefs.js |
| `cadpecas-mostrar-vazias` | tela | 1 | base | store/prefs.js |
| `cadpecas-nf` | dado | 2 | core, base | core/notafiscal.js, store/dados.js |
| `cadpecas-numbar-aberta` | tela | 1 | base | store/prefs.js |
| `cadpecas-origem-ok` | controle | 1 | base | store/prefs.js |
| `cadpecas-persist-aviso` | controle | 1 | base | store/prefs.js |
| `cadpecas-recuperou-backup` | controle | 4 | app, armazenamento, base | fatias/app/33c-abertura.js, fatias/armazenamento/20-armazenamento-idb.js, store/local.js |
| `cadpecas-rel` | dado | 8 | armazenamento, romaneio, base | fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/armazenamento/32-ler-indices.js, fatias/romaneio/25-relatorio-romaneio.js, store/dados.js |
| `cadpecas-restauracao` | (nome de lock/banco, nao e chave) | 2 | armazenamento | fatias/armazenamento/20-armazenamento-idb.js |
| `cadpecas-rom` | dado | 5 | core, armazenamento, base | core/backup.js, fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, store/dados.js |
| `cadpecas-rom-info` | dado | 8 | armazenamento, base | fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/armazenamento/32-ler-indices.js, store/dados.js |
| `cadpecas-roms` | dado | 10 | armazenamento, base | fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/armazenamento/32-ler-indices.js, store/dados.js, store/store-local.js |
| `cadpecas-split` | tela | 1 | base | store/prefs.js |
| `cadpecas-tabs` | dado | 11 | armazenamento, tabelas, base | fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/armazenamento/32-ler-indices.js, fatias/tabelas/19d-tabelas-indice-e-fotos.js, store/dados.js, store/store-local.js |
| `cadpecas-uso` | (nome de lock/banco, nao e chave) | 5 | armazenamento, configuracao | fatias/armazenamento/20-armazenamento-idb.js, fatias/configuracao/30-banho-exclusao-segura.js |
| `cadpecas-uso-em` | controle | 1 | base | store/prefs.js |
| `cadpecas-vista` | tela | 1 | base | store/prefs.js |
| `cadpecas-zoom` | tela | 1 | base | store/prefs.js |
| `cadpecas3` | dado | 2 | armazenamento, base | fatias/armazenamento/14-persistencia.js, store/dados.js |
| `cadpecas4` | dado | 11 | armazenamento, base | fatias/armazenamento/14-persistencia.js, fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/armazenamento/33c-outra-aba.js, store/dados.js, store/store-local.js |
| `cadpecas4-corrompido` | dado | 2 | armazenamento, base | fatias/armazenamento/14-persistencia.js, store/dados.js |

## Lojas do IndexedDB `cadpecas-big` v3 (todas `dado`)

| loja | arquivos |
|---|---|

## Chaves dinamicas (variavel, nao literal)

`ROMKEY`/`NFKEY` (constantes de `core`, classe dado), `NBK`/`KV` (planilha 24, tela), `key` em tabelas 19d (`gravarIdx`: `cadpecas-roms` e `cadpecas-tabs`, dado), `k`/`u` em armazenamento 20, 21c, 33c (percorrem as chaves de dado e de controle acima).

## Duvidas de classe

- `cadpecas-autor`: tela por preferencia do dono do plano, mas e gravada pela fatia tabelas e lida na abertura; tratada como `tela`.
- `cadpecas-rel`: rascunho do relatorio do romaneio; tratada como `dado` (entra no backup).
