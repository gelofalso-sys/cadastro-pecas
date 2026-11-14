# Arquitetura (gerado)

Gerado por `npm run mapa` (tools/mapa.mjs). Nao edite a mao; `node tools/mapa.mjs --conferir` falha se estiver desatualizado.

## Fatias

### configuracao

Tela Cadastros e personalizacao (categorias, banhos, fornecedores, insumos, cores, variacoes, modelos de exportacao), catalogo rapido, salvar/descartar cadastros e campos em reais.

- Arquivos: `19-catalogo-rapido.js`, `19a-secao-categorias.js`, `19a2-grafico-rosca.js`, `19a3-secao-exportar-para.js`, `25b-cadastros-render.js`, `36-cadastros-salvar.js`, `37-moeda.js`, `acoes.js`
- Expoe: `CAD`, `CADAUTO`, `atualizaPrevia`, `cadConferir`, `cadTirarFoto`, `catUI`, `corNovaOk`, `dupCampo`, `dupOk`, `estadoConfig`, `focoChip`, `renderCfg`, `renderGraf`, `sec`, `subRenomear`
- Usa: `core`, `fotos`
- Usada por: `legado`
- Testes: `^categoria_exclusao_regressao.js$`, `^t1.py$`, `^t10.py$`, `^t102_banho_concorrencia.py$`, `^t115_auditoria_layout.js$`, `^t13.py$`, `^t17.py$`, `^t18.py$`, `^t19.py$`, `^t2.py$`, `^t20.py$`, `^t21.py$`, `^t24.py$`, `^t25.py$`, `^t28.py$`, `^t29.py$`, `^t3.py$`, `^t30.py$`, `^t49.py$`, `^t51.py$`, `^t54.py$`, `^t58.py$`, `^t6.py$`, `^t69_insumos.py$`, `^t7.py$`, `^t87_ajustes_cadastros.py$`, `^t88_fluxo_cadastro.js$`, `^t91_fluxo_agil.js$`, `^t98_banho_componente.py$`
- Globais mutaveis: 0
- Fronteira: falha

### exportacao

Exportar a tabela (xlsx/csv/copiar) com conferencia previa, assistente de outro sistema, modelos em .json, importar planilha de referencia e copia/restauracao dos cadastros.

- Arquivos: `19b-assistente-outro-sistema.js`, `28-exportar.js`, `29-importar-e-copia.js`, `acoes.js`
- Expoe: `abrirNovoSistema`, `baixar`, `copiar`, `estadoExportacao`, `importar`, `lerNovo`, `modeloDeJson`, `obterDL`, `restaurar`
- Usa: `core`
- Usada por: `legado`
- Testes: `^backup_exclusao_pendente\.js$`, `^t100_xml_precisao\.py$`, `^t33\.py$`, `^t34\.py$`, `^t35\.py$`, `^t36\.py$`, `^t40\.py$`, `^t46\.py$`, `^t48\.py$`, `^t56_conjunto_romaneio\.py$`, `^t58_backup_integridade\.py$`, `^t60_varejo\.py$`, `^t65_categoria_conjunto\.py$`, `^t67_conjunto_quantidade\.py$`, `^t67_referencias_cores\.py$`, `^t69_banho_categoria_quantidade\.py$`, `^t69_banho_divisoes_exportacao\.py$`, `^t69_banho_fixo_categoria_quantidade\.py$`, `^t69_insumos\.py$`, `^t69_lote_por_grama_categorias\.py$`, `^t71_romaneios_reais\.py$`, `^t78_baixar_selecionadas\.py$`, `^t87_ajustes_cadastros\.py$`, `^t90_banco_backup\.js$`, `^t93_revisao_agil\.js$`, `^t94_backup_real\.py$`, `^t95_lapidacao\.py$`, `^t96_fluxos\.py$`
- Globais mutaveis: 0
- Fronteira: falha

### fotos

Fotos das pecas: escolher, arrastar ou colar (Ctrl+V), anexar/remover, copia ao duplicar, envio ao imgbb (link publico), teste da chave e ampliacao com zoom.

