# Fatia romaneio

## Para que serve
Transformar a lista do fornecedor em pecas lancadas: colar texto (`romLer`, `romMonta`), ler PDF/foto (`romPdf`, `lerPdf`, `romFotos`), planilha (`romPlanilha`),
XML/DANFE da nota fiscal (`nfIniciar`, `nfRotear`, janela `#nfRev`), fila de importacao (`impAdd`, `renderImp`, `estadoRomaneio.impQ`), cartoes por item
(`renderRom`, `romCardHTML`, `romCampo`), lote por peso e partir/juntar (`romLote*`, `romPartir`), insumos rateados (`romIns*`), revisao final (`romRevisar`),
criar as pecas (`romCriar`) e relatorio da criacao (`relGerar`, `relAbrir`, `relLer`).

## Arquivos (ordem de carga)
- `19c-colar-romaneio.js`: `estadoRomaneio`, `romSetForn`, `romForm`, `romMonta`, `romPreview`, `renderRom`, conjuntos do romaneio.
- `21-edicao-em-lote.js` (acoes em massa, revogar, excluir), `21a-revisao-final.js`, `21a2-cartoes-romaneio.js` (cartoes, `romAtual`),
  `21a3-lote-e-partes.js`, `21a4-planilha-romaneio.js`, `21a6-campos-e-leitura.js` (`romCampo`, `romLer`, `romAplicaR`): o antigo 21 dividido por assunto.
- `21b-peca-nova.js`, `21b-romaneio-extras.js` (insumos, lotear), `21b5-passos-romaneio.js` (1 Importar · 2 Pesos · 3 Revisar · 4 Criar).
- `22-importar-pdf-romaneio.js` (pdf.js, `miniFoto`, `imgCanvas`), `23b-romaneio-criar.js`, `23c-nota-fiscal.js` (NF fica aqui por decisao), `25-relatorio-romaneio.js`,
  `27b4-romaneio-abrir.js` (`romAbrirNovo`, abrir/retomar o romaneio; veio do 27b), `34b-importacao-romaneio.js` (fila, `#impBar` com arrastar/soltar). `acoes.js`: 62 cliques (`rom-*`, `rev-*`, `rel-*`, `imp-*`, `lote-*`, `rins-*`).
- Ficaram fora: `ROM`/`romT` em `src/js/19c0` e `ROMS`/`romArm`/`romSalvar*`/lista de salvos na fatia `armazenamento` (20) (globais de dominio, irao para `core` com funcoes de acesso);
  `qIrGalvanica` em `src/js/21b3`; `rom-q`/`q-fechar` (painel rapido) em `lancamento/acoes.js`; `romFiltro*`/`romCompacto`/`romNav` em 33 (fatia `app`).
  `secRom`, modelo por exemplo e fiscal foram para `configuracao`; fotos dos itens (`romFoto*`) para `fotos`: assim nao ha ciclo (ambas usam `romaneio`).

## Estado e expoe
`estadoRomaneio = {revSeq, t0, busy, pdfLib, rel, impQ, impSt}` (antes `romRevSeq`, `romT0`, `romBusy`, `pdfLib`, `REL`, `IMPQ`, `IMPST`; globais 85 para 78).
`NF` (33 fecha a janela) e `relTem` (17, 20 e 32 leem/gravam) continuam globais. `expoe`: `renderRom` (configuracao, fotos, 15/17/20/27b...), `arqSalvar` (tabelas),
`NF`/`nfFechar` (33), `nfRotear`, `impAdd`, `romPdf`, `romPlanilha`, `romRevisar`, `relTem` (32), `impData` (21c), `romAtual` (33 embrulha),
`romAtualSoon`/`romCampo` (31), `romSetForn` (27b), `romAbrirNovo` (35). `usa`: `core`, `exportacao` (`baixar`, `obterDL`), `planilha`, `lancamento` (`adicionar`, `renderForm`, `avisoEdicao`, `conjSync`).

## Armadilhas
- `33` reatribui `renderRom` e `romAtual` (embrulha para filtro/compacto) e `23c` reatribui `romCriar` (trava de concorrencia da NF): chame sempre pelo nome global.
- `ROM` e gravado por acoes (`rom-fechar`, `rom-descartar`) e por 20/27b; `romSalvarSoon` depois de mudar `ROM`. Texto gerado: `String.fromCharCode(10)`.
- Handlers que ficaram fora (pedacos de listeners maiores): `input`/`change` de `[data-rp]`, `data-rins`, `data-lotn` (31 chama `romCampo`/`romAtualSoon`),
  colar/arrastar PDF e planilha e atalhos de revisao (32), `storage` do rascunho do romaneio e lista de salvos (33).

## Pendencias da auditoria (conhecidas, NAO corrigidas)
- AUD-C-001: linha com quantidade e preco mas sem descricao e omitida sem aviso especifico (`rom-plan-ok` em `acoes.js`).
- AUD-C-003: leitura limitada a 3.000 linhas pode omitir linhas sem alerta especifico (limite em `core/romaneio.js`, chamado por 19c).
- AUD-C-004: CSV com ponto e virgula pode multiplicar preco por 100 e tirar zeros a esquerda (`romPlanilha`, 21a4).
- AUD-C-002: selo de conferencia da NF pode parecer importacao integral quando ha item com quantidade 0 (`23c-nota-fiscal.js`).
- 331 linhas acima de 160 caracteres (codigo minificado a mao, ate ~3000): nao reformatadas.
- Usa `planilha`: `renderTopo` (19c, 21, 21a6, 23b), `mostrarNoFim` (23b). `romCriando` (de `src/js/15d`) segue global legado.
