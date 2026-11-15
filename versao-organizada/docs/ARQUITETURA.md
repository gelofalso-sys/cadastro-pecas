# Arquitetura (gerado)

Gerado por `npm run mapa` (tools/mapa.mjs). Nao edite a mao; `node tools/mapa.mjs --conferir` falha se estiver desatualizado.

## Fatias

### app

Casca do aplicativo: janelas (foco preso, Esc), paleta de comandos (Ctrl+K), menu lateral e menu do celular, divisoria, abertura dos dados, novidades, historico, aviso de origem, o despacho dos cliques (ACOES e o switch residual) e os listeners globais de entrada, teclado, colar e soltar arquivo (onField).

- Arquivos: `18c-divisoria.js`, `21d-novidades.js`, `21d5-historico.js`, `21d7-origem-aviso.js`, `30a2-eventos-toggle.js`, `30c-clique-acoes.js`, `31c-on-field.js`, `32-abas-rolagem.js`, `32-eventos-entrada-e-teclado.js`, `32-soltar-arquivo.js`, `33-janelas-busca-e-paleta.js`, `33c-abertura.js`, `33c-paleta-comandos.js`, `35-menu-e-final.js`
- Expoe: `sideMarcar`
- Usa: `armazenamento`, `configuracao`, `core`, `exportacao`, `fotos`, `lancamento`, `planilha`, `romaneio`, `tabelas`
- Usada por: `legado`
- Testes: `^historico_voltar_regressao\.js$`, `^t103_mobile_fluxos\.js$`, `^t119_nota_sidebar\.js$`, `^t120_edicao_romaneio_menu_numeracao\.py$`, `^t21\.py$`, `^t30\.py$`, `^t44\.py$`, `^t55\.py$`, `^t56\.py$`, `^t78_baixar_selecionadas\.py$`, `^t92_mobile_agil\.js$`, `^t95_lapidacao\.py$`
- Globais mutaveis: 0
- Fronteira: falha

### armazenamento

Persistencia dos dados: salvar/flush (localStorage e conta), historico de desfazer/refazer, miniaturas no IndexedDB, pontos de restauracao, backup em pasta, backup completo e restauracao com diario, diario de exclusoes, indice e rascunho de romaneios salvos, bloqueios entre abas e diagnostico dos dados.

- Arquivos: `14-persistencia.js`, `20-armazenamento-idb.js`, `21c-diagnostico-dados.js`, `21d6-lembrete-backup.js`, `27b2-desfazer.js`, `32-ler-indices.js`, `33c-lembrete-backup.js`, `33c-outra-aba.js`, `acoes.js`
- Expoe: `ARQ`, `AUTOR`, `HIST`, `REDO`, `ROMS`, `TABS`, `backupLembrarPosCriar`, `bkUsoIniciar`, `bkUsoParar`, `conflito`, `corrompido`, `db`, `definirArq`, `definirAutor`, `definirTabs`, `desfazer`, `dirty`, `exComLock`, `exReverter`, `exSalvarComLock`, `flush`, `flushJa`, `ftSalvas`, `histIni`, `histNota`, `lembreteBackup`, `migrarGrades`, `pontoAuto`, `pontoAviso`, `pontosCarregar`, `restaurando`, `romAbrirSalvo`, `romBadge`, `romConflito`, `romGravP`, `romHistAntes`, `romHistAplicar`, `romHistRegistrar`, `romInfo`, `romLimparRascunho`, `romListaTabela`, `romMarcar`, `romRetomar`, `romSalvar`, `romSalvarSoon`, `romTem`, `salvar`, `salvarCancelarAgendado`, `salvarEncadear`, `setStatus`, `snapC`, `snapL`, `tabArm`
- Usa: `core`
- Usada por: `app`, `configuracao`, `exportacao`, `fotos`, `lancamento`, `legado`, `planilha`, `romaneio`, `tabelas`
- Testes: `^backup_auditoria_integridade\.js$`, `^backup_exclusao_pendente\.js$`, `^backup_falha_regressao\.js$`, `^exclusao_falha_sincrona\.js$`, `^interrupcao_exclusao\.js$`, `^interrupcao_exclusao_real\.js$`, `^t101_tabela_exclusao\.py$`, `^t102_banho_concorrencia\.py$`, `^t110_romaneio_preservacao\.js$`, `^t18\.py$`, `^t57_rom_historico\.py$`, `^t58\.py$`, `^t58_backup_integridade\.py$`, `^t59_conflito_quota\.py$`, `^t60_crash_restauracao\.py$`, `^t61_journal_quota\.py$`, `^t62_backup_duas_abas\.py$`, `^t63_migracao_legada\.py$`, `^t67_rom_acesso\.py$`, `^t70_conta_tabela\.py$`, `^t80_abrir_sem_idb\.py$`, `^t94_backup_real\.py$`, `^tabela_exclusao_integridade\.js$`
- Globais mutaveis: 24
- Fronteira: aponta

