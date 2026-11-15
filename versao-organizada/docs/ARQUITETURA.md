# Arquitetura (gerado)

Gerado por `npm run mapa` (tools/mapa.mjs). Nao edite a mao; `node tools/mapa.mjs --conferir` falha se estiver desatualizado.

## Fatias

### configuracao

Tela Cadastros e personalizacao (categorias, banhos, fornecedores, insumos, cores, variacoes, modelos de exportacao, modelos de leitura de romaneio, fiscal das categorias), catalogo rapido, salvar/descartar cadastros e campos em reais.

- Arquivos: `19-catalogo-rapido.js`, `19a-secao-categorias.js`, `19a3-secao-exportar-para.js`, `21a5-modelo-por-exemplo.js`, `21b4-fiscal-categorias.js`, `25a-secao-romaneios.js`, `25b-cadastros-render.js`, `34c-cartoes-categoria.js`, `36-cadastros-salvar.js`, `37-moeda.js`, `acoes.js`
- Expoe: `CAD`, `CADAUTO`, `atualizaPrevia`, `cadConferir`, `cadTirarFoto`, `catUI`, `corNovaOk`, `dupCampo`, `dupOk`, `estadoConfig`, `fiscalCampo`, `focoChip`, `renderCfg`, `romExAtualiza`, `romUI`, `subRenomear`
- Usa: `core`, `fotos`, `planilha`, `romaneio`
- Usada por: `legado`
- Testes: `^categoria_exclusao_regressao.js$`, `^t1.py$`, `^t10.py$`, `^t102_banho_concorrencia.py$`, `^t115_auditoria_layout.js$`, `^t13.py$`, `^t17.py$`, `^t18.py$`, `^t19.py$`, `^t2.py$`, `^t20.py$`, `^t21.py$`, `^t24.py$`, `^t25.py$`, `^t28.py$`, `^t29.py$`, `^t3.py$`, `^t30.py$`, `^t49.py$`, `^t51.py$`, `^t54.py$`, `^t58.py$`, `^t6.py$`, `^t69_insumos.py$`, `^t7.py$`, `^t87_ajustes_cadastros.py$`, `^t88_fluxo_cadastro.js$`, `^t91_fluxo_agil.js$`, `^t98_banho_componente.py$`
- Globais mutaveis: 1
- Fronteira: falha

### exportacao

Exportar a tabela (xlsx/csv/copiar) com conferencia previa, assistente de outro sistema, modelos em .json, importar planilha de referencia e copia/restauracao dos cadastros.

- Arquivos: `19b-assistente-outro-sistema.js`, `28-exportar.js`, `29-importar-e-copia.js`, `acoes.js`
- Expoe: `abrirNovoSistema`, `baixar`, `copiar`, `estadoExportacao`, `importar`, `lerNovo`, `modeloDeJson`, `obterDL`, `restaurar`
- Usa: `core`, `planilha`
- Usada por: `legado`, `romaneio`
- Testes: `^backup_exclusao_pendente\.js$`, `^t100_xml_precisao\.py$`, `^t33\.py$`, `^t34\.py$`, `^t35\.py$`, `^t36\.py$`, `^t40\.py$`, `^t46\.py$`, `^t48\.py$`, `^t56_conjunto_romaneio\.py$`, `^t58_backup_integridade\.py$`, `^t60_varejo\.py$`, `^t65_categoria_conjunto\.py$`, `^t67_conjunto_quantidade\.py$`, `^t67_referencias_cores\.py$`, `^t69_banho_categoria_quantidade\.py$`, `^t69_banho_divisoes_exportacao\.py$`, `^t69_banho_fixo_categoria_quantidade\.py$`, `^t69_insumos\.py$`, `^t69_lote_por_grama_categorias\.py$`, `^t71_romaneios_reais\.py$`, `^t78_baixar_selecionadas\.py$`, `^t87_ajustes_cadastros\.py$`, `^t90_banco_backup\.js$`, `^t93_revisao_agil\.js$`, `^t94_backup_real\.py$`, `^t95_lapidacao\.py$`, `^t96_fluxos\.py$`
- Globais mutaveis: 0
- Fronteira: falha

### fotos

Fotos das pecas: escolher, arrastar ou colar (Ctrl+V), anexar/remover (inclusive a foto de cada item do romaneio), copia ao duplicar, envio ao imgbb (link publico), teste da chave e ampliacao com zoom.

- Arquivos: `21b1-fotos-romaneio.js`, `22b-zoom-foto.js`, `23-fotos-imgbb.js`, `27-fotos-escolher-colar.js`, `27c-foto-copia.js`, `acoes.js`
- Expoe: `autoEnviar`, `estadoFotos`, `fotoAuto`, `fotoCopia`, `fotoKey`
- Usa: `core`, `planilha`, `romaneio`
- Usada por: `configuracao`, `legado`
- Testes: `^calculos_precisao_regressao.js$`, `^pdf_fotos_regressao.js$`, `^seguranca_compat_regressao.js$`, `^t103_mobile_fluxos.js$`, `^t110_romaneio_preservacao.js$`, `^t64_acessibilidade.py$`, `^t7.py$`, `^t74_romaneio_extras.py$`
- Globais mutaveis: 0
- Fronteira: falha

