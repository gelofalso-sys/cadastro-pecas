# Fatia app

## Para que serve
A casca do aplicativo, por cima de todas as fatias: janelas (`.lbox`, `.rev`, `.rep`: papel de dialogo, foco preso, Esc so na de cima, aviso de alteracao nao salva),
paleta de comandos (Ctrl+K, `PALCMD`/`palAbrir`), menu lateral e menu do celular, divisoria entre tabela e formulario, abertura dos dados (espera a recuperacao de backup,
reserva o uso e so entao libera a tela), novidades, historico de alteracoes, aviso de origem dos dados, o despacho dos cliques e os listeners globais de entrada/teclado/colar/soltar.

## Arquivos (ordem de carga; todos vieram de src/js na Tarefa 18, divididos sem mudar o HTML)
`18c-divisoria.js` (arrastar/duplo clique da divisoria, `--split`), `21d-novidades.js` (`novidadesAbrir`), `21d5-historico.js` (`historicoAbrir`), `21d7-origem-aviso.js` (`origemAviso`),
`30a2-eventos-toggle.js` (`<details data-open>` guarda em `abertos`), `30c-clique-acoes.js` (despacho do clique), `31c-on-field.js` (`onField`: todo `input`/`change` de campo),
`32-eventos-entrada-e-teclado.js` (input, change, paste e keydown globais; trava de rolagem), `32-soltar-arquivo.js`, `32-abas-rolagem.js` (seta das abas que rolam),
`33-janelas-busca-e-paleta.js` (janelas modais e campo do autor), `33c-abertura.js`, `33c-paleta-comandos.js`, `35-menu-e-final.js` (botoes de visao, atalhos, menu lateral, `hdrLayout`, menu do celular).

## Despacho do clique (`30c`)
`[data-tipo]` -> `tipoClique` (lancamento); `[data-act]` -> `ACOES[a](ctx)` com `ctx={t,e,a,C,tr,ci,bi}`. `ACOES` mora em `src/core/acoes.js` (junto de `registrarAcoes`), assim as fatias
registram suas acoes sem depender de `app`. Depois do despacho, se o clique estava em `CFG_UNDO` e `S.config` mudou, mostra "Cadastro alterado / Desfazer" (`return false` pula).
Switch residual (casos sem dona unica ou que so chamam funcoes de varias fatias): `b-copy`/`b-xlsx`/`s-xlsx` (barra da selecao: `sel`/`idsDaSel` da planilha + `copiar`/`baixar` da exportacao),
`zoom` (`ZM`/`zoomAplicar`), `guia-fechar`, `undo-b`/`redo-b`, `ir` (navegacao), `historico`/`hist-voltar`, `origem-ok`, `prim-ir`/`prim-fechar` (primeiros passos), `novidades`, `renumerar`, `abrir-arq` (generico).

## Menus e atalhos
`menuCelularDoLateral` gera o menu do celular a partir do `#side` (mesmos grupos, nomes, icones e ordem; o celular so acrescenta Lancar peca, Cadastros e a lista de extras): UMA definicao, aqui.
Atalhos: Alt+1/2/3 (visoes), `/` (busca), Ctrl+K (paleta), Alt+B (menu lateral), Ctrl+Z/Ctrl+Y (fora de campo), Ctrl+Enter (adicionar no formulario), Alt+Shift+1..9 (opcao N do campo focado no formulario, ver LEIA-ME.md da raiz).

## Fronteira "falha" (0 violacoes) e o que a ferramenta nao ve
`usa` lista todas as fatias (app e o topo: nenhuma fatia lista `app`). `expoe`: so `sideMarcar` (lido por `visPara` na base `src/js/35-visoes.js`).
A ferramenta so enxerga declaracoes: os listeners de nivel superior (30c, 32, 33, 35) chamam funcoes de todas as fatias sem aparecer na contagem; escrevem `tabArm`/`romArm` (33, ao fechar janela).
Ficam na base `src/js/` (chamados por fatias E por app; numa fatia criariam ciclo): `refocar`/`guardarAbertos` (30-refocar-e-abertos), `visPara` (35-visoes), `irPara`/`rolarPane` (18c-navegacao), `render` (15b), `repModal` (19d1).

## Pendencias
- `onField` e o keydown de 32 misturam todas as telas (cadastros, formulario, romaneio, exportacao, planilha): dividir exigiria quebrar a funcao, nao so mover.
- AUD-F-001 (padrao de leitura personalizado pode travar a aba): o formato e salvo em `onField` (`data-rf`), o regex esta em `core/romaneio.js`. Conhecido, NAO corrigido.
- 136 linhas acima de 160 caracteres (64 em `31c-on-field.js`, 24 em `32-eventos-entrada-e-teclado.js`): nao reformatadas.