- Arquivos: `22b-zoom-foto.js`, `23-fotos-imgbb.js`, `27-fotos-escolher-colar.js`, `27c-foto-copia.js`, `acoes.js`
- Expoe: `autoEnviar`, `estadoFotos`, `fotoAuto`, `fotoCopia`, `fotoKey`, `fotoNaPeca`, `lerFotoArquivo`
- Usa: `core`
- Usada por: `configuracao`, `legado`
- Testes: `^calculos_precisao_regressao.js$`, `^pdf_fotos_regressao.js$`, `^seguranca_compat_regressao.js$`, `^t103_mobile_fluxos.js$`, `^t110_romaneio_preservacao.js$`, `^t64_acessibilidade.py$`, `^t7.py$`, `^t74_romaneio_extras.py$`
- Globais mutaveis: 0
- Fronteira: falha

### tabelas

Tabelas salvas (historico de tabelas montadas, salvar/restaurar/ver/excluir/CSV), ver romaneio, indice de tabelas no localStorage, historico de sugestoes e varredura de fotos vivas/orfas.

- Arquivos: `19d-tabelas-indice-e-fotos.js`, `19d2-tabelas-salvar-e-ver.js`, `acoes.js`
- Expoe: `arqRef`, `estadoTabelas`, `gravarIdx`, `histSugAgendar`, `pontosIds`, `setAutor`, `tabIndex`, `tabsMigrar`, `varrerFotos`, `varrerTudo`
- Usa: `core`
- Usada por: `legado`
- Testes: `^backup_auditoria_integridade\.js$`, `^interrupcao_exclusao\.js$`, `^interrupcao_exclusao_real\.js$`, `^t101_tabela_exclusao\.py$`, `^t44\.py$`, `^t58_backup_integridade\.py$`, `^tabela_exclusao_integridade\.js$`
- Globais mutaveis: 0
- Fronteira: falha

## Dependencias reais entre donos

| de -> para | simbolos |
|---|---|
| configuracao -> core | 34: `BANHO_COLS`, `DEFAULT_CONFIG`, `EXPL`, `FORMULA`, `JUERI_CATS`, `LET`, `MODELOS_CAT`, `NOME`, ... |
| configuracao -> fotos | 2: `fotoAuto`, `fotoKey` |
| configuracao -> legado | 50: `G`, `HIST`, `REDO`, `ROM`, `ROMS`, `S`, `abertos`, `bancoGeralLista`, ... |
| exportacao -> core | 33: `COLW`, `DUAS`, `LET`, `LIM_EXPORT`, `MAX_BACKUP_BYTES`, `MAX_PLANILHA_BYTES`, `MAX_PLANILHA_LINHAS`, `NOME`, ... |
| exportacao -> legado | 30: `S`, `casa`, `cfg`, `chaveDoCabecalho`, `checaLinhasPlan`, `colunasExport`, `conferirExport`, `faixaRefs`, ... |
| fotos -> core | 8: `MAX_FOTO_BYTES`, `candFoto`, `checaTam`, `esc`, `fs`, `ftOk`, `refBase`, `vazio` |
| fotos -> legado | 17: `G`, `S`, `casa`, `editId`, `editSnap`, `filtroOn`, `formSujo`, `ftSalvas`, ... |
| legado -> configuracao | 12: `CAD`, `CADAUTO`, `atualizaPrevia`, `cadConferir`, `cadTirarFoto`, `catUI`, `dupCampo`, `estadoConfig`, ... |
| legado -> exportacao | 3: `abrirNovoSistema`, `estadoExportacao`, `obterDL` |
| legado -> fotos | 5: `autoEnviar`, `estadoFotos`, `fotoCopia`, `fotoNaPeca`, `lerFotoArquivo` |
| legado -> tabelas | 8: `arqRef`, `gravarIdx`, `histSugAgendar`, `pontosIds`, `setAutor`, `tabIndex`, `tabsMigrar`, `varrerFotos` |
| tabelas -> core | 19: `LET`, `PONTO_IDS`, `TABDEL`, `brl`, `candFoto`, `celulas`, `clone`, `codsDe`, ... |
| tabelas -> legado | 35: `ARQ`, `AUTOR`, `HIST`, `HIST_SUG`, `REDO`, `S`, `TABS`, `avisoEdicao`, ... |

## Globais mutaveis por dono

| dono | globais |
|---|---|
| legado | 85 |
