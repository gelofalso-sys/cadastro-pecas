# Fatia configuracao

## Para que serve
A tela "Cadastros e personalizacao" (`#cfg`) e tudo o que a sustenta:
- abas Categorias, Banhos, Fornecedores, Colunas, Cores/variacoes, Exportar para, Romaneios, Fotos, Importar e copia;
- catalogo rapido (colar lista de categorias, modelos prontos), duplicar categoria, renomear subcategoria, cor nova de banho, arrastar para reordenar;
- salvar/descartar cadastros (`cadSalvar`, `cadDescartar`, barra `#cadBar`) e a trava do resto do app enquanto ha alteracao pendente;
- campos em reais (`37-moeda.js`: ao sair do campo, 1,5 vira 1,50) e o aviso de impacto (cadastro mudou o custo de pecas ja criadas).
## Arquivos
- `19-catalogo-rapido.js`: `estadoConfig`, `sec`, `catUI`, previa/colar, duplicar, renomear subcategoria, cor nova.
- `19a-secao-categorias.js` (`secCat`), `19a3-secao-exportar-para.js` (`secModelo`); `34c-cartoes-categoria.js` (cartoes recolhiveis de `#cfg`). `19a2-grafico-rosca.js` foi para `planilha`.
- `25b-cadastros-render.js`: `resetBar`/`resetar` e `renderCfg`/`renderCfg0`. `25a-secao-romaneios.js` (`secRom`), `21a5-modelo-por-exemplo.js` (`romUI`, `romExAtualiza`),
  `21b4-fiscal-categorias.js` (`fiscalCampo`): vieram do romaneio, assim `romaneio` nao usa nada de `configuracao` (sem ciclo).
- `18a-conjunto-excluir-categoria.js` (`conjExcluirCategoria`), `36-cadastros-salvar.js` (`CAD`, `cadConferir`, `cadSalvar`, `cadDescartar`, travas), `37-moeda.js`.
- Vindos do legado na Tarefa 18: `21b3-ir-galvanica.js` (`qIrGalvanica`: "+ Galvanica/+ Banho" do lancamento leva a aba Banhos), `21d2-impacto-cadastro.js`
  (`impactoAgendar`/`impactoConferir`), `21d4-arrastar-ordem.js` (arrastar categorias e banhos), `30-banho-exclusao-segura.js` (`bnReservarUso`, `bnLiberarUso`,
  `bnExcluirSeguro`, `bnExcluirConferido`), listeners `31-banco-palavras.js` (banco de palavras da categoria e geral) e `31-subren-sair.js`, `31c-trocar-prefixo.js` (`prefixoEmUso`, `trocarPrefixo`).
- `acoes.js`: 77 cliques (`cat-*`, `sub-*`, `bh-*`, `bn-*`, `forn-*`, `mc-*`, `mod-*`, `cor-*`, `cv-*`, `gr-*`, `gi-del`, `reset`, `ctab`, `ordem`, `graf`...).
## Fluxos principais
1. Clique `data-act` -> o despacho do clique (`app/30c`) calcula `snapCfg` (so para `CFG_UNDO`) e chama `ACOES`; depois, se `S.config` mudou, mostra
   "Cadastro alterado / Desfazer". `return false` numa acao pula esse trecho (so `cat-del-ok` quando ha pecas usando a categoria).
2. Nos Cadastros, qualquer alteracao liga `CAD.pend`: nada e gravado ate "Salvar"; "Descartar" devolve config, pecas, formulario e romaneio.
   Em teste automatizado (`navigator.webdriver`) vale o modo antigo (`CADAUTO`: grava na hora).
3. `renderCfg` monta as secoes em `estadoConfig.secs` (via `sec`) e desenha a aba aberta (`abertos.tab`).
4. Excluir banho: `bnExcluirSeguro` reserva `cadpecas-uso` (exclusivo), confere tabelas e romaneios salvos e so entao remove; com `CADAUTO` grava por `salvarCancelarAgendado`/`salvarEncadear` (armazenamento).
## O que a fatia expoe e por que
`renderCfg` (quase todo o app redesenha a tela), `estadoConfig` (18 apaga `delCat`; onField le `renBusy`/`faixaBusy`), `catUI`, `atualizaPrevia`, `subRenomear`, `dupCampo`, `dupOk`,
`focoChip`, `corNovaOk`, `fiscalCampo`, `romUI`, `romExAtualiza`, `trocarPrefixo` (handlers de `app`: onField e teclado), `prefixoEmUso` (`core/dominio.js` `prefixoNovo` chama no navegador),
`qIrGalvanica` (`lancamento/acoes.js`: a ferramenta nao ve usos dentro de `registrarAcoes`), `impactoAgendar` (armazenamento, ao salvar). Usa `fotos`, `romaneio` (`renderRom`, `ROM`), `planilha`, `lancamento`, `armazenamento`.
## Armadilhas
- `37-moeda.js` so dispara `input`, NUNCA `change` (o `input` ja alimenta o cadastro). Nao troque por `change` sem rodar os testes de cadastro.
- `estadoConfig` guarda o que era global: `secs`, `libtam`, `renBusy`, `faixaBusy`, `resetArm`, `delCat`, `galvSel`, `drag`, `bnReserva`, `bnReservando`, `bnEmExclusao`.
  `impConfigAntes`/`impT` (21d2) seguem globais: `tests/impacto_cadastro_regressao.js` recorta o arquivo a partir de `let impConfigAntes=`.
## Pendencias e acoplamentos a desfazer
- AUD-A-007 (alteracao nao salva de uma variacao e descartada ao editar outra, `15-planilha.js`): documentado, nao corrigido.
- Handlers de `change`/`input`/`keydown` dos cadastros (`data-cf`, `data-bnf`, `data-ff`, `data-mod`, `data-dup`...) estao em `app/31c-on-field.js` e `app/32-eventos-entrada-e-teclado.js`:
  pedacos de listeners que atendem todas as telas; nao da para dividir com `dividir_arquivo`.
- `modPrev`/`secModelo` (19a3) misturam configuracao com exportacao. Linhas acima de 160 caracteres em todos os arquivos (minificado a mao): reformatar antes de mexer a fundo.

## Estado agrupado
Etapa 4.1: `romUI`, `impT` e `impConfigAntes` viraram campos de `estadoConfig` (19-catalogo-rapido.js).
