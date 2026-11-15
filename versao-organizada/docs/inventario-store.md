# Inventario do store (gerado por tools/inventario_store.mjs)

Chaves literais `cadpecas*` em `src/` (inclui `store/prefs.js`). Classe: `dado` (negocio), `tela` (preferencia de tela), `controle` (backup/servicos). Gerado: nao edite a mao.

| chave | classe | ocorrencias | fatias | arquivos |
|---|---|---|---|---|
| `cadpecas-abertos` | tela | 1 | base | store/prefs.js |
| `cadpecas-autor` | tela | 1 | base | store/prefs.js |
| `cadpecas-big` | (nome de lock/banco, nao e chave) | 2 | base | store/idb.js |
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
| `cadpecas-nf` | dado | 1 | core | core/notafiscal.js |
| `cadpecas-numbar-aberta` | tela | 1 | base | store/prefs.js |
| `cadpecas-origem-ok` | controle | 1 | base | store/prefs.js |
| `cadpecas-persist-aviso` | controle | 1 | base | store/prefs.js |
| `cadpecas-recuperou-backup` | controle | 4 | app, armazenamento, base | fatias/app/33c-abertura.js, fatias/armazenamento/20-armazenamento-idb.js, store/local.js |
| `cadpecas-rel` | dado | 7 | armazenamento, romaneio | fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/armazenamento/32-ler-indices.js, fatias/romaneio/25-relatorio-romaneio.js |
| `cadpecas-restauracao` | (nome de lock/banco, nao e chave) | 2 | armazenamento | fatias/armazenamento/20-armazenamento-idb.js |
| `cadpecas-rom` | dado | 4 | core, armazenamento | core/backup.js, fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js |
| `cadpecas-rom-info` | dado | 7 | armazenamento | fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/armazenamento/32-ler-indices.js |
| `cadpecas-roms` | dado | 7 | armazenamento | fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/armazenamento/32-ler-indices.js |
| `cadpecas-split` | tela | 1 | base | store/prefs.js |
| `cadpecas-tabs` | dado | 8 | armazenamento, tabelas | fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/armazenamento/32-ler-indices.js, fatias/tabelas/19d-tabelas-indice-e-fotos.js |
| `cadpecas-uso` | (nome de lock/banco, nao e chave) | 5 | armazenamento, configuracao | fatias/armazenamento/20-armazenamento-idb.js, fatias/configuracao/30-banho-exclusao-segura.js |
| `cadpecas-uso-em` | controle | 1 | base | store/prefs.js |
| `cadpecas-vista` | tela | 1 | base | store/prefs.js |
| `cadpecas-zoom` | tela | 1 | base | store/prefs.js |
| `cadpecas3` | dado | 1 | armazenamento | fatias/armazenamento/14-persistencia.js |
| `cadpecas4` | dado | 8 | armazenamento | fatias/armazenamento/14-persistencia.js, fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/armazenamento/33c-outra-aba.js |
| `cadpecas4-corrompido` | dado | 1 | armazenamento | fatias/armazenamento/14-persistencia.js |

## Lojas do IndexedDB `cadpecas-big` v3 (todas `dado`)

| loja | arquivos |
|---|---|
| `fotos` | fatias/armazenamento/14-persistencia.js, fatias/fotos/21b1-fotos-romaneio.js, fatias/fotos/23-fotos-imgbb.js, fatias/fotos/27-fotos-escolher-colar.js, fatias/fotos/27c-foto-copia.js, fatias/fotos/acoes.js, fatias/lancamento/27b-lancamento-formulario.js, fatias/romaneio/23b-romaneio-criar.js, fatias/tabelas/19d-tabelas-indice-e-fotos.js |
| `pontos` | fatias/armazenamento/14-persistencia.js, fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/acoes.js, fatias/tabelas/19d-tabelas-indice-e-fotos.js |
| `roms` | fatias/armazenamento/20-armazenamento-idb.js, fatias/armazenamento/21c-diagnostico-dados.js, fatias/configuracao/18a-conjunto-excluir-categoria.js, fatias/configuracao/30-banho-exclusao-segura.js, fatias/romaneio/23c-nota-fiscal.js, fatias/tabelas/19d2-tabelas-salvar-e-ver.js |
| `tabs` | fatias/configuracao/18a-conjunto-excluir-categoria.js, fatias/configuracao/30-banho-exclusao-segura.js, fatias/romaneio/21b-romaneio-extras.js, fatias/romaneio/23c-nota-fiscal.js, fatias/tabelas/19d-tabelas-indice-e-fotos.js, fatias/tabelas/19d2-tabelas-salvar-e-ver.js, fatias/tabelas/acoes.js |

## Chaves dinamicas (variavel, nao literal)

`ROMKEY`/`NFKEY` (constantes de `core`, classe dado), `NBK`/`KV` (planilha 24, tela), `key` em tabelas 19d (`cadpecas-autor`, tela), `k`/`u` em armazenamento 20, 21c, 33c (percorrem as chaves de dado e de controle acima).

## Duvidas de classe

- `cadpecas-autor`: tela por preferencia do dono do plano, mas e gravada pela fatia tabelas e lida na abertura; tratada como `tela`.
- `cadpecas-rel`: rascunho do relatorio do romaneio; tratada como `dado` (entra no backup).
