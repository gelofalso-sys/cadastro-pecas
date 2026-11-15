# Fatia fotos

## Para que serve
Tudo o que trata a foto de uma peca (miniatura na peca + original em IndexedDB, store `fotos`):
- escolher (`#ftIn`), arrastar para uma linha/formulario ou colar com Ctrl+V; uma foto vira `fotoNaPeca`, varias `fotosEmLote`;
- anexar/remover (`fotoDoFormulario`, `fotoRemover`) e copiar a foto original ao duplicar (`fotoCopia`);
- envio ao imgbb para ter link publico (`enviarFotos`, `enviarFoto`, `fotoReduzida`, `testarChaveImgbb`), manual ou automatico (`autoEnviar`);
- ampliar com zoom (`abrirZoom`, `melhorarFoto`), usado pela coluna Foto e pelo romaneio.

## Arquivos
- `22b-zoom-foto.js`: `melhorarFoto`, `abrirZoom` (cortado do fim de `src/js/22`; `miniFoto`/`imgCanvas` ficaram no leitor de PDF, hoje `fatias/romaneio/22`).
- `23-fotos-imgbb.js`: `estadoFotos`, chave/envio imgbb (o resto do antigo 23 ficou em `src/js/23b-romaneio-criar.js` e `23c-nota-fiscal.js`).
- `27-fotos-escolher-colar.js`: ler/anexar/remover foto e a IIFE de `#ftIn`, dragover/drop e paste de imagens.
- `27c-foto-copia.js`: `fotoCopia`. `acoes.js`: fotos-enviar, foto-testar, foto-add, foto-form, foto-rem, tab-foto, rom-foto, rom-foto-add, rom-foto-del, foto-rem-rom.
- `21b1-fotos-romaneio.js` (Tarefa 14, veio de 21b): foto de cada item do romaneio (`romFotoEscolher`, `romFotoGravar`, `romFotosEscolhidas`, `romFotoRemover`).
- O resto do antigo 27: `adicionar`, `editar`, `cancelar` na fatia `lancamento`; `desfazer` (src/js/27b2) e `duplicar/excluir` (src/js/27d) no legado.

## Estado
`estadoFotos = {grande, alvo, enviando}` (antes `FT_GRANDE`, `ftAlvo`, `fotosEnv`; globais 88 para 85).

## Por que `expoe` e longo
`estadoFotos` (`adicionar`, do lancamento, guarda a foto grande), `fotoCopia` (27d),
`autoEnviar` (`adicionar`), `fotoKey` e `fotoAuto` (tela Cadastros, fatia `configuracao`, que por isso lista `fotos` em `usa`).
Usa `romaneio` (`renderRom`, depois de anexar/remover a foto de um item). As fotos do romaneio ficaram aqui para cortar o ciclo fotos <-> romaneio.

## Armadilhas e pendencias
- A chave do imgbb e segredo do usuario (`localStorage` `cadpecas-imgbb`): nunca logar nem copiar para testes/relatorios.
- `foto-rem-rom` apaga `ftR` (foto do romaneio guardada na peca/formulario); toca `S.form`/`editId` (legado do lancamento).
- Handler de `change` do envio automatico (`data-fauto`) segue dentro de 31 (pedaco de handler maior); os de `paste`/`drop` de importacao de PDF/planilha em 32 sao de outras fatias.
- AUD-I-001 (foto `img[data-act=tab-foto]` sem foco por teclado) e AUD-A-008 (exclusao com falha de IDB) conhecidos, sem correcao aqui.
- Linhas >160 caracteres (codigo compactado): 41 nos arquivos da fatia; nao reformatadas.
- Usa `planilha`: `casa`/`filtroOn`, `renderTopo`, `estadoPlanilha.selR` (27). Usa `lancamento`: `renderForm`, `formSujo`, `estadoLancamento.editSnap` (27 e acoes:
  foto da peca em edicao). O uso inverso (`adicionar` le `estadoFotos`/`autoEnviar`) e violacao pendente da fatia `lancamento` (ciclo).
