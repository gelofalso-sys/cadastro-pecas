# Fatia fotos

## Para que serve
Tudo o que trata a foto de uma peca (miniatura na peca + original em IndexedDB, store `fotos`):
- escolher (`#ftIn`), arrastar para uma linha/formulario ou colar com Ctrl+V; uma foto vira `fotoNaPeca`, varias `fotosEmLote`;
- anexar/remover (`fotoDoFormulario`, `fotoRemover`) e copiar a foto original ao duplicar (`fotoCopia`);
- envio ao imgbb para ter link publico (`enviarFotos`, `enviarFoto`, `fotoReduzida`, `testarChaveImgbb`), manual ou automatico (`autoEnviar`);
- ampliar com zoom (`abrirZoom`, `melhorarFoto`), usado pela coluna Foto e pelo romaneio.

## Arquivos
- `22b-zoom-foto.js`: `melhorarFoto`, `abrirZoom` (cortado do fim de `src/js/22`; `miniFoto`/`imgCanvas` ficaram la porque so o leitor de PDF do romaneio os usa).
- `23-fotos-imgbb.js`: `estadoFotos`, chave/envio imgbb (o resto do antigo 23 ficou em `src/js/23b-romaneio-criar.js` e `23c-nota-fiscal.js`).
- `27-fotos-escolher-colar.js`: ler/anexar/remover foto e a IIFE de `#ftIn`, dragover/drop e paste de imagens.
- `27c-foto-copia.js`: `fotoCopia`. `acoes.js`: fotos-enviar, foto-testar, foto-add, foto-form, foto-rem, tab-foto.
- O resto do antigo 27 (adicionar, desfazer, editar, cancelar...) e `duplicar/excluir` ficam em `src/js/27b` e `27d` (fatia `lancamento`).

## Estado
`estadoFotos = {grande, alvo, enviando}` (antes `FT_GRANDE`, `ftAlvo`, `fotosEnv`; globais 88 para 85).

## Por que `expoe` e longo
`estadoFotos` (21b escolhe a foto do romaneio, 27b guarda a foto grande), `fotoNaPeca` e `lerFotoArquivo` (21b), `fotoCopia` (27d),
`autoEnviar` (27b), `fotoKey` e `fotoAuto` (tela Cadastros, fatia `configuracao`, que por isso lista `fotos` em `usa`).

## Armadilhas e pendencias
- A chave do imgbb e segredo do usuario (`localStorage` `cadpecas-imgbb`): nunca logar nem copiar para testes/relatorios.
- `foto-rem-rom` e `rom-foto` ficaram no switch de 30 (fluxo do romaneio, `romFoto*` em 21b).
- Handler de `change` do envio automatico (`data-fauto`) segue dentro de 31 (pedaco de handler maior); os de `paste`/`drop` de importacao de PDF/planilha em 32 sao de outras fatias.
- AUD-I-001 (foto `img[data-act=tab-foto]` sem foco por teclado) e AUD-A-008 (exclusao com falha de IDB) conhecidos, sem correcao aqui.
- Linhas >160 caracteres (codigo compactado): 41 nos arquivos da fatia; nao reformatadas.
