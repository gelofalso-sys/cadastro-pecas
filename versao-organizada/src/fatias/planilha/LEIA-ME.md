# Fatia planilha

## Para que serve
Tela principal: a tabela das pecas lancadas (`renderTopo` desenha filtros, avisos, barra de marcadas, tabela, totais e grafico de rosca), vistas planilha/lista/cartoes (`vista`, `cartoes`),
janela de linhas para tabelas com mais de 300 linhas (`estadoPlanilha.jan`, `janRepintar`), selecao de celulas estilo Excel (`16-selecao.js`), edicao e colagem na grade (`abrirCel`, `fecharCel`, `colarCel`),
acoes em lote (`b-set`, `b-dup`, `b-del`), acoes sobre a selecao (`s-*`), gaveta do formulario no celular (`formAbrir`, `gavetaAlt`), numeracao recolhivel (24) e pilula de recolher o formulario (34).

## Arquivos (ordem de carga)
- `12-celula-recusada.js` (`marcaRuim`, veio do antigo 12), `15-planilha.js` (`estadoPlanilha`, larguras, filtros `casa`/`filtroOn`, `formAbrir`, `renderFiltros`, `cartoes`), `15c-listas-e-janela.js` (`renderListas`, janela, `guiaHTML`),
  `15e-renderizar-planilha.js` (`renderTopo`), `15f-edicao-celula.js`, `15g-planilha-colar.js`, `16-selecao.js` (sem `usarModelo`, que foi para `lancamento`), `19a2-grafico-rosca.js` (`renderGraf`, veio de `configuracao`: so `renderTopo` o chama),
  `24-ui-numeracao-e-colunas.js`, `27b1-mostrar-no-fim.js` (`mostrarNoFim`, rolar ate a peca nova; veio do 27b), `34-filtros-e-pilula.js`, `acoes.js` (21 cliques), e listeners inteiros: `30b` (mousedown/mousemove/mouseup/dblclick da grade), `31b` (dblclick da regua de coluna e destaque da linha), `32b` (digitar na celula), `33b` (rolagem da janela).
- Ficaram na base `src/js/` (cortes feitos para nao criar ciclo): `15b-render-geral.js` (`render`, chama `renderCfg` da configuracao) e `15d-romaneio-resync.js` (`romResync`, `romCriando`, chamam o romaneio).
- `34c-cartoes-categoria.js` (cartoes recolhiveis de `#cfg`) foi para `configuracao`, nao e da tela da planilha.

## Estado
`estadoPlanilha = {colW, nfVaz, fil, fv, jan, janRaf, selR, arrastando, mdTd, mdJa}` (antes `colW`, `nfVazAtualizar`, `FIL`, `FV`, `JAN`, `janRaf`, `selR`, `arrastando`, `mdTd`, `mdJa`; globais 78 para 68).
Continuam globais: `w` (largura em `abrirCel`) e os compartilhados `S`, `G`, `sel`, `editId`, `celEd`, `undo`, `abertos` (`src/js/10`).

## expoe (o que de fora usa)
`renderTopo`/`renderListas` (tabelas, configuracao, exportacao, fotos, romaneio e legado: redesenhar a tela), `casa`/`filtroOn` (exportacao e fotos baixam/escolhem so o que o filtro mostra),
`estadoPlanilha` (exportacao le `fv`; fotos le `selR`; legado 14/20/27b/27d/31c), `celular` e `formAbrir` (configuracao, legado), `selecionar`/`rolarAte` (acao de exportacao, teclado de app/32), `guardarFil`, `vis`, `pilulaAtualiza` (31c, 27b, 35), `mostrarNoFim` (romaneio 23b, `adicionar` e `multi-ok` do lancamento). `usa`: `core`, `lancamento`.

## Acoplamento com `lancamento` (Tarefa 16)
- `planilha` usa `lancamento` (declarado): `renderForm`, `editar`, `dobrarOv`, `formSujo`, `estadoLancamento.editSnap` (15f/16/30b: celula da peca aberta no formulario), `usarModelo`, `focarPrimeiro` (acoes).
- O caminho inverso (`lancamento` chama `renderTopo`, `renderListas`, `celular`, `mostrarNoFim`) fica como violacao pendente na fatia `lancamento` (`fronteira: "aponta"`); ver o LEIA-ME de la.
- `desfazer` e `salvar` sao da fatia `armazenamento` (declarada); `duplicar`/`excluir*` da `lancamento` (chamados nas acoes); `editId` segue na base `src/js/10`.

## Armadilhas
- `render` e `romResync` ficam fora de proposito: `planilha` nao pode usar `configuracao`/`romaneio` (elas usam `renderTopo`). Nao mova de volta.
- Listeners misturados que ficaram na fatia `app`: `keydown` e `paste` de `app/32` (atalhos da grade junto de outros), `click` de `app/30c` e `resize`/`keydown` de `app/35`.
- Texto gerado: use `String.fromCharCode(10)`; `renderTopo` monta a tabela inteira em string (por isso as linhas passam de 1000 caracteres).

Testes manuais com PDF real: tests/pdf_real2.py (fora do run_all).

## Pendencias (conhecidas, NAO corrigidas)
- AUD-A-007: `sincFormCelula` (15f) descarta o valor nao salvo de outra variacao ao editar a celula de uma peca aberta no formulario.
- AUD-I-001: foto da linha/cartao e `img[data-act=tab-foto]` sem foco de teclado (15e e `cartoes`); AUD-J-001: `renderTopo` redesenha a tabela inteira (custo com 1.000 pecas).
- 128 linhas acima de 160 caracteres (HTML em string de `renderTopo`, `cartoes`, `renderFiltros`): nao reformatadas (quebraria a prova de HTML identico); virar funcoes de template so com teste do fluxo.
