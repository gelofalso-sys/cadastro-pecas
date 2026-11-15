# Fatia lancamento

## Para que serve
O formulario de baixo: lancar uma peca (bruta, pronta, conjunto), banhos e valores, tamanhos e cores da pedra, previa das linhas e de onde vem o custo (`atualizarGera`),
painel rapido de cadastro (`painelRapido`/`salvarRapido`: categoria, subcategoria, fornecedor, cor, banho, galvanica, varias linhas), varias pecas (`painelMulti`),
conjunto (`conjSync`, `conjPainel`), lancamento continuo e combinacoes (`trabalhoHtml`, `presetAplicar`), adicionar, editar, cancelar, repetir/usar como modelo.

## Arquivos (ordem de carga)
`16b-usar-modelo.js` (veio da planilha), `17-lancamento.js` (`estadoLancamento`, `campoHTML`, `renderForm`, painel rapido, `previsao`, `fatorDoPreco`), `18-conjunto.js` (conjunto,
`atualizarGera`, `renderFormSoon`, altura do formulario), `26-formulario-apoio.js` (`lembrarForn`, `limparForm`, `presetAplicar`, `focarPrimeiro`), `27b-lancamento-formulario.js` (`adicionar`),
`27b3-editar.js` (`dobrarOv`, `formSujo`, `editar`), `27b5-cancelar.js` (`avisoEdicao`, `cancelar`), `29b-exemplo-visual.js`, listeners inteiros `30a` (submit e foco em campo numerico),
`31a` (opcoes do lancamento continuo), `31c2` (campos mistos), `30c0-ativar-conjunto.js`, `31c0-aplicar-faixa.js` e `acoes.js` (41 acoes e `tipoClique`, chamado por 30c para `[data-tipo]`).

## Estado
`estadoLancamento = {quick, quickB, romQRow, romQ0, quickPre, multi, trabalhoAberto, addTrava, editSnap, foraDaPlanilha}` (antes globais; `MULTI` virou `multi`). Globais 68 para 58.
`editId`, `rascunho`, `erro`, `S`/`S.form`, `undo`, `abertos` seguem em `src/js/10` (compartilhados: planilha, romaneio, fotos e o legado leem e gravam).

## expoe (quem usa de fora)
`renderForm` (planilha, romaneio, fotos, configuracao e legado redesenham o formulario), `editar`/`dobrarOv`/`formSujo`/`estadoLancamento` (planilha 15f/16/30b: celula da peca aberta;
fotos 27: foto da peca em edicao, `editSnap`; legado 31c/32), `usarModelo`/`focarPrimeiro` (acoes da planilha), `adicionar`/`conjSync`/`avisoEdicao` (romaneio cria pecas; tabelas e legado avisam edicao),
`cancelar`, `previsao`, `fatorDoPreco`, `salvarRapido`, `renderFormSoon`, `atualizarGera`, `aplicaFaixa`, `ativarConjunto`, `numFormMover`, `tipoClique` (legado 21d/30c/31c/32/35).
Quem usa `lancamento`: planilha, configuracao, fotos, romaneio, tabelas (todas listam em `usa`).

## Fronteira "aponta": ciclo sem corte limpo (violacoes pendentes)
O formulario e a tabela se redesenham um ao outro. `lancamento` usa sem declarar: `renderTopo`, `renderListas`, `celular`, `mostrarNoFim` (planilha), `renderCfg` (configuracao),
`estadoFotos`, `autoEnviar` (fotos), `relTem`, `renderRom` (romaneio). Declarar criaria ciclo (todas usam `lancamento`). Corte futuro: gancho unico de "redesenhar" (`render` em 15b ja faz isso).
Cortes feitos: `desfazer` (historico) foi para `src/js/27b2-desfazer.js`; divisoria/`rolarPane`/`irPara` para `src/js/18c`; `duplicar`/`excluir` ficam em `src/js/27d` (usam `fotoCopia`);
`marcaRuim` (12) e `mostrarNoFim` foram para planilha; `conjExcluirCategoria` para configuracao; `romAbrirNovo` para romaneio.

## Armadilhas
- `adicionar` e reentrante (`multi-ok` chama `adicionar(false,true)`) e tem trava de duplo clique (`estadoLancamento.addTrava`, 500 ms).
- `editSnap` e regravado por planilha (15f) e fotos (27) quando o formulario nao estava sujo: mantenha esse par `formSujo()`/`editSnap`.
- O painel rapido tambem e aberto pelo romaneio (`rom-q`): `romQRow`/`romQ0` guardam a linha e a categoria a restaurar (`romQFim`).
- Texto gerado: `String.fromCharCode(10)`. Nunca dispare `change` a mao (so `input`).

## Fora da fatia (pendencias)
- `onField` (31c) mistura campos de formulario, cadastros, romaneio, exportacao e planilha: fica no legado. Tambem: keydown/paste de 32 (Ctrl+Enter, Esc, Enter no painel rapido), `zoom` e `ir` em 30c.
- AUD-A-007 (alteracao nao salva de outra variacao e sobrescrita: `sincFormCelula`/`dobrarOv`) e AUD-C-001 (linha com quantidade e preco omitida sem alerta;
  leitura em `rom-plan-ok` do romaneio, criacao por `adicionar`): conhecidos, NAO corrigidos.
- 161 linhas acima de 160 caracteres (HTML em string de `renderForm`, `conjPainel`, `painelRapido`, `acoes.js`): nao reformatadas.
