# Fatia romaneio

## Para que serve
Transformar a lista do fornecedor em pecas lancadas: colar texto (`romLer`, `romMonta`), ler PDF/foto (`romPdf`, `lerPdf`, `romFotos`), planilha (`romPlanilha`),
XML/DANFE da nota fiscal (`nfIniciar`, `nfRotear`, janela `#nfRev`), fila de importacao (`impAdd`, `renderImp`, `estadoRomaneio.impQ`), cartoes por item
(`renderRom`, `romCardHTML`, `romCampo`), lote por peso e partir/juntar (`romLote*`, `romPartir`), insumos rateados (`romIns*`), revisao final (`romRevisar`),
criar as pecas (`romCriar`), relatorio da criacao (`relGerar`, `relAbrir`, `relLer`) e busca/filtro/cartoes compactos do romaneio aberto.

## Arquivos (ordem de carga)
- `19c0-romaneio-global.js`: `ROM` (o romaneio aberto) e `romT` (modelo de leitura atual). Veio do legado na Tarefa 18.
- `19c-colar-romaneio.js`: `estadoRomaneio`, `romSetForn`, `romForm`, `romMonta`, `romPreview`, `renderRom`, conjuntos do romaneio.
- `21-edicao-em-lote.js` (acoes em massa, revogar, excluir), `21a-revisao-final.js`, `21a2-cartoes-romaneio.js` (cartoes, `romAtual`),
  `21a3-lote-e-partes.js`, `21a4-planilha-romaneio.js`, `21a6-campos-e-leitura.js` (`romCampo`, `romLer`, `romAplicaR`): o antigo 21 dividido por assunto.
- `21b-peca-nova.js`, `21b-romaneio-extras.js` (insumos, lotear), `21b5-passos-romaneio.js` (1 Importar · 2 Pesos · 3 Revisar · 4 Criar).
- Testes manuais com PDF real: tests/auditoria_pdf_lote.py (fora do run_all).
- `22-importar-pdf-romaneio.js` (pdf.js, `miniFoto`, `imgCanvas`), `23b-romaneio-criar.js`, `23c-nota-fiscal.js` (NF fica aqui por decisao), `25-relatorio-romaneio.js`,
  `27b4-romaneio-abrir.js` (`romAbrirNovo`), `34b-importacao-romaneio.js` (fila, `#impBar`). `acoes.js`: 62 cliques (`rom-*`, `rev-*`, `rel-*`, `imp-*`, `lote-*`, `rins-*`).
- Vindos do legado na Tarefa 18: `32-romaneio-revisar-atalho.js` (Ctrl+Enter no romaneio abre a revisao) e `33c-romaneio-filtro-e-navegacao.js`
  (`romFiltroAplicar`, `romFiltroMontar`, `romCompacto`, `romNav`, teclas `[`/`]`, busca na lista de romaneios lancados).
- Fora: `ROMS`/`romArm`/`romSalvar*`/lista de salvos em `armazenamento`; `rom-q`/`q-fechar` em `lancamento`; `secRom`, modelo por exemplo, fiscal e `qIrGalvanica` em `configuracao`; `romFoto*` em `fotos` (sem ciclo). `romResync`/`romCriando` na base `src/js/15d`.

## Estado e expoe
`estadoRomaneio = {revSeq, t0, busy, pdfLib, rel, impQ, impSt, romf}` (`romf` era o global `ROMF` do filtro; globais 85 para 78, depois -1 na Tarefa 18).
`ROM`, `NF` e `relTem` continuam globais. `expoe`: `ROM` (lancamento, configuracao, fotos, armazenamento, app), `renderRom` (configuracao, fotos, 15/17/20...), `arqSalvar` (tabelas),
`NF`/`nfFechar` (janelas de `app/33`), `nfRotear` (soltar arquivo), `impAdd`, `romPdf`, `romPlanilha` (`app/32`), `relTem`, `impData` (21c), `romAtual` (20, onField),
`romAtualSoon`/`romCampo` (onField), `romAbrirNovo` (menu de `app/35`). `usa`: `core`, `exportacao` (`baixar`, `obterDL`), `planilha`, `lancamento` (`adicionar`, `renderForm`, `avisoEdicao`, `conjSync`, `campoMsg`, `limpaUlt`), `armazenamento`.

## Armadilhas
- `33c-romaneio-filtro-e-navegacao.js` reatribui `renderRom`, `romAtual` e `romListaAbrir` (embrulha para filtro/compacto/busca) e `23c` reatribui `romCriar` (trava da NF): chame sempre pelo nome global.
- `ROM` e gravado por acoes (`rom-fechar`, `rom-descartar`), por armazenamento (20) e por 27b4; `romSalvarSoon` depois de mudar `ROM`. Texto gerado: `String.fromCharCode(10)`.
- Pontos cegos do checador ("falha" com 0 violacoes contadas, mas NAO e verdade): ele so ve declaracoes, nao o corpo de `registrarAcoes({...})`. Usos reais de simbolos PRIVADOS de `armazenamento`: `romRascunho` (`rom-descartar`), `romExcluirSalvo` (`rom-descartar`, `rom-salvo-del`), `romListaAbrir` (`rom-lista`; e `33c` a reatribui), `romArm` (le e escreve em `rom-salvo-del`, `rel-fechar`), `romListaRef` (`rom-salvo-del`), todos em `acoes.js`. Conhecidos, nao corrigidos; `fronteira` segue "falha".
- Handlers fora (pedacos de listeners de todas as telas, em `app`): `input`/`change` de `[data-rp]`, `data-rins`, `data-lotn` (onField chama `romCampo`/`romAtualSoon`), colar/soltar PDF e planilha (`app/32`);
  `storage` do rascunho do romaneio em `armazenamento/33c-outra-aba.js`.

## Pendencias da auditoria (conhecidas, NAO corrigidas)
- AUD-C-001: linha com quantidade e preco mas sem descricao e omitida sem aviso especifico (`rom-plan-ok` em `acoes.js`).
- AUD-C-003: leitura limitada a 3.000 linhas pode omitir linhas sem alerta especifico (limite em `core/romaneio.js`, chamado por 19c).
- AUD-C-004: CSV com ponto e virgula pode multiplicar preco por 100 e tirar zeros a esquerda (`romPlanilha`, 21a4).
- AUD-C-002: selo de conferencia da NF pode parecer importacao integral quando ha item com quantidade 0 (`23c-nota-fiscal.js`).
- 331 linhas acima de 160 caracteres (codigo minificado a mao): nao reformatadas. Usa `planilha`: `renderTopo` (19c, 21, 21a6, 23b), `mostrarNoFim` (23b).

## Estado agrupado
Etapa 4.1: `romCriando`, `romChaveL` (usados por `src/js/15d`) e `relTem` viraram campos de `estadoRomaneio` (19c-colar-romaneio.js).

`expoe` trocou `relTem` por `estadoRomaneio`: `relTem` virou campo dele e outras fatias o leem e escrevem (armazenamento ao abrir e ao restaurar, lancamento ao desenhar o formulario, `src/js/15d` no resync). Escrita direta de outra fatia e problema conhecido, fica para a 4.3.

## Etapa 4.2
`ROM` e `NF` viraram campos de `estadoRomaneio` (`estadoRomaneio.ROM`, `.NF`); `expoe` troca esses nomes por `estadoRomaneio` (ja exposto). Quase todas as fatias leem `ROM`; escritas de outras fatias seguem como problema conhecido.
