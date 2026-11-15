# Fatia lancamento

## Para que serve
O formulario de baixo: lancar uma peca (bruta, pronta, conjunto), banhos e valores, tamanhos e cores da pedra, previa das linhas e de onde vem o custo (`atualizarGera`),
painel rapido de cadastro (`painelRapido`/`salvarRapido`: categoria, subcategoria, fornecedor, cor, banho, galvanica, varias linhas), varias pecas (`painelMulti`),
conjunto (`conjSync`, `conjPainel`), lancamento continuo e combinacoes (`trabalhoHtml`, `presetAplicar`), adicionar, editar, cancelar, repetir/usar como modelo, duplicar e excluir pecas.

## Arquivos (ordem de carga)
`16b-usar-modelo.js`, `17-lancamento.js` (`estadoLancamento`, `campoHTML`, `renderForm`, painel rapido, `previsao`, `fatorDoPreco`), `18-conjunto.js` (conjunto, `atualizarGera`, `renderFormSoon`),
`21c2-descricao-cursor.js`, `21d1-campo-msg-e-simulador.js` (`campoMsg`: erro ao lado do campo; `simuladorFator`), `21d3-primeiros-passos.js` (`primeirosHtml`/`primeirosAtualizar`/`primeirosIr`, cartao em `#primeirosWrap`),
`26-formulario-apoio.js` (`lembrarForn`, `limparForm`, `presetAplicar`, `focarPrimeiro`), `27b-lancamento-formulario.js` (`adicionar`), `27b3-editar.js` (`dobrarOv`, `formSujo`, `editar`), `27b5-cancelar.js`
(`avisoEdicao`, `cancelar`), `27d-duplicar-excluir.js` (`duplicar`, `duplicarLinha`, `excluir`, `excluirLinhas`), `29b-exemplo-visual.js`, listeners inteiros `30a` (submit e foco), `31a` (lancamento continuo),
`31-banco-busca.js` (filtro do banco de palavras), `31c-ultima-peca.js` (`limpaUlt`), `31c2` (campos mistos), `30c0-ativar-conjunto.js`, `31c0-aplicar-faixa.js` e `acoes.js` (41 acoes e `tipoClique`, chamado por `app/30c` para `[data-tipo]`).

## Estado
`estadoLancamento = {quick, quickB, romQRow, romQ0, quickPre, multi, trabalhoAberto, addTrava, editSnap, foraDaPlanilha}` (antes globais; `MULTI` virou `multi`). Globais 68 para 58.
`editId`, `rascunho`, `erro`, `S`/`S.form`, `undo`, `abertos` seguem na base `src/js/10` (compartilhados: planilha, romaneio, fotos e app leem e gravam).

## expoe (quem usa de fora)
`renderForm` (planilha, romaneio, fotos, configuracao, app), `editar`/`dobrarOv`/`formSujo`/`estadoLancamento` (planilha 15f/16/30b, fotos 27, app), `usarModelo`/`focarPrimeiro`/`duplicar*`/`excluir*`
(acoes da planilha), `adicionar`/`conjSync`/`avisoEdicao` (romaneio cria pecas; tabelas e app avisam edicao), `campoMsg`/`limpaUlt` (romaneio 21a6 e onField), `primeirosIr` (switch de `app/30c`),
`cancelar`, `fatorDoPreco`, `salvarRapido`, `renderFormSoon`, `atualizarGera`, `aplicaFaixa`, `ativarConjunto`, `numFormMover`, `tipoClique` (app). Quem usa `lancamento`: planilha, configuracao, fotos, romaneio, tabelas, app.

## Fronteira "aponta": ciclo sem corte limpo (27 violacoes pendentes, eram 21)
O formulario e a tabela se redesenham um ao outro. `lancamento` usa sem declarar: `renderTopo` (10x), `renderListas`, `celular`, `formAbrir`, `estadoPlanilha`, `mostrarNoFim` (planilha),
`renderCfg` (configuracao), `estadoFotos`, `autoEnviar`, `fotoCopia` (fotos), `relTem`, `renderRom`, `ROM` (romaneio). Declarar criaria ciclo (todas usam `lancamento`). As 6 novas vieram de 27d, 21d3 e de `ROM` agora ser da fatia romaneio.
A ferramenta NAO ve usos dentro de `registrarAcoes` nem em instrucoes de nivel superior: `renderCfg` (`faixa-salvar`, `cs-padrao`), `mostrarNoFim` (`multi-ok`), `qIrGalvanica` (configuracao) ficam fora da contagem.
Corte futuro: gancho unico de "redesenhar" (`render` em `src/js/15b` ja faz isso). `desfazer` esta em `armazenamento/27b2`; divisoria em `app`, `rolarPane`/`irPara` na base `src/js/18c-navegacao.js`.

## Armadilhas
- `adicionar` e reentrante (`multi-ok` chama `adicionar(false,true)`) e tem trava de duplo clique (`estadoLancamento.addTrava`, 500 ms).
- `editSnap` e regravado por planilha (15f) e fotos (27) quando o formulario nao estava sujo: mantenha esse par `formSujo()`/`editSnap`.
- O painel rapido tambem e aberto pelo romaneio (`rom-q`): `romQRow`/`romQ0` guardam a linha e a categoria a restaurar (`romQFim`).
- Texto gerado: `String.fromCharCode(10)`. Nunca dispare `change` a mao (so `input`).

## Fora da fatia (pendencias)
- `onField` (`app/31c-on-field.js`) mistura campos de formulario, cadastros, romaneio, exportacao e planilha; keydown/paste de `app/32` (Ctrl+Enter, Esc, Enter no painel rapido), `zoom` e `ir` no switch de `app/30c`.
- AUD-A-007 (alteracao nao salva de outra variacao e sobrescrita: `sincFormCelula`/`dobrarOv`) e AUD-C-001 (linha com quantidade e preco omitida sem alerta): conhecidos, NAO corrigidos.
- 161 linhas acima de 160 caracteres (HTML em string de `renderForm`, `conjPainel`, `painelRapido`, `acoes.js`): nao reformatadas.