### planilha

Tela principal: tabela (planilha) das pecas lancadas com filtros, vistas (planilha/lista/cartoes), janela de linhas, selecao de celulas e linhas, edicao e colagem na grade, acoes em lote, totais e grafico de rosca, gaveta do formulario no celular e pilula de recolher.

- Arquivos: `15-planilha.js`, `15c-listas-e-janela.js`, `15e-renderizar-planilha.js`, `15f-edicao-celula.js`, `15g-planilha-colar.js`, `16-selecao.js`, `19a2-grafico-rosca.js`, `24-ui-numeracao-e-colunas.js`, `30b-planilha-mouse.js`, `31b-planilha-regua-e-destaque.js`, `32b-planilha-digitacao-celula.js`, `33b-planilha-rolagem-janela.js`, `34-filtros-e-pilula.js`, `acoes.js`
- Expoe: `casa`, `celular`, `estadoPlanilha`, `filtroOn`, `formAbrir`, `guardarFil`, `janGarantir`, `pilulaAtualiza`, `renderListas`, `renderTopo`, `rolarAte`, `selecionar`, `vis`
- Usa: `core`
- Usada por: `configuracao`, `exportacao`, `fotos`, `legado`, `romaneio`, `tabelas`
- Testes: `^pdf_real2\.py$`, `^perf_5000\.py$`, `^t108_colagem_salto\.js$`, `^t10\.py$`, `^t110_romaneio_preservacao\.js$`, `^t32\.py$`, `^t33\.py$`, `^t34\.py$`, `^t35\.py$`, `^t37\.py$`, `^t39\.py$`, `^t40\.py$`, `^t41\.py$`, `^t44\.py$`, `^t46\.py$`, `^t53\.py$`, `^t63_migracao_legada\.py$`, `^t66_clique_celula\.py$`, `^t74_romaneio_extras\.py$`, `^t85_lote_numerado\.py$`, `^t93_revisao_agil\.js$`
- Globais mutaveis: 1
- Fronteira: falha

### romaneio

Romaneio do fornecedor: colar/ler lista, PDF, foto, planilha e XML/DANFE (nota fiscal), cartoes dos itens, lote por peso, partir/juntar, insumos rateados, revisao final, criar as pecas, relatorio da criacao e fila de importacao.

- Arquivos: `19c-colar-romaneio.js`, `21-edicao-em-lote.js`, `21a-revisao-final.js`, `21a2-cartoes-romaneio.js`, `21a3-lote-e-partes.js`, `21a4-planilha-romaneio.js`, `21a6-campos-e-leitura.js`, `21b-peca-nova.js`, `21b-romaneio-extras.js`, `21b5-passos-romaneio.js`, `22-importar-pdf-romaneio.js`, `23b-romaneio-criar.js`, `23c-nota-fiscal.js`, `25-relatorio-romaneio.js`, `34b-importacao-romaneio.js`, `acoes.js`
- Expoe: `NF`, `arqSalvar`, `impAdd`, `impData`, `nfFechar`, `nfRotear`, `relTem`, `renderRom`, `romAtual`, `romAtualSoon`, `romCampo`, `romPdf`, `romPlanilha`, `romRevisar`, `romSetForn`
- Usa: `core`, `exportacao`, `planilha`
- Usada por: `configuracao`, `fotos`, `legado`
- Testes: `^auditoria_regressoes.js$`, `^auditoria_xml_importacao.py$`, `^calculos_auditoria_regressao.js$`, `^calculos_precisao_regressao.js$`, `^insumos_exclusoes_regressao.js$`, `^nf_criacao_async_regressao.js$`, `^pdf_fotos_regressao.js$`, `^romaneio_categoria.js$`, `^t100_xml_precisao.py$`, `^t103_insumos_frete.py$`, `^t110_romaneio_preservacao.js$`, `^t117_planilha_sistema_romaneio.js$`, `^t22.py$`, `^t24.py$`, `^t26.py$`, `^t27.py$`, `^t42.py$`, `^t43.py$`, `^t45.py$`, `^t52.py$`, `^t53.py$`, `^t58.py$`, `^t65_div_categoria.py$`, `^t67_conjunto_quantidade.py$`, `^t69_banho_divisoes_exportacao.py$`, `^t69_lote_por_grama_categorias.py$`, `^t71_romaneios_reais.py$`, `^t72_romaneio_peso_e_trios.py$`, `^t74_romaneio_extras.py$`, `^t75_romaneio_frete_e_pendencias.py$`, `^t77_lote_sem_bloqueio.py$`, `^t82_lote_peso_real.py$`, `^t85_lote_numerado.py$`, `^t95_lapidacao.py$`, `^t96_auditoria_calculos.py$`, `^t96_fluxos.py$`, `^t97_xml_criacao.py$`, `^t99_rateio_exato.py$`
- Globais mutaveis: 2
- Fronteira: falha

### tabelas

Tabelas salvas (historico de tabelas montadas, salvar/restaurar/ver/excluir/CSV), ver romaneio, indice de tabelas no localStorage, historico de sugestoes e varredura de fotos vivas/orfas.