### configuracao

Tela Cadastros e personalizacao (categorias, banhos, fornecedores, insumos, cores, variacoes, modelos de exportacao, modelos de leitura de romaneio, fiscal das categorias), catalogo rapido, salvar/descartar cadastros e campos em reais.

- Arquivos: `18a-conjunto-excluir-categoria.js`, `19-catalogo-rapido.js`, `19a-secao-categorias.js`, `19a3-secao-exportar-para.js`, `21a5-modelo-por-exemplo.js`, `21b3-ir-galvanica.js`, `21b4-fiscal-categorias.js`, `21d2-impacto-cadastro.js`, `21d4-arrastar-ordem.js`, `25a-secao-romaneios.js`, `25b-cadastros-render.js`, `30-banho-exclusao-segura.js`, `31-banco-palavras.js`, `31-subren-sair.js`, `31c-trocar-prefixo.js`, `34c-cartoes-categoria.js`, `36-cadastros-salvar.js`, `37-moeda.js`, `acoes.js`
- Expoe: `atualizaPrevia`, `catUI`, `corNovaOk`, `dupCampo`, `dupOk`, `estadoConfig`, `fiscalCampo`, `focoChip`, `impactoAgendar`, `prefixoEmUso`, `qIrGalvanica`, `renderCfg`, `romExAtualiza`, `romUI`, `subRenomear`, `trocarPrefixo`
- Usa: `armazenamento`, `core`, `fotos`, `lancamento`, `planilha`, `romaneio`
- Usada por: `app`, `armazenamento`, `core`, `lancamento`, `legado`
- Testes: `^categoria_exclusao_regressao\.js$`, `^t102_banho_concorrencia\.py$`, `^t10\.py$`, `^t115_auditoria_layout\.js$`, `^t13\.py$`, `^t17\.py$`, `^t18\.py$`, `^t19\.py$`, `^t1\.py$`, `^t20\.py$`, `^t21\.py$`, `^t24\.py$`, `^t25\.py$`, `^t28\.py$`, `^t29\.py$`, `^t2\.py$`, `^t30\.py$`, `^t3\.py$`, `^t49\.py$`, `^t51\.py$`, `^t54\.py$`, `^t58\.py$`, `^t69_insumos\.py$`, `^t6\.py$`, `^t7\.py$`, `^t87_ajustes_cadastros\.py$`, `^t88_fluxo_cadastro\.js$`, `^t91_fluxo_agil\.js$`, `^t98_banho_componente\.py$`
- Globais mutaveis: 3
- Fronteira: falha

### exportacao

Exportar a tabela (xlsx/csv/copiar) com conferencia previa, assistente de outro sistema, modelos em .json, importar planilha de referencia e copia/restauracao dos cadastros.

