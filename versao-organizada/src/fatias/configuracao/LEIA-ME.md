# Fatia configuracao

## Para que serve
A tela "Cadastros e personalizacao" (`#cfg`) e tudo o que a sustenta:
- abas Categorias, Banhos, Fornecedores, Colunas, Cores/variacoes, Exportar para, Romaneios, Fotos, Importar e copia;
- catalogo rapido (colar lista de categorias, modelos prontos), duplicar categoria, renomear subcategoria, cor nova de banho;
- salvar/descartar cadastros (`cadSalvar`, `cadDescartar`, barra `#cadBar`) e a trava do resto do app enquanto ha alteracao pendente;
- campos em reais (`37-moeda.js`: ao sair do campo, 1,5 vira 1,50).
## Arquivos
- `19-catalogo-rapido.js`: `estadoConfig`, `sec`, `catUI`, previa/colar, duplicar, renomear subcategoria, cor nova.
- `19a-secao-categorias.js` (`secCat`), `19a3-secao-exportar-para.js` (`secModelo`); `34c-cartoes-categoria.js` (cartoes recolhiveis de `#cfg`, veio da pasta legada). `19a2-grafico-rosca.js` (`renderGraf`) foi para `planilha`.
- `25b-cadastros-render.js`: `resetBar`/`resetar` e `renderCfg`/`renderCfg0` (secoes Banhos, Fornecedores, Colunas, Cores...). Veio de `25`.
- Vindos da Tarefa 14 (romaneio): `25a-secao-romaneios.js` (`secRom`, aba Romaneios = modelos de leitura), `21a5-modelo-por-exemplo.js`
  (`romUI`, `romExInfo`, `romExAtualiza`) e `21b4-fiscal-categorias.js` (`fiscalTodasHTML`, `fiscalCampo`, `fiscalAplicarTodas`); acoes `rom-add/dup/del`,
  `rom-map-*`, `rom-ex-abrir/fechar/ok`, `rom-testar`, `fisc-aplicar`. Assim `romaneio` nao usa nada de `configuracao` (sem ciclo).
- `36-cadastros-salvar.js` (`CAD`, `cadConferir`, `cadSalvar`, `cadDescartar`, travas) e `37-moeda.js`.
- `acoes.js`: 77 cliques (`cat-*`, `sub-*`, `bh-*`, `bn-*`, `forn-*`, `mc-*`, `mod-sel/dup/del/av/brancas/bling/jueri`, `cor-*`, `cv-*`, `gr-*`, `gi-del`, `reset`, `ctab`, `ordem`, `graf`...).
## Fluxos principais
1. Clique `data-act` -> listener de `30` calcula `snapCfg` (so para `CFG_UNDO`) e despacha para `ACOES`; depois do despacho, se `S.config` mudou,
   `30` mostra "Cadastro alterado / Desfazer". `return false` numa acao pula esse trecho (so `cat-del-ok` quando ha pecas usando a categoria).
2. Nos Cadastros, qualquer alteracao liga `CAD.pend`: nada e gravado ate "Salvar"; "Descartar" devolve config, pecas, formulario e romaneio.
   Em teste automatizado (`navigator.webdriver`) vale o modo antigo (`CADAUTO`: grava na hora).
3. `renderCfg` monta as secoes em `estadoConfig.secs` (via `sec`) e desenha a aba aberta (`abertos.tab`).
## O que a fatia expoe e por que
`renderCfg` (quase todo o app redesenha a tela), `CAD`/`CADAUTO`/`cadConferir`/`cadTirarFoto` (18 e 30),
`estadoConfig` (18 apaga `delCat`; 31/32 leem `renBusy`/`faixaBusy`), `catUI`, `atualizaPrevia`, `subRenomear`, `dupCampo`, `dupOk`, `focoChip`, `corNovaOk`,
`fiscalCampo`, `romUI`, `romExAtualiza` (handlers de 31/32). Usa `fotos` (`fotoKey`, `fotoAuto`) e `romaneio` (`renderRom`, em 25b e 36).
## Armadilhas
- `37-moeda.js` so dispara `input`, NUNCA `change` (o `input` ja alimenta o cadastro). Nao troque por `change` sem rodar os testes de cadastro.
- `cadSalvar`/`cadConferir`/`cadDescartar` tocam `ROM` e `romSalvarSoon` (legado, src/js) e chamam `renderRom` (exposto por `romaneio`).
- `estadoConfig` guarda o que era global: `secs`, `libtam`, `renBusy`, `faixaBusy`, `resetArm`, `delCat` (antes em `src/js/10`).
## Pendencias e acoplamentos a desfazer
- AUD-A-007 (alteracao nao salva de uma variacao e descartada ao editar outra, `15-planilha.js`): documentado, nao corrigido.
- Ficaram no switch de `30`: `faixa-salvar`, `cor-on/off`, `cs-padrao/todas`, `gi-todos`, `gr-novo-pmg`, `gi-pmg` (sao do formulario de lancamento),
  `bk-*`/`ponto-*` (armazenamento), `abrir-arq` (generico).
- Handlers de `change`/`input`/`keydown` dos cadastros (`data-cf`, `data-bnf`, `data-ff`, `data-mod`, `data-dup`...) seguem em 31/32/34: sao
  pedacos de listeners maiores que a fatia, nao da para dividir com `dividir_arquivo`.
- `modPrev`/`secModelo` (19a3) misturam configuracao com exportacao. `qGalvanicaSelecionar` (lido em `bh-add`) vive em `src/js/21b3` (legado).
- Linhas acima de 160 caracteres em todos os arquivos (codigo minificado a mao, ate ~3000): reformatar antes de mexer a fundo.
- Usa `planilha`: `renderTopo`, `celular`, `formAbrir` (21b4, 34c, acoes).