- Arquivos: `19d-tabelas-indice-e-fotos.js`, `19d2-tabelas-salvar-e-ver.js`, `acoes.js`
- Expoe: `arqRef`, `estadoTabelas`, `gravarIdx`, `histSugAgendar`, `pontosIds`, `setAutor`, `tabIndex`, `tabsMigrar`, `varrerFotos`, `varrerTudo`
- Usa: `core`, `planilha`, `romaneio`
- Usada por: `legado`
- Testes: `^backup_auditoria_integridade\.js$`, `^interrupcao_exclusao\.js$`, `^interrupcao_exclusao_real\.js$`, `^t101_tabela_exclusao\.py$`, `^t44\.py$`, `^t58_backup_integridade\.py$`, `^tabela_exclusao_integridade\.js$`
- Globais mutaveis: 0
- Fronteira: falha

## Dependencias reais entre donos

| de -> para | simbolos |
|---|---|
| configuracao -> core | 37: `BANHO_COLS`, `DEFAULT_CONFIG`, `EXPL`, `FISC_COLS`, `FISC_PAD`, `FORMULA`, `JUERI_CATS`, `LET`, ... |
| configuracao -> fotos | 2: `fotoAuto`, `fotoKey` |
| configuracao -> legado | 50: `G`, `HIST`, `REDO`, `ROM`, `ROMS`, `S`, `abertos`, `bancoGeralLista`, ... |
| configuracao -> planilha | 1: `renderTopo` |
| configuracao -> romaneio | 1: `renderRom` |
| exportacao -> core | 33: `COLW`, `DUAS`, `LET`, `LIM_EXPORT`, `MAX_BACKUP_BYTES`, `MAX_PLANILHA_BYTES`, `MAX_PLANILHA_LINHAS`, `NOME`, ... |
| exportacao -> legado | 27: `S`, `cfg`, `chaveDoCabecalho`, `checaLinhasPlan`, `colunasExport`, `conferirExport`, `faixaRefs`, `fnum`, ... |
| exportacao -> planilha | 3: `casa`, `filtroOn`, `renderTopo` |
| fotos -> core | 8: `MAX_FOTO_BYTES`, `candFoto`, `checaTam`, `esc`, `fs`, `ftOk`, `refBase`, `vazio` |
| fotos -> legado | 16: `G`, `ROM`, `S`, `editId`, `editSnap`, `formSujo`, `ftSalvas`, `gerar`, ... |
| fotos -> planilha | 3: `casa`, `filtroOn`, `renderTopo` |
| fotos -> romaneio | 1: `renderRom` |
| legado -> configuracao | 13: `CAD`, `CADAUTO`, `atualizaPrevia`, `cadConferir`, `cadTirarFoto`, `catUI`, `dupCampo`, `estadoConfig`, ... |
| legado -> exportacao | 3: `abrirNovoSistema`, `estadoExportacao`, `obterDL` |
| legado -> fotos | 3: `autoEnviar`, `estadoFotos`, `fotoCopia` |
| legado -> planilha | 9: `celular`, `estadoPlanilha`, `formAbrir`, `guardarFil`, `janGarantir`, `pilulaAtualiza`, `renderListas`, `renderTopo`, ... |
| legado -> romaneio | 6: `impData`, `relTem`, `renderRom`, `romAtualSoon`, `romCampo`, `romSetForn` |
| legado -> tabelas | 8: `arqRef`, `gravarIdx`, `histSugAgendar`, `pontosIds`, `setAutor`, `tabIndex`, `tabsMigrar`, `varrerFotos` |
| planilha -> core | 24: `BANHO_COLS`, `DUAS`, `FORM0`, `FORMULA`, `LET`, `MONEY`, `NOME`, `NUM`, ... |
| planilha -> legado | 39: `G`, `S`, `abertos`, `avisos`, `cancelar`, `catBy`, `celEd`, `cfg`, ... |
| romaneio -> core | 60: `LET`, `MAX_PDF_BYTES`, `MAX_PLANILHA_BYTES`, `MAX_PLANILHA_LINHAS`, `MAX_TEXTO_COLADO`, `NFKEY`, `NOME`, `ROMKEY`, ... |
| romaneio -> exportacao | 1: `obterDL` |
| romaneio -> legado | 94: `ARQ`, `AUTOR`, `G`, `ROM`, `ROMS`, `S`, `TABS`, `abertos`, ... |
| romaneio -> planilha | 1: `renderTopo` |
| tabelas -> core | 19: `LET`, `PONTO_IDS`, `TABDEL`, `brl`, `candFoto`, `celulas`, `clone`, `codsDe`, ... |
| tabelas -> legado | 34: `ARQ`, `AUTOR`, `HIST`, `HIST_SUG`, `REDO`, `S`, `TABS`, `avisoEdicao`, ... |
| tabelas -> planilha | 1: `renderListas` |

## Globais mutaveis por dono

| dono | globais |
|---|---|
| configuracao | 1 |
| legado | 64 |
| planilha | 1 |
| romaneio | 2 |