- Arquivos: `13-modelo-e-variacoes.js`, `19b-assistente-outro-sistema.js`, `28-exportar.js`, `29-importar-e-copia.js`, `acoes.js`
- Expoe: `abrirNovoSistema`, `baixar`, `copiar`, `estadoExportacao`, `importar`, `lerNovo`, `modeloDeJson`, `obterDL`, `restaurar`
- Usa: `armazenamento`, `core`, `planilha`
- Usada por: `app`, `armazenamento`, `romaneio`
- Testes: `^backup_exclusao_pendente\.js$`, `^t100_xml_precisao\.py$`, `^t33\.py$`, `^t34\.py$`, `^t35\.py$`, `^t36\.py$`, `^t40\.py$`, `^t46\.py$`, `^t48\.py$`, `^t56_conjunto_romaneio\.py$`, `^t58_backup_integridade\.py$`, `^t60_varejo\.py$`, `^t65_categoria_conjunto\.py$`, `^t67_conjunto_quantidade\.py$`, `^t67_referencias_cores\.py$`, `^t69_banho_categoria_quantidade\.py$`, `^t69_banho_divisoes_exportacao\.py$`, `^t69_banho_fixo_categoria_quantidade\.py$`, `^t69_insumos\.py$`, `^t69_lote_por_grama_categorias\.py$`, `^t71_romaneios_reais\.py$`, `^t78_baixar_selecionadas\.py$`, `^t87_ajustes_cadastros\.py$`, `^t90_banco_backup\.js$`, `^t93_revisao_agil\.js$`, `^t94_backup_real\.py$`, `^t95_lapidacao\.py$`, `^t96_fluxos\.py$`
- Globais mutaveis: 0
- Fronteira: falha

### fotos

Fotos das pecas: escolher, arrastar ou colar (Ctrl+V), anexar/remover (inclusive a foto de cada item do romaneio), copia ao duplicar, envio ao imgbb (link publico), teste da chave e ampliacao com zoom.

- Arquivos: `21b1-fotos-romaneio.js`, `22b-zoom-foto.js`, `23-fotos-imgbb.js`, `27-fotos-escolher-colar.js`, `27c-foto-copia.js`, `acoes.js`
- Expoe: `autoEnviar`, `estadoFotos`, `fotoAuto`, `fotoCopia`, `fotoKey`
- Usa: `armazenamento`, `core`, `lancamento`, `planilha`, `romaneio`
- Usada por: `configuracao`, `lancamento`
- Testes: `^calculos_precisao_regressao\.js$`, `^pdf_fotos_regressao\.js$`, `^seguranca_compat_regressao\.js$`, `^t103_mobile_fluxos\.js$`, `^t110_romaneio_preservacao\.js$`, `^t64_acessibilidade\.py$`, `^t74_romaneio_extras\.py$`, `^t7\.py$`
- Globais mutaveis: 0
- Fronteira: falha

### lancamento

Formulario de lancamento de pecas: campos, tipo (bruta, pronta, conjunto), banhos, tamanhos e cores, previa das linhas e dos custos, painel rapido de cadastro, varias pecas de uma vez, conjunto, lancamento continuo e combinacoes, adicionar, editar, cancelar e repetir/usar como modelo.

- Arquivos: `16b-usar-modelo.js`, `17-lancamento.js`, `18-conjunto.js`, `21c2-descricao-cursor.js`, `21d1-campo-msg-e-simulador.js`, `21d3-primeiros-passos.js`, `26-formulario-apoio.js`, `27b-lancamento-formulario.js`, `27b3-editar.js`, `27b5-cancelar.js`, `27d-duplicar-excluir.js`, `29b-exemplo-visual.js`, `30a-formulario-envio-e-foco.js`, `30c0-ativar-conjunto.js`, `31-banco-busca.js`, `31a-continuo-campos.js`, `31c-ultima-peca.js`, `31c0-aplicar-faixa.js`, `31c2-campos-mistos.js`, `acoes.js`
- Expoe: `adicionar`, `aplicaFaixa`, `ativarConjunto`, `atualizarGera`, `avisoEdicao`, `campoMsg`, `cancelar`, `conjSync`, `dobrarOv`, `duplicar`, `duplicarLinha`, `editar`, `estadoLancamento`, `excluir`, `excluirLinhas`, `fatorDoPreco`, `focarPrimeiro`, `formSujo`, `limpaUlt`, `numFormMover`, `primeirosIr`, `renderForm`, `renderFormSoon`, `salvarRapido`, `tipoClique`, `usarModelo`
- Usa: `armazenamento`, `core`
- Usada por: `app`, `armazenamento`, `configuracao`, `fotos`, `legado`, `planilha`, `romaneio`, `tabelas`
- Testes: `^banho_arquivado_regressao\.js$`, `^banho_categorias_misto\.js$`, `^perf_5000\.py$`, `^t106_salto_planilha\.js$`, `^t108_colagem_salto\.js$`, `^t111_conjunto_prata_banhos\.js$`, `^t115_auditoria_layout\.js$`, `^t32\.py$`, `^t33\.py$`, `^t35\.py$`, `^t38\.py$`, `^t46\.py$`, `^t59_conflito_quota\.py$`, `^t67_conjunto_quantidade\.py$`, `^t69_contas_banho\.py$`, `^t73_lancamento_tipos_e_variacoes\.py$`, `^t79_sem_banho_por_grama\.py$`, `^t93_revisao_agil\.js$`
- Globais mutaveis: 0
- Fronteira: aponta

