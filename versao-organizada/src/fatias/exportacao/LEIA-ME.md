# Fatia exportacao

## Para que serve
Tudo o que leva a tabela para fora do app, ou traz algo de fora para os cadastros:
- exportar a tabela em .xlsx/.csv (`baixar`) e copiar para colar na planilha (`copiar`), com **conferencia previa**
  (pendencias da tabela e regras do modelo) e, com filtro ativo, saindo so o que o filtro mostra (`gerarExport`);
- assistente "Exportar para outro sistema" (le a planilha modelo do destino, mapeia colunas) e modelos em `.json`;
- importar uma planilha de referencia (ultima peca, fornecedores, categorias, cores) e copia/restauracao dos cadastros.

## Arquivos
- `13-modelo-e-variacoes.js`: so comentarios (regras do modelo do arquivo e variacoes; o codigo esta em `core/exportacao.js` e `core/colunas.js`). Veio do legado na Tarefa 18.
- `19b-assistente-outro-sistema.js`: `estadoExportacao`, assistente de outro sistema, modelo <-> .json.
- `28-exportar.js`: conferencia, `gerarExport`, `baixar`, `montarXlsx`, `copiar`, `gravarExport`.
- `29-importar-e-copia.js`: `importar`/`aplicarImp`, `backup`, `restaurar` (so cadastros).
- `acoes.js`: cliques (`data-act`) da fatia: mod-novo, novo-ok, mod-conferir, mod-salvar, exp-*, xlsx, copiar, imp-ok, backup.

## Fluxos principais
1. Botao Baixar/Copiar -> `gerarExport` -> `abrirConferencia`; se houver pendencia abre a janela e "Exportar assim"
   (`exp-assim`) continua com `forcar`; senao gera, divide em lotes e grava via `obterDL` (downloads do Claude ou `<a download>`).
2. Depois de exportar, `estadoBase.lastExport` (declarado em `src/js/10`) guarda a numeracao; `gravarExport` a aplica ("Limpar tabela" ou so numeracao).
3. Importar: `importar` le o arquivo e guarda em `estadoExportacao.imp`; `imp-ok` (`aplicarImp`) grava nos cadastros.

## O que a fatia expoe e por que
`baixar`, `copiar`: chamados por selecao (`b-xlsx`, `b-copy`), romaneio e relatorio (`rom-xlsx`, `rel-xlsx`).
`importar`, `restaurar`, `lerNovo`, `modeloDeJson`: ligados ao `change`/`drop` em `app/32-eventos-entrada-e-teclado.js` e `app/32-soltar-arquivo.js`.
`obterDL`: download tambem usado pelo armazenamento (20) e pelo relatorio (25). `abrirNovoSistema`, `estadoExportacao`:
o seletor de modelo (onField, `app/31c-on-field.js`) abre o assistente e edita `estadoExportacao.novo`. `gerarExport` nao e usado de fora (so `baixar`/`copiar`).

## Armadilhas
- O nucleo calcula as linhas (`gerar$` em `src/core`); aqui so se monta o arquivo. Texto com quebra de linha: `String.fromCharCode(10)`.
- Zero a esquerda (EAN, NCM) se perde no Excel/CSV: `avisoZeros`; texto iniciado por `= + - @` e protegido (`protegeTxt`).
- Em .xlsx sem a biblioteca `lib/` o app cai para CSV com aviso.
- `abrirExemploVisual` mora em `src/fatias/lancamento/29b-exemplo-visual.js` (era do mesmo arquivo, mas nao e exportacao).

## Pendencias conhecidas (auditoria)
- AUD-D-001: corrida de clipboard em `copiar` (duas copias seguidas / `writeText` assincrono vs. toast e estado). **Nao corrigido.**
- Cliques e eventos fora de `acoes.js`: o tratamento de `change`/`input` do assistente segue em `app` (onField e listeners de 32).
- Linhas acima de 160 caracteres em 28/29/19b e `acoes.js` (codigo minificado a mao): reformatar antes de mexer a fundo.
- Usa `planilha`: `casa`/`filtroOn` (exportar so o filtro), `renderTopo`, `celular`, `selecionar`/`rolarAte`, `estadoPlanilha.fv` (acoes).