### planilha

Tela principal: tabela (planilha) das pecas lancadas com filtros, vistas (planilha/lista/cartoes), janela de linhas, selecao de celulas e linhas, edicao e colagem na grade, acoes em lote, totais e grafico de rosca, gaveta do formulario no celular e pilula de recolher.

- Arquivos: `12-celula-recusada.js`, `15-planilha.js`, `15c-listas-e-janela.js`, `15e-renderizar-planilha.js`, `15f-edicao-celula.js`, `15g-planilha-colar.js`, `16-selecao.js`, `19a2-grafico-rosca.js`, `24-ui-numeracao-e-colunas.js`, `27b1-mostrar-no-fim.js`, `30b-planilha-mouse.js`, `31b-planilha-regua-e-destaque.js`, `32b-planilha-digitacao-celula.js`, `33b-planilha-rolagem-janela.js`, `34-filtros-e-pilula.js`, `acoes.js`
- Expoe: `casa`, `celular`, `estadoPlanilha`, `filtroOn`, `formAbrir`, `guardarFil`, `mostrarNoFim`, `pilulaAtualiza`, `renderListas`, `renderTopo`, `rolarAte`, `selecionar`, `vis`
- Usa: `armazenamento`, `core`, `lancamento`
- Usada por: `app`, `armazenamento`, `configuracao`, `exportacao`, `fotos`, `lancamento`, `legado`, `romaneio`, `tabelas`
- Testes: `^pdf_real2\.py$`, `^perf_5000\.py$`, `^t106_salto_planilha\.js$`, `^t108_colagem_salto\.js$`, `^t10\.py$`, `^t110_romaneio_preservacao\.js$`, `^t32\.py$`, `^t33\.py$`, `^t34\.py$`, `^t35\.py$`, `^t37\.py$`, `^t39\.py$`, `^t40\.py$`, `^t41\.py$`, `^t44\.py$`, `^t46\.py$`, `^t53\.py$`, `^t63_migracao_legada\.py$`, `^t66_clique_celula\.py$`, `^t74_romaneio_extras\.py$`, `^t85_lote_numerado\.py$`, `^t93_revisao_agil\.js$`
- Globais mutaveis: 1
- Fronteira: falha

### romaneio

Romaneio do fornecedor: colar/ler lista, PDF, foto, planilha e XML/DANFE (nota fiscal), cartoes dos itens, lote por peso, partir/juntar, insumos rateados, revisao final, criar as pecas, relatorio da criacao e fila de importacao.

- Arquivos: `19c-colar-romaneio.js`, `19c0-romaneio-global.js`, `21-edicao-em-lote.js`, `21a-revisao-final.js`, `21a2-cartoes-romaneio.js`, `21a3-lote-e-partes.js`, `21a4-planilha-romaneio.js`, `21a6-campos-e-leitura.js`, `21b-peca-nova.js`, `21b-romaneio-extras.js`, `21b5-passos-romaneio.js`, `22-importar-pdf-romaneio.js`, `23b-romaneio-criar.js`, `23c-nota-fiscal.js`, `25-relatorio-romaneio.js`, `27b4-romaneio-abrir.js`, `32-romaneio-revisar-atalho.js`, `33c-romaneio-filtro-e-navegacao.js`, `34b-importacao-romaneio.js`, `acoes.js`
- Expoe: `NF`, `ROM`, `arqSalvar`, `impAdd`, `impData`, `nfFechar`, `nfRotear`, `relTem`, `renderRom`, `romAbrirNovo`, `romAtual`, `romAtualSoon`, `romCampo`, `romPdf`, `romPlanilha`
- Usa: `armazenamento`, `core`, `exportacao`, `lancamento`, `planilha`
- Usada por: `app`, `armazenamento`, `configuracao`, `fotos`, `lancamento`, `legado`
- Testes: `^auditoria_pdf_lote\.py$`, `^auditoria_regressoes\.js$`, `^auditoria_xml_importacao\.py$`, `^calculos_auditoria_regressao\.js$`, `^calculos_precisao_regressao\.js$`, `^insumos_exclusoes_regressao\.js$`, `^insumos_regressao\.js$`, `^nf_criacao_async_regressao\.js$`, `^pdf_fotos_regressao\.js$`, `^romaneio_categoria\.js$`, `^romaneio_total_peso\.js$`, `^t100_xml_precisao\.py$`, `^t101_rom_descartar\.py$`, `^t103_insumos_frete\.py$`, `^t110_romaneio_preservacao\.js$`, `^t113_romaneio_banhos_fixos\.js$`, `^t116_romaneio_layout\.js$`, `^t117_planilha_sistema_romaneio\.js$`, `^t120_edicao_romaneio_menu_numeracao\.py$`, `^t22\.py$`, `^t24\.py$`, `^t26\.py$`, `^t27\.py$`, `^t42\.py$`, `^t43\.py$`, `^t45\.py$`, `^t52\.py$`, `^t53\.py$`, `^t56_rom_acoes\.py$`, `^t57_rom_historico\.py$`, `^t58\.py$`, `^t65_div_categoria\.py$`, `^t67_conjunto_quantidade\.py$`, `^t67_rom_acesso\.py$`, `^t69_banho_divisoes_exportacao\.py$`, `^t69_lote_por_grama_categorias\.py$`, `^t71_romaneios_reais\.py$`, `^t72_romaneio_peso_e_trios\.py$`, `^t74_romaneio_extras\.py$`, `^t75_romaneio_frete_e_pendencias\.py$`, `^t77_lote_sem_bloqueio\.py$`, `^t82_lote_peso_real\.py$`, `^t83_lote_valor_fluido\.py$`, `^t85_lote_numerado\.py$`, `^t86_lote_qualquer_item\.py$`, `^t95_lapidacao\.py$`, `^t96_auditoria_calculos\.py$`, `^t96_fluxos\.py$`, `^t97_xml_criacao\.py$`, `^t99_rateio_exato\.py$`
- Globais mutaveis: 3
- Fronteira: falha

### tabelas

Tabelas salvas (historico de tabelas montadas, salvar/restaurar/ver/excluir/CSV), ver romaneio, indice de tabelas no localStorage, historico de sugestoes e varredura de fotos vivas/orfas.

- Arquivos: `19d-tabelas-indice-e-fotos.js`, `19d2-tabelas-salvar-e-ver.js`, `acoes.js`
- Expoe: `arqRef`, `estadoTabelas`, `gravarIdx`, `histSugAgendar`, `pontosIds`, `setAutor`, `tabIndex`, `tabsMigrar`, `varrerFotos`, `varrerTudo`
- Usa: `armazenamento`, `core`, `lancamento`, `planilha`, `romaneio`
- Usada por: `armazenamento`
- Testes: `^backup_auditoria_integridade\.js$`, `^interrupcao_exclusao\.js$`, `^interrupcao_exclusao_real\.js$`, `^t101_tabela_exclusao\.py$`, `^t44\.py$`, `^t58_backup_integridade\.py$`, `^tabela_exclusao_integridade\.js$`
- Globais mutaveis: 0
- Fronteira: falha

## Dependencias reais entre donos

| de -> para | simbolos |
|---|---|
| app -> armazenamento | 3: `HIST`, `desfazer`, `salvar` |
| app -> configuracao | 10: `atualizaPrevia`, `catUI`, `dupCampo`, `estadoConfig`, `fiscalCampo`, `renderCfg`, `romExAtualiza`, `romUI`, ... |
| app -> core | 19: `NOME`, `NOVIDADES`, `NUM`, `TIPO_PAD`, `VALIDA_NUM`, `checaCel`, `corKey`, `descAuto`, ... |
| app -> exportacao | 2: `abrirNovoSistema`, `estadoExportacao` |
| app -> lancamento | 10: `aplicaFaixa`, `ativarConjunto`, `atualizarGera`, `campoMsg`, `conjSync`, `estadoLancamento`, `fatorDoPreco`, `limpaUlt`, ... |
| app -> legado | 41: `G`, `S`, `abertos`, `aplicarMemForn`, `aplicarSemBanho`, `bancoAtualizar`, `banhistaBy`, `banhistaDoFornecedor`, ... |
| app -> planilha | 6: `celular`, `estadoPlanilha`, `guardarFil`, `renderListas`, `renderTopo`, `vis` |
| app -> romaneio | 3: `ROM`, `romAtualSoon`, `romCampo` |
| app -> store | 2: `gravarPref`, `lerPref` |
| armazenamento -> configuracao | 2: `impactoAgendar`, `renderCfg` |
| armazenamento -> core | 27: `BK_DIAS`, `BK_INTERVALO`, `BK_JOURNAL`, `EX_PREFIXO`, `FORM0`, `MAX_BACKUP_BYTES`, `PONTOS_MAX`, `PONTO_INTERVALO`, ... |
| armazenamento -> exportacao | 1: `obterDL` |
| armazenamento -> lancamento | 3: `avisoEdicao`, `editar`, `renderForm` |
| armazenamento -> legado | 16: `G`, `S`, `catBy`, `cfg`, `editId`, `fixarRefs`, `migrarGrades0`, `migrarJueri`, ... |
| armazenamento -> planilha | 2: `estadoPlanilha`, `renderTopo` |
| armazenamento -> romaneio | 4: `ROM`, `impData`, `relTem`, `renderRom` |
| armazenamento -> store | 12: `AREA_LOCAL_NOME`, `bkLerBanco`, `exPreparar`, `exRestaurar`, `gravarPref`, `gravarSessao`, `idbDel`, `idbGet`, ... |
| armazenamento -> tabelas | 8: `arqRef`, `gravarIdx`, `histSugAgendar`, `pontosIds`, `setAutor`, `tabIndex`, `tabsMigrar`, `varrerFotos` |
| configuracao -> armazenamento | 23: `HIST`, `REDO`, `ROMS`, `TABS`, `bkUsoIniciar`, `bkUsoParar`, `conflito`, `corrompido`, ... |
| configuracao -> core | 39: `BANHO_COLS`, `DEFAULT_CONFIG`, `EXPL`, `FISC_COLS`, `FISC_PAD`, `FORMULA`, `JUERI_CATS`, `LET`, ... |
| configuracao -> fotos | 2: `fotoAuto`, `fotoKey` |
| configuracao -> lancamento | 1: `renderForm` |
| configuracao -> legado | 31: `G`, `S`, `abertos`, `bancoGeralLista`, `bancoLista`, `cadLancSig`, `catBy`, `cfg`, ... |
| configuracao -> planilha | 3: `celular`, `formAbrir`, `renderTopo` |
| configuracao -> romaneio | 2: `ROM`, `renderRom` |
| configuracao -> store | 2: `idbOp`, `lerPref` |
| core -> configuracao | 1: `prefixoEmUso` |
| exportacao -> armazenamento | 2: `migrarGrades`, `salvar` |
| exportacao -> core | 33: `COLW`, `DUAS`, `LET`, `LIM_EXPORT`, `MAX_BACKUP_BYTES`, `MAX_PLANILHA_BYTES`, `MAX_PLANILHA_LINHAS`, `NOME`, ... |
| exportacao -> legado | 25: `S`, `cfg`, `chaveDoCabecalho`, `checaLinhasPlan`, `colunasExport`, `conferirExport`, `faixaRefs`, `fnum`, ... |
| exportacao -> planilha | 3: `casa`, `filtroOn`, `renderTopo` |
| fotos -> armazenamento | 3: `ftSalvas`, `romSalvarSoon`, `salvar` |
| fotos -> core | 8: `MAX_FOTO_BYTES`, `candFoto`, `checaTam`, `esc`, `fs`, `ftOk`, `refBase`, `vazio` |
| fotos -> lancamento | 3: `estadoLancamento`, `formSujo`, `renderForm` |
| fotos -> legado | 6: `G`, `S`, `editId`, `gerar`, `irPara`, `toast` |
| fotos -> planilha | 3: `casa`, `filtroOn`, `renderTopo` |
| fotos -> romaneio | 2: `ROM`, `renderRom` |
| fotos -> store | 4: `idbDel`, `idbGet`, `idbPut`, `lerPref` |
| lancamento -> armazenamento | 9: `AUTOR`, `ROMS`, `desfazer`, `ftSalvas`, `pontoAuto`, `pontoAviso`, `romInfo`, `romTem`, ... |
| lancamento -> configuracao | 1: `renderCfg` |
| lancamento -> core | 50: `BANHISTA0`, `BANHO_COLS`, `CJ_NOMES`, `DUAS`, `FORM0`, `FORMULA`, `LET`, `MISTO`, ... |
| lancamento -> fotos | 3: `autoEnviar`, `estadoFotos`, `fotoCopia` |
| lancamento -> legado | 58: `G`, `S`, `abertos`, `aplicarSemBanho`, `bancoHtml`, `banhistaBy`, `banhistaDoFornecedor`, `bonP`, ... |
| lancamento -> planilha | 6: `celular`, `estadoPlanilha`, `formAbrir`, `mostrarNoFim`, `renderListas`, `renderTopo` |
| lancamento -> romaneio | 3: `ROM`, `relTem`, `renderRom` |
| lancamento -> store | 1: `idbPut` |
| legado -> app | 1: `sideMarcar` |
| legado -> armazenamento | 2: `romMarcar`, `romSalvarSoon` |
| legado -> configuracao | 1: `renderCfg` |
| legado -> lancamento | 1: `renderForm` |
| legado -> planilha | 5: `celular`, `formAbrir`, `pilulaAtualiza`, `renderListas`, `renderTopo` |
| legado -> romaneio | 2: `ROM`, `renderRom` |
| planilha -> armazenamento | 3: `desfazer`, `pontoAuto`, `salvar` |
| planilha -> core | 23: `BANHO_COLS`, `DUAS`, `FORMULA`, `LET`, `MONEY`, `NOME`, `NUM`, `PAL`, ... |
| planilha -> lancamento | 4: `dobrarOv`, `estadoLancamento`, `formSujo`, `renderForm` |
| planilha -> legado | 30: `G`, `S`, `abertos`, `avisos`, `catBy`, `celEd`, `cfg`, `chaveDoCabecalho`, ... |
| planilha -> store | 2: `gravarPref`, `lerPref` |
| romaneio -> armazenamento | 22: `ARQ`, `AUTOR`, `ROMS`, `TABS`, `backupLembrarPosCriar`, `desfazer`, `pontoAuto`, `pontoAviso`, ... |
| romaneio -> core | 61: `LET`, `MAX_PDF_BYTES`, `MAX_PLANILHA_BYTES`, `MAX_PLANILHA_LINHAS`, `MAX_TEXTO_COLADO`, `NFKEY`, `NOME`, `ROMKEY`, ... |
| romaneio -> exportacao | 1: `obterDL` |
| romaneio -> lancamento | 6: `adicionar`, `avisoEdicao`, `campoMsg`, `conjSync`, `limpaUlt`, `renderForm` |
| romaneio -> legado | 61: `G`, `S`, `abertos`, `aplicarMemForn`, `banhistaBy`, `banhistaDoFornecedor`, `catBy`, `catDaDescricao`, ... |
| romaneio -> planilha | 2: `mostrarNoFim`, `renderTopo` |
| romaneio -> store | 5: `gravarPref`, `idbGet`, `idbOp`, `idbPut`, `lerPref` |
| tabelas -> armazenamento | 16: `ARQ`, `AUTOR`, `HIST`, `REDO`, `TABS`, `definirArq`, `definirAutor`, `definirTabs`, ... |
| tabelas -> core | 19: `LET`, `PONTO_IDS`, `TABDEL`, `brl`, `candFoto`, `celulas`, `clone`, `codsDe`, ... |
| tabelas -> lancamento | 1: `avisoEdicao` |
| tabelas -> legado | 15: `HIST_SUG`, `S`, `bancoAtualizar`, `cfg`, `editId`, `fnum`, `gerar`, `lastExport`, ... |
| tabelas -> planilha | 1: `renderListas` |
| tabelas -> store | 7: `exPreparar`, `gravarPref`, `idbDel`, `idbGet`, `idbOp`, `idbPut`, `lerPref` |

## Globais mutaveis por dono

| dono | globais |
|---|---|
| armazenamento | 24 |
| configuracao | 3 |
| legado | 14 |
| planilha | 1 |
| romaneio | 3 |
