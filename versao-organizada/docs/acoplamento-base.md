# Acoplamento medido (estado base)

Gerado por `node tools/acoplamento.mjs --escrever`. Nao editar a mao.

Declaracoes: 1007. Globais mutaveis (let/var de nivel superior): 103.

## Globais mutaveis por arquivo

| Arquivo | Globais |
|---|---|
| js/14-persistencia.js | 17 |
| js/20-armazenamento-idb.js | 14 |
| js/10-limites-e-colunas.js | 11 |
| js/15-planilha.js | 9 |
| js/17-lancamento.js | 6 |
| js/19-configuracoes-e-catalogo.js | 5 |
| js/30-eventos-mouse-e-clique.js | 5 |
| js/21-edicao-em-lote-e-revisao.js | 4 |
| js/19d-tabelas-salvas.js | 3 |
| js/21d-novidades.js | 3 |
| js/25-relatorio-romaneio.js | 3 |
| js/27-fotos-escolher-colar.js | 3 |
| js/28-exportar.js | 3 |
| js/11-utilidades.js | 2 |
| js/16-selecao.js | 2 |
| js/23-fotos-imgbb-e-nota-fiscal.js | 2 |
| js/26-acoes.js | 2 |
| js/34-filtros-importacao-e-cartoes.js | 2 |
| js/18-conjunto.js | 1 |
| js/19b-assistente-outro-sistema.js | 1 |
| js/19c-colar-romaneio.js | 1 |
| js/21b-romaneio-extras.js | 1 |
| js/22-importar-pdf-romaneio.js | 1 |
| js/29-importar-e-copia.js | 1 |
| js/33-janelas-busca-e-paleta.js | 1 |

## Matriz arquivo -> arquivo (simbolos usados)

Cada linha: o arquivo da esquerda usa N simbolos declarados no da direita. Todas as arestas, maiores primeiro.

| De | Para | Simbolos | Exemplos |
|---|---|---|---|
| js/00-adaptadores-nucleo.js | core/configuracao.js | 46 | bancoComplementos$, bancoGeralLista$, bancoLista$, bancoSugestoes$ |
| js/21-edicao-em-lote-e-revisao.js | js/00-adaptadores-nucleo.js | 32 | banhistaBy, catBy, catDaDescricao, cfg |
| js/00-adaptadores-nucleo.js | core/dominio.js | 26 | aplicarMemForn$, banhistaDoFornecedor$, cadLancSig$, conjCalc$ |
| js/31-eventos-campos-e-grade.js | js/00-adaptadores-nucleo.js | 24 | aplicarMemForn, banhistaBy, banhistaDoFornecedor, catBy |
| js/00-adaptadores-nucleo.js | core/romaneio.js | 23 | lerRomaneioAuto$, mapaCat$, romBh$, romCols$ |
| js/17-lancamento.js | js/00-adaptadores-nucleo.js | 23 | banhistaBy, banhistaDoFornecedor, catBy, cfg |
| js/19c-colar-romaneio.js | js/00-adaptadores-nucleo.js | 18 | aplicarMemForn, banhistaBy, banhistaDoFornecedor, cfg |
| js/20-armazenamento-idb.js | js/14-persistencia.js | 17 | HIST, REDO, chain, conflito |
| core/configuracao.js | core/utilidades.js | 14 | BANCO_PALAVRAS, apelidosDe, brl, catPad |
| js/17-lancamento.js | core/colunas.js | 14 | BANHO_COLS, FORMULA, LET, NOME |
| js/18-conjunto.js | js/00-adaptadores-nucleo.js | 14 | banhistaBy, cfg, comSufixoCat, conjCalc |
| js/21-edicao-em-lote-e-revisao.js | core/colunas.js | 14 | LET, MAX_PLANILHA_BYTES, MAX_PLANILHA_LINHAS, MAX_TEXTO_COLADO |
| js/27-fotos-escolher-colar.js | js/00-adaptadores-nucleo.js | 14 | banhistaBy, bonP, catBy, cfg |
| js/15-planilha.js | js/00-adaptadores-nucleo.js | 13 | avisos, catBy, cfg, chaveDoCabecalho |
| js/28-exportar.js | js/00-adaptadores-nucleo.js | 13 | cfg, colunasExport, conferirExport, faixaRefs |
| core/dominio.js | core/configuracao.js | 12 | banhistaBy$, bhDe$, bonP$, catBy$ |
| core/exportacao.js | core/colunas.js | 12 | HEAD, LET, NOME, SIN |
| js/12-motor-linhas.js | js/00-adaptadores-nucleo.js | 12 | bhDe, bonP, catBy, cfg |
| js/15-planilha.js | core/colunas.js | 12 | BANHO_COLS, DUAS, FORMULA, LET |
| js/19-configuracoes-e-catalogo.js | js/00-adaptadores-nucleo.js | 12 | bancoGeralLista, bancoLista, cfg, coresDaCat |
| js/19d-tabelas-salvas.js | js/20-armazenamento-idb.js | 12 | ARQ, AUTOR, TABS, exComLock |
| js/21-edicao-em-lote-e-revisao.js | core/romaneio.js | 12 | ROM_PAPEIS, ROM_SIN, candFoto, chaveCod |
| js/23-fotos-imgbb-e-nota-fiscal.js | core/notafiscal.js | 12 | NFKEY, nfCnpj, nfForma, nfLerXml |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/00-adaptadores-nucleo.js | 12 | banhistaBy, catBy, cfg, fornBy |
| js/27-fotos-escolher-colar.js | js/14-persistencia.js | 12 | HIST, REDO, conflito, ftSalvas |
| js/00-adaptadores-nucleo.js | core/exportacao.js | 11 | avisos$, chaveDoCabecalho$, conferirExport$, faixaRefs$ |
| js/11-utilidades.js | js/00-adaptadores-nucleo.js | 11 | bancoComplementos, bancoLista, catBy, cfg |
| js/21-edicao-em-lote-e-revisao.js | js/21b-romaneio-extras.js | 11 | romExtrasAtual, romInsAssinatura, romInsBasesInvalidas, romInsCampo |
| js/36-cadastros-salvar.js | js/14-persistencia.js | 11 | HIST, REDO, chain, db |
| core/backup.js | core/colunas.js | 10 | BANHISTA0, DEFAULT_CONFIG, FORM0, LET |
| core/dominio.js | core/colunas.js | 10 | JUERI_CATS, LET, NOME, celulas |
| core/dominio.js | core/utilidades.js | 10 | banhoSemCalc, brl, descAuto, esc |
| js/14-persistencia.js | core/backup.js | 10 | BK_DIAS, BK_INTERVALO, PONTOS_MAX, PONTO_INTERVALO |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/20-armazenamento-idb.js | 10 | AUTOR, idbGet, idbOp, idbPut |
| js/25-relatorio-romaneio.js | core/colunas.js | 10 | BANHO_COLS, DEFAULT_CONFIG, FORMULA, LET |
| js/28-exportar.js | core/colunas.js | 10 | COLW, DUAS, LET, LIM_EXPORT |
| core/exportacao.js | core/configuracao.js | 9 | bhDe$, catBy$, cfg$, comSufixoCat$ |
| js/14-persistencia.js | js/20-armazenamento-idb.js | 9 | bkMontar, idbDel, idbGet, idbOp |
| js/17-lancamento.js | core/utilidades.js | 9 | banhoSemCalc, corKey, efetivo, esc |
| js/19-configuracoes-e-catalogo.js | core/colunas.js | 9 | JUERI_CATS, LET, NOME, TIPOS_COL |
| js/20-armazenamento-idb.js | core/backup.js | 9 | BK_JOURNAL, EX_PREFIXO, ROMKEY, ehNumLike |
| js/21-edicao-em-lote-e-revisao.js | core/utilidades.js | 9 | banhoSemCalc, brl, esc, fmt |
| js/21-edicao-em-lote-e-revisao.js | js/20-armazenamento-idb.js | 9 | ARQ, TABS, romBadge, romConflito |
| js/27-fotos-escolher-colar.js | js/10-limites-e-colunas.js | 9 | G, S, abertos, editId |
| core/romaneio.js | core/colunas.js | 8 | MAX_PLANILHA_LINHAS, MAX_TEXTO_COLADO, clone, csvq |
| core/romaneio.js | core/configuracao.js | 8 | banhistaBy$, catBy$, cfg$, coresDaCat$ |
| js/15-planilha.js | js/10-limites-e-colunas.js | 8 | G, S, abertos, celEd |
| js/15-planilha.js | js/16-selecao.js | 8 | maxRi, passo, pintarSel, renderSelBar |
| js/16-selecao.js | core/colunas.js | 8 | DUAS, FORM0, FORMULA, LET |
| js/19-configuracoes-e-catalogo.js | core/utilidades.js | 8 | brl, efetivo, esc, fmt |
| js/21-edicao-em-lote-e-revisao.js | js/10-limites-e-colunas.js | 8 | G, S, abertos, checaLinhasPlan |
| js/27-fotos-escolher-colar.js | js/20-armazenamento-idb.js | 8 | AUTOR, idbDel, idbGet, idbPut |
| js/31-eventos-campos-e-grade.js | core/utilidades.js | 8 | corKey, descAuto, efetivo, esc |
| js/31-eventos-campos-e-grade.js | js/10-limites-e-colunas.js | 8 | G, S, abertos, editId |
| js/18-conjunto.js | core/dominio.js | 7 | CJ_COL, CJ_NOMES, conjLinTxt, conjQtd |
| js/19-configuracoes-e-catalogo.js | core/dominio.js | 7 | MODELOS_CAT, PAL, contaPlano, nomeCatErro |
| js/19b-assistente-outro-sistema.js | core/colunas.js | 7 | LET, MAX_PLANILHA_BYTES, MAX_PLANILHA_LINHAS, NOME |
| js/19c-colar-romaneio.js | js/21-edicao-em-lote-e-revisao.js | 7 | romAtual, romAtualSoon, romBulkHTML, romCardHTML |
| js/19d-tabelas-salvas.js | core/romaneio.js | 7 | PONTO_IDS, TABDEL, candFoto, codsDe |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/19c-colar-romaneio.js | 7 | ROM, renderRom, romConjVerificar, romFixaRefs |
| js/25-relatorio-romaneio.js | core/utilidades.js | 7 | brl, corKey, esc, fmt |
| js/25-relatorio-romaneio.js | js/00-adaptadores-nucleo.js | 7 | catBy, cfg, libPedra, libSiglas |
| js/25-relatorio-romaneio.js | js/19-configuracoes-e-catalogo.js | 7 | LIBTAM, SECS, abaCfg, catUI |
| js/27-fotos-escolher-colar.js | core/colunas.js | 7 | DUAS, MAX_FOTO_BYTES, NOME, checaTam |
| js/28-exportar.js | core/exportacao.js | 7 | avisoZeros, celulaXlsx, dividirLotes, faixaFiltro |
| core/formulas.js | core/colunas.js | 6 | DUAS, LET, NOME, NUM |
| js/10-limites-e-colunas.js | core/colunas.js | 6 | DEFAULT_CONFIG, FORM0, MAX_PLANILHA_LINHAS, ZM |
| js/12-motor-linhas.js | core/utilidades.js | 6 | banhoSemCalc, descVar, num, refParte |
| js/16-selecao.js | js/15-planilha.js | 6 | FV, JAN, gravarCel, janGarantir |
| js/17-lancamento.js | js/18-conjunto.js | 6 | ajustarAltura, atualizarGera, conjPainel, foraDaPlanilha |
| js/18-conjunto.js | core/utilidades.js | 6 | brl, esc, fmt, num |
| js/18-conjunto.js | js/10-limites-e-colunas.js | 6 | G, S, abertos, delCat |
| js/19-configuracoes-e-catalogo.js | js/10-limites-e-colunas.js | 6 | G, S, abertos, delCat |
| js/19c-colar-romaneio.js | core/utilidades.js | 6 | brl, esc, fmt, num |
| js/19d-tabelas-salvas.js | js/14-persistencia.js | 6 | HIST, REDO, ftSalvas, salvar |
| js/20-armazenamento-idb.js | js/10-limites-e-colunas.js | 6 | G, S, editId, rascunho |
| js/20-armazenamento-idb.js | js/19d-tabelas-salvas.js | 6 | arqRef, gravarIdx, histSugAgendar, setAutor |
| js/21-edicao-em-lote-e-revisao.js | js/19c-colar-romaneio.js | 6 | ROM, renderRom, romForm, romPreview |
| js/21b-romaneio-extras.js | core/romaneio.js | 6 | FISC_COLS, FISC_PAD, fiscalErro, g3 |
| js/21b-romaneio-extras.js | js/00-adaptadores-nucleo.js | 6 | cfg, gradeDaCat, padraoDe, romColsR |
| js/27-fotos-escolher-colar.js | js/15-planilha.js | 6 | JAN, casa, filtroOn, janGarantir |
| js/30-eventos-mouse-e-clique.js | js/14-persistencia.js | 6 | chain, conflito, corrompido, flush |
| js/31-eventos-campos-e-grade.js | core/colunas.js | 6 | NOME, NUM, clone, modeloBling |
| js/31-eventos-campos-e-grade.js | js/17-lancamento.js | 6 | MULTI, fatorDoPreco, quick, quickB |
| js/31-eventos-campos-e-grade.js | js/19-configuracoes-e-catalogo.js | 6 | atualizaPrevia, catUI, dupCampo, faixaBusy |
| core/colunas.js | core/formulas.js | 5 | FORM_SEGURA, avalF, calcBanho, lerValor |
| core/romaneio.js | core/utilidades.js | 5 | brl, esc, num, selFaixa |
| js/12-motor-linhas.js | core/colunas.js | 5 | FORMULA, LET, letraN, milDe |
| js/14-persistencia.js | js/10-limites-e-colunas.js | 5 | S, editId, rascunho, sel |
| js/15-planilha.js | core/utilidades.js | 5 | brl, esc, fmt, opts |
| js/15-planilha.js | js/11-utilidades.js | 5 | inicioDe, listaDe, proxDe, renderNum |
| js/17-lancamento.js | core/dominio.js | 5 | MISTO, NUMORIG, addTamanhos, nomeCatErro |
| js/17-lancamento.js | js/11-utilidades.js | 5 | bancoHtml, inicioDe, listaDe, proxDe |
| js/19d-tabelas-salvas.js | js/10-limites-e-colunas.js | 5 | S, editId, lastExport, sel |
| js/21b-romaneio-extras.js | core/utilidades.js | 5 | brl, esc, fmt, num |
| js/23-fotos-imgbb-e-nota-fiscal.js | core/utilidades.js | 5 | brl, esc, num, r4 |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/10-limites-e-colunas.js | 5 | G, S, abertos, editId |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/21b-romaneio-extras.js | 5 | romInsAssinatura, romInsBasesInvalidas, romInsConferirArquivos, romInsProibidos |
| js/26-acoes.js | js/00-adaptadores-nucleo.js | 5 | catBy, cfg, continuoCfg, fornBy |
| js/29-importar-e-copia.js | js/00-adaptadores-nucleo.js | 5 | cfg, chaveDoCabecalho, migrarJueri, sincGrade |
| js/30-eventos-mouse-e-clique.js | js/20-armazenamento-idb.js | 5 | ROMS, TABS, bkUsoIniciar, bkUsoParar |
| js/31-eventos-campos-e-grade.js | js/11-utilidades.js | 5 | aplicarSemBanho, bancoAtualizar, compraGramaAuto, proxDe |
| js/31-eventos-campos-e-grade.js | js/15-planilha.js | 5 | FIL, guardarFil, render, renderListas |
| core/exportacao.js | core/formulas.js | 4 | VALIDA_NUM, avalF, pesoLinha, qtdPos |
| core/exportacao.js | core/utilidades.js | 4 | contFinal, esc, num, vazio |
| js/14-persistencia.js | js/00-adaptadores-nucleo.js | 4 | cfg, migrarGrades0, migrarJueri, sincGrade |
| js/15-planilha.js | js/27-fotos-escolher-colar.js | 4 | desfazer, dobrarOv, editSnap, formSujo |
| js/16-selecao.js | js/10-limites-e-colunas.js | 4 | G, S, editId, undo |
| js/17-lancamento.js | js/10-limites-e-colunas.js | 4 | S, abertos, editId, uid |
| js/18-conjunto.js | js/36-cadastros-salvar.js | 4 | CAD, CADAUTO, cadConferir, cadTirarFoto |
| js/19c-colar-romaneio.js | core/colunas.js | 4 | LET, celulas, clone, r2c |
| js/19d-tabelas-salvas.js | core/backup.js | 4 | ehNumLike, ehObj, ftRSalvas, lerLanc |
| js/19d-tabelas-salvas.js | core/colunas.js | 4 | LET, celulas, clone, fs |
| js/19d-tabelas-salvas.js | core/utilidades.js | 4 | brl, contFinal, esc, num |
| js/19d-tabelas-salvas.js | js/00-adaptadores-nucleo.js | 4 | cfg, fnum, sigLanc, ultimo |
| js/20-armazenamento-idb.js | js/00-adaptadores-nucleo.js | 4 | catBy, cfg, migrarJueri, sincGrade |
| js/21b-romaneio-extras.js | js/15-planilha.js | 4 | celular, formAbrir, render, renderTopo |
| js/21b-romaneio-extras.js | js/20-armazenamento-idb.js | 4 | TABS, idbDel, idbGet, romSalvarSoon |
| js/21b-romaneio-extras.js | js/21-edicao-em-lote-e-revisao.js | 4 | romAtualSoon, romLoteAdd, romLoteKids, romLoteResumo |
| js/21c-diagnostico-dados.js | js/20-armazenamento-idb.js | 4 | ROMS, TABS, idbGet, idbOp |
| js/21d-novidades.js | core/utilidades.js | 4 | brl, esc, fmt, num |
| js/21d-novidades.js | js/10-limites-e-colunas.js | 4 | S, abertos, editId, uid |
| js/21d-novidades.js | js/14-persistencia.js | 4 | HIST, restaurando, salvar, snapC |
| js/22-importar-pdf-romaneio.js | core/colunas.js | 4 | MAX_PDF_BYTES, checaPaginas, checaTam, fs |
| js/22-importar-pdf-romaneio.js | js/19c-colar-romaneio.js | 4 | ROM, renderRom, romSetForn, romT |
| js/23-fotos-imgbb-e-nota-fiscal.js | core/colunas.js | 4 | MAX_PDF_BYTES, checaPaginas, checaTam, clone |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/27-fotos-escolher-colar.js | 4 | adicionar, avisoEdicao, desfazer, mostrarNoFim |
| js/25-relatorio-romaneio.js | core/romaneio.js | 4 | fm, parseMapa, relFaixas, relNormalizar |
| js/25-relatorio-romaneio.js | js/10-limites-e-colunas.js | 4 | G, S, abertos, undo |
| js/27-fotos-escolher-colar.js | js/19c-colar-romaneio.js | 4 | ROM, renderRom, romSetForn, romT |
| js/27-fotos-escolher-colar.js | js/26-acoes.js | 4 | addTrava, focarPrimeiro, lembrarForn, limparForm |
| js/28-exportar.js | js/15-planilha.js | 4 | casa, filtroOn, render, renderTopo |
| js/29-importar-e-copia.js | core/colunas.js | 4 | MAX_BACKUP_BYTES, MAX_PLANILHA_BYTES, checaTam, clone |
| js/30-eventos-mouse-e-clique.js | js/36-cadastros-salvar.js | 4 | CAD, CADAUTO, cadConferir, cadTirarFoto |
| js/31-eventos-campos-e-grade.js | js/21-edicao-em-lote-e-revisao.js | 4 | romAtualSoon, romCampo, romExAtualiza, romUI |
| js/34-filtros-importacao-e-cartoes.js | js/19c-colar-romaneio.js | 4 | ROM, renderRom, romSetForn, romT |
| js/34-filtros-importacao-e-cartoes.js | js/20-armazenamento-idb.js | 4 | ROMS, romAbrirSalvo, romRetomar, romSalvar |
| core/backup.js | core/utilidades.js | 3 | idLimpo, num, vazio |
| core/colunas.js | core/utilidades.js | 3 | esc, num, vazio |
| core/dominio.js | core/formulas.js | 3 | numRaw, pesoLinha, qtdPos |
| core/notafiscal.js | core/colunas.js | 3 | MAX_XML_BYTES, checaTam, semAc |
| js/11-utilidades.js | core/utilidades.js | 3 | esc, num, vazio |
| js/11-utilidades.js | js/10-limites-e-colunas.js | 3 | G, S, editId |
| js/14-persistencia.js | core/colunas.js | 3 | FORM0, MAX_BACKUP_BYTES, proxLetra |
| js/16-selecao.js | core/utilidades.js | 3 | esc, fmt, r4 |
| js/17-lancamento.js | js/15-planilha.js | 3 | celular, renderListas, renderTopo |
| js/17-lancamento.js | js/20-armazenamento-idb.js | 3 | ROMS, romInfo, romTem |
| js/18-conjunto.js | js/15-planilha.js | 3 | celular, formAbrir, render |
| js/19b-assistente-outro-sistema.js | core/utilidades.js | 3 | esc, num, opts |
| js/19c-colar-romaneio.js | core/dominio.js | 3 | conjQtd, detalheBanhoLinha, txtN |
| js/19c-colar-romaneio.js | js/21b-romaneio-extras.js | 3 | romInsHTML, romInsRateio, romPassosHTML |
| js/19d-tabelas-salvas.js | js/11-utilidades.js | 3 | HIST_SUG, bancoAtualizar, toast |
| js/20-armazenamento-idb.js | core/colunas.js | 3 | MAX_BACKUP_BYTES, checaTam, clone |
| js/21-edicao-em-lote-e-revisao.js | js/11-utilidades.js | 3 | proxDe, renderNum, toast |
| js/21-edicao-em-lote-e-revisao.js | js/14-persistencia.js | 3 | pontoAuto, pontoAviso, salvar |
| js/21b-romaneio-extras.js | js/10-limites-e-colunas.js | 3 | S, abertos, uid |
| js/21b-romaneio-extras.js | js/27-fotos-escolher-colar.js | 3 | fotoNaPeca, ftAlvo, lerFotoArquivo |
| js/21d-novidades.js | core/colunas.js | 3 | BANHISTA0, clone, r2c |
| js/21d-novidades.js | core/dominio.js | 3 | NOVIDADES, custoLinhaDe, histDescrever |
| js/21d-novidades.js | js/15-planilha.js | 3 | celular, formAbrir, render |
| js/26-acoes.js | js/15-planilha.js | 3 | celular, renderListas, renderTopo |
| js/27-fotos-escolher-colar.js | core/dominio.js | 3 | conjQtd, novaComp, refBase |
| js/27-fotos-escolher-colar.js | js/18-conjunto.js | 3 | atualizarGera, conjSync, rolarPane |
| js/28-exportar.js | core/utilidades.js | 3 | contFinal, esc, num |
| js/28-exportar.js | js/10-limites-e-colunas.js | 3 | S, lastExport, sel |
| js/29-importar-e-copia.js | core/backup.js | 3 | checarConfig, ehObj, lerConfig |
| js/30-eventos-mouse-e-clique.js | js/10-limites-e-colunas.js | 3 | S, abertos, rascunho |
| js/30-eventos-mouse-e-clique.js | js/15-planilha.js | 3 | render, renderListas, renderTopo |
| js/31-eventos-campos-e-grade.js | js/18-conjunto.js | 3 | atualizarGera, conjSync, renderFormSoon |
| js/31-eventos-campos-e-grade.js | js/30-eventos-mouse-e-clique.js | 3 | ativarConjunto, guardarAbertos, refocar |
| js/34-filtros-importacao-e-cartoes.js | js/10-limites-e-colunas.js | 3 | abertos, editId, uid |
| js/36-cadastros-salvar.js | js/30-eventos-mouse-e-clique.js | 3 | bnEmExclusao, bnLiberarUso, bnReserva |
| core/configuracao.js | core/colunas.js | 2 | NOME, semAc |
| core/exportacao.js | core/dominio.js | 2 | conjErro$, refBase |
| core/notafiscal.js | core/configuracao.js | 2 | catBy$, cfg$ |
| core/notafiscal.js | core/utilidades.js | 2 | brl, num |
| js/00-adaptadores-nucleo.js | core/notafiscal.js | 2 | nfAcharForn$, nfCatDe$ |
| js/11-utilidades.js | core/colunas.js | 2 | r2c, semAc |
| js/12-motor-linhas.js | core/dominio.js | 2 | CJ_COL, conjSnap |
| js/14-persistencia.js | core/utilidades.js | 2 | esc, vazio |
| js/14-persistencia.js | js/15-planilha.js | 2 | render, renderTopo |
| js/14-persistencia.js | js/19d-tabelas-salvas.js | 2 | pontosIds, varrerFotos |
| js/15-planilha.js | core/formulas.js | 2 | calcBanho, checaCel |
| js/15-planilha.js | js/12-motor-linhas.js | 2 | gerar, marcaRuim |
| js/15-planilha.js | js/19c-colar-romaneio.js | 2 | ROM, renderRom |
| js/15-planilha.js | js/20-armazenamento-idb.js | 2 | romMarcar, romSalvarSoon |
| js/16-selecao.js | js/14-persistencia.js | 2 | pontoAuto, salvar |
| js/16-selecao.js | js/27-fotos-escolher-colar.js | 2 | cancelar, desfazer |
| js/17-lancamento.js | js/19c-colar-romaneio.js | 2 | ROM, renderRom |
| js/17-lancamento.js | js/25-relatorio-romaneio.js | 2 | relTem, renderCfg |
| js/18-conjunto.js | core/colunas.js | 2 | LET, celulas |
| js/18-conjunto.js | core/formulas.js | 2 | calcBanho, pesoLinha |
| js/18-conjunto.js | js/17-lancamento.js | 2 | previsao, renderForm |
| js/18-conjunto.js | js/30-eventos-mouse-e-clique.js | 2 | guardarAbertos, refocar |
| js/19b-assistente-outro-sistema.js | core/exportacao.js | 2 | TIPO_PAD, csvLinha |
| js/19b-assistente-outro-sistema.js | js/00-adaptadores-nucleo.js | 2 | cfg, chaveDoCabecalho |
| js/19b-assistente-outro-sistema.js | js/10-limites-e-colunas.js | 2 | checaLinhasPlan, uid |
| js/19d-tabelas-salvas.js | js/15-planilha.js | 2 | render, renderListas |
| js/20-armazenamento-idb.js | core/romaneio.js | 2 | ROMDEL, TABDEL |
| js/20-armazenamento-idb.js | js/15-planilha.js | 2 | render, renderTopo |
| js/20-armazenamento-idb.js | js/19c-colar-romaneio.js | 2 | ROM, renderRom |
| js/20-armazenamento-idb.js | js/25-relatorio-romaneio.js | 2 | relTem, renderCfg |
| js/20-armazenamento-idb.js | js/27-fotos-escolher-colar.js | 2 | avisoEdicao, desfazer |
| js/21-edicao-em-lote-e-revisao.js | core/dominio.js | 2 | conjQtd, detalheBanhoLinha |
| js/21-edicao-em-lote-e-revisao.js | js/34-filtros-importacao-e-cartoes.js | 2 | IMPH, impPrepara |
| js/21b-romaneio-extras.js | js/14-persistencia.js | 2 | ftSalvas, salvar |
| js/21b-romaneio-extras.js | js/18-conjunto.js | 2 | irPara, rolarPane |
| js/21b-romaneio-extras.js | js/19c-colar-romaneio.js | 2 | ROM, renderRom |
| js/21d-novidades.js | js/00-adaptadores-nucleo.js | 2 | cfg, marcadosPadrao |
| js/22-importar-pdf-romaneio.js | js/00-adaptadores-nucleo.js | 2 | cfg, fornBy |
| js/22-importar-pdf-romaneio.js | js/34-filtros-importacao-e-cartoes.js | 2 | IMPH, impStatusFim |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/14-persistencia.js | 2 | salvar, setStatus |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/15-planilha.js | 2 | renderTopo, romCriando |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/18-conjunto.js | 2 | irPara, rolarPane |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/22-importar-pdf-romaneio.js | 2 | carregarPdfJs, romPdf |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/34-filtros-importacao-e-cartoes.js | 2 | IMPH, impPrepara |
| js/25-relatorio-romaneio.js | core/dominio.js | 2 | EXPL, corOpts |
| js/25-relatorio-romaneio.js | js/14-persistencia.js | 2 | pontosCarregar, salvar |
| js/25-relatorio-romaneio.js | js/19c-colar-romaneio.js | 2 | ROM, renderRom |
| js/25-relatorio-romaneio.js | js/20-armazenamento-idb.js | 2 | ROMS, romListaTabela |
| js/25-relatorio-romaneio.js | js/21-edicao-em-lote-e-revisao.js | 2 | romExInfo, romUI |
| js/25-relatorio-romaneio.js | js/23-fotos-imgbb-e-nota-fiscal.js | 2 | fotoAuto, fotoKey |
| js/26-acoes.js | core/colunas.js | 2 | LET, clone |
| js/26-acoes.js | core/dominio.js | 2 | conjLimpar, novaComp |
| js/26-acoes.js | core/utilidades.js | 2 | esc, vazio |
| js/26-acoes.js | js/10-limites-e-colunas.js | 2 | S, editId |
| js/26-acoes.js | js/11-utilidades.js | 2 | aplicarSemBanho, toast |
| js/27-fotos-escolher-colar.js | core/backup.js | 2 | lerForm, lerLanc |
| js/27-fotos-escolher-colar.js | core/formulas.js | 2 | VALIDA_NUM, checaCel |
| js/27-fotos-escolher-colar.js | core/utilidades.js | 2 | num, vazio |
| js/27-fotos-escolher-colar.js | js/11-utilidades.js | 2 | inicioDe, toast |
| js/27-fotos-escolher-colar.js | js/17-lancamento.js | 2 | previsao, renderForm |
| js/27-fotos-escolher-colar.js | js/23-fotos-imgbb-e-nota-fiscal.js | 2 | autoEnviar, fotoReduzida |
| js/29-importar-e-copia.js | core/utilidades.js | 2 | esc, num |
| js/29-importar-e-copia.js | js/10-limites-e-colunas.js | 2 | S, checaLinhasPlan |
| js/29-importar-e-copia.js | js/14-persistencia.js | 2 | migrarGrades, salvar |
| js/31-eventos-campos-e-grade.js | core/dominio.js | 2 | novaComp, partir |
| js/31-eventos-campos-e-grade.js | core/formulas.js | 2 | VALIDA_NUM, checaCel |
| js/31-eventos-campos-e-grade.js | js/19b-assistente-outro-sistema.js | 2 | NOVO, abrirNovoSistema |
| js/33-janelas-busca-e-paleta.js | js/10-limites-e-colunas.js | 2 | S, abertos |
| js/34-filtros-importacao-e-cartoes.js | js/00-adaptadores-nucleo.js | 2 | cfg, fornBy |
| js/34-filtros-importacao-e-cartoes.js | js/21-edicao-em-lote-e-revisao.js | 2 | romLer, romPlanilha |
| js/35-visoes-menu-e-final.js | js/15-planilha.js | 2 | celular, formAbrir |
| js/36-cadastros-salvar.js | js/00-adaptadores-nucleo.js | 2 | cadLancSig, sincGrade |
| js/36-cadastros-salvar.js | js/10-limites-e-colunas.js | 2 | S, rascunho |
| js/36-cadastros-salvar.js | js/19c-colar-romaneio.js | 2 | ROM, renderRom |
| core/backup.js | core/romaneio.js | 1 | relNormalizar |
| core/backup.js | js/10-limites-e-colunas.js | 1 | uid |
| core/configuracao.js | js/10-limites-e-colunas.js | 1 | uid |
| core/dominio.js | js/10-limites-e-colunas.js | 1 | uid |
| core/dominio.js | js/31-eventos-campos-e-grade.js | 1 | prefixoEmUso |
| core/exportacao.js | js/10-limites-e-colunas.js | 1 | uid |
| core/formulas.js | core/utilidades.js | 1 | num |
| core/notafiscal.js | core/romaneio.js | 1 | mapaCat$ |
| core/romaneio.js | core/backup.js | 1 | ehObj |
| core/romaneio.js | core/dominio.js | 1 | novaComp |
| core/romaneio.js | js/10-limites-e-colunas.js | 1 | uid |
| core/utilidades.js | core/colunas.js | 1 | semAc |
| js/00-adaptadores-nucleo.js | js/10-limites-e-colunas.js | 1 | S |
| js/11-utilidades.js | js/19c-colar-romaneio.js | 1 | ROM |
| js/12-motor-linhas.js | core/formulas.js | 1 | qtdPos |
| js/12-motor-linhas.js | js/10-limites-e-colunas.js | 1 | S |
| js/12-motor-linhas.js | js/18-conjunto.js | 1 | conjSync |
| js/14-persistencia.js | core/romaneio.js | 1 | candFoto |
| js/14-persistencia.js | js/11-utilidades.js | 1 | toast |
| js/14-persistencia.js | js/12-motor-linhas.js | 1 | fixarRefs |
| js/14-persistencia.js | js/16-selecao.js | 1 | selR |
| js/14-persistencia.js | js/21d-novidades.js | 1 | impactoAgendar |
| js/14-persistencia.js | js/27-fotos-escolher-colar.js | 1 | desfazer |
| js/15-planilha.js | core/romaneio.js | 1 | virg |
| js/15-planilha.js | js/14-persistencia.js | 1 | salvar |
| js/15-planilha.js | js/17-lancamento.js | 1 | renderForm |
| js/15-planilha.js | js/19-configuracoes-e-catalogo.js | 1 | renderGraf |
| js/15-planilha.js | js/25-relatorio-romaneio.js | 1 | renderCfg |
| js/15-planilha.js | js/35-visoes-menu-e-final.js | 1 | visPara |
| js/16-selecao.js | js/00-adaptadores-nucleo.js | 1 | detalheCelulaSelecionada |
| js/16-selecao.js | js/11-utilidades.js | 1 | toast |
| js/16-selecao.js | js/17-lancamento.js | 1 | renderForm |
| js/17-lancamento.js | core/backup.js | 1 | romArma |
| js/17-lancamento.js | js/12-motor-linhas.js | 1 | gerar |
| js/17-lancamento.js | js/14-persistencia.js | 1 | salvar |
| js/17-lancamento.js | js/26-acoes.js | 1 | trabalhoHtml |
| js/17-lancamento.js | js/30-eventos-mouse-e-clique.js | 1 | refocar |
| js/18-conjunto.js | core/configuracao.js | 1 | bfFormula |
| js/18-conjunto.js | js/11-utilidades.js | 1 | toast |
| js/18-conjunto.js | js/14-persistencia.js | 1 | salvar |
| js/18-conjunto.js | js/19c-colar-romaneio.js | 1 | ROM |
| js/18-conjunto.js | js/20-armazenamento-idb.js | 1 | idbOp |
| js/18-conjunto.js | js/25-relatorio-romaneio.js | 1 | renderCfg |
| js/18-conjunto.js | js/35-visoes-menu-e-final.js | 1 | visPara |
| js/19-configuracoes-e-catalogo.js | js/11-utilidades.js | 1 | toast |
| js/19-configuracoes-e-catalogo.js | js/14-persistencia.js | 1 | salvar |
| js/19-configuracoes-e-catalogo.js | js/15-planilha.js | 1 | render |
| js/19-configuracoes-e-catalogo.js | js/21b-romaneio-extras.js | 1 | fiscalTodasHTML |
| js/19-configuracoes-e-catalogo.js | js/25-relatorio-romaneio.js | 1 | renderCfg |
| js/19-configuracoes-e-catalogo.js | js/27-fotos-escolher-colar.js | 1 | desfazer |
| js/19-configuracoes-e-catalogo.js | js/30-eventos-mouse-e-clique.js | 1 | refocar |
| js/19b-assistente-outro-sistema.js | js/11-utilidades.js | 1 | toast |
| js/19b-assistente-outro-sistema.js | js/14-persistencia.js | 1 | salvar |
| js/19b-assistente-outro-sistema.js | js/15-planilha.js | 1 | render |
| js/19b-assistente-outro-sistema.js | js/19d-tabelas-salvas.js | 1 | repModal |
| js/19b-assistente-outro-sistema.js | js/28-exportar.js | 1 | obterDL |
| js/19c-colar-romaneio.js | js/10-limites-e-colunas.js | 1 | S |
| js/19c-colar-romaneio.js | js/11-utilidades.js | 1 | renderNum |
| js/19c-colar-romaneio.js | js/12-motor-linhas.js | 1 | gerar |
| js/19c-colar-romaneio.js | js/14-persistencia.js | 1 | salvar |
| js/19c-colar-romaneio.js | js/15-planilha.js | 1 | renderTopo |
| js/19c-colar-romaneio.js | js/17-lancamento.js | 1 | renderForm |
| js/19c-colar-romaneio.js | js/18-conjunto.js | 1 | conjSync |
| js/19d-tabelas-salvas.js | js/12-motor-linhas.js | 1 | gerar |
| js/19d-tabelas-salvas.js | js/27-fotos-escolher-colar.js | 1 | avisoEdicao |
| js/20-armazenamento-idb.js | core/utilidades.js | 1 | esc |
| js/20-armazenamento-idb.js | js/11-utilidades.js | 1 | toast |
| js/20-armazenamento-idb.js | js/16-selecao.js | 1 | selR |
| js/20-armazenamento-idb.js | js/17-lancamento.js | 1 | renderForm |
| js/20-armazenamento-idb.js | js/18-conjunto.js | 1 | rolarPane |
| js/20-armazenamento-idb.js | js/28-exportar.js | 1 | obterDL |
| js/21-edicao-em-lote-e-revisao.js | core/backup.js | 1 | romArma |
| js/21-edicao-em-lote-e-revisao.js | core/formulas.js | 1 | checaCel |
| js/21-edicao-em-lote-e-revisao.js | js/12-motor-linhas.js | 1 | fixarRefs |
| js/21-edicao-em-lote-e-revisao.js | js/15-planilha.js | 1 | renderTopo |
| js/21-edicao-em-lote-e-revisao.js | js/17-lancamento.js | 1 | renderForm |
| js/21-edicao-em-lote-e-revisao.js | js/21d-novidades.js | 1 | campoMsg |
| js/21-edicao-em-lote-e-revisao.js | js/22-importar-pdf-romaneio.js | 1 | romFotos |
| js/21-edicao-em-lote-e-revisao.js | js/30-eventos-mouse-e-clique.js | 1 | guardarAbertos |
| js/21-edicao-em-lote-e-revisao.js | js/31-eventos-campos-e-grade.js | 1 | limpaUlt |
| js/21b-romaneio-extras.js | core/colunas.js | 1 | r2c |
| js/21b-romaneio-extras.js | js/11-utilidades.js | 1 | toast |
| js/21b-romaneio-extras.js | js/17-lancamento.js | 1 | renderForm |
| js/21b-romaneio-extras.js | js/30-eventos-mouse-e-clique.js | 1 | guardarAbertos |
| js/21b-romaneio-extras.js | js/34-filtros-importacao-e-cartoes.js | 1 | romGaranteRom |
| js/21b-romaneio-extras.js | js/36-cadastros-salvar.js | 1 | cadConferir |
| js/21c-diagnostico-dados.js | js/10-limites-e-colunas.js | 1 | S |
| js/21c-diagnostico-dados.js | js/19d-tabelas-salvas.js | 1 | repModal |
| js/21c-diagnostico-dados.js | js/34-filtros-importacao-e-cartoes.js | 1 | impData |
| js/21d-novidades.js | js/11-utilidades.js | 1 | toast |
| js/21d-novidades.js | js/12-motor-linhas.js | 1 | gerar |
| js/21d-novidades.js | js/17-lancamento.js | 1 | previsao |
| js/21d-novidades.js | js/18-conjunto.js | 1 | irPara |
| js/21d-novidades.js | js/19d-tabelas-salvas.js | 1 | repModal |
| js/21d-novidades.js | js/20-armazenamento-idb.js | 1 | backupTotal |
| js/22-importar-pdf-romaneio.js | core/romaneio.js | 1 | mulM |
| js/22-importar-pdf-romaneio.js | core/utilidades.js | 1 | esc |
| js/22-importar-pdf-romaneio.js | js/10-limites-e-colunas.js | 1 | abertos |
| js/22-importar-pdf-romaneio.js | js/18-conjunto.js | 1 | rolarPane |
| js/22-importar-pdf-romaneio.js | js/20-armazenamento-idb.js | 1 | romSalvarSoon |
| js/22-importar-pdf-romaneio.js | js/21-edicao-em-lote-e-revisao.js | 1 | romLer |
| js/23-fotos-imgbb-e-nota-fiscal.js | core/backup.js | 1 | ROMKEY |
| js/23-fotos-imgbb-e-nota-fiscal.js | core/romaneio.js | 1 | virg |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/11-utilidades.js | 1 | toast |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/12-motor-linhas.js | 1 | gerar |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/17-lancamento.js | 1 | renderForm |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/21-edicao-em-lote-e-revisao.js | 1 | romLoteKids |
| js/23-fotos-imgbb-e-nota-fiscal.js | js/25-relatorio-romaneio.js | 1 | relGerar |
| js/25-relatorio-romaneio.js | core/configuracao.js | 1 | bnAjuda |
| js/25-relatorio-romaneio.js | js/11-utilidades.js | 1 | toast |
| js/25-relatorio-romaneio.js | js/15-planilha.js | 1 | render |
| js/25-relatorio-romaneio.js | js/21d-novidades.js | 1 | backupLembrarPosCriar |
| js/25-relatorio-romaneio.js | js/28-exportar.js | 1 | obterDL |
| js/26-acoes.js | js/14-persistencia.js | 1 | salvar |
| js/26-acoes.js | js/17-lancamento.js | 1 | renderForm |
| js/26-acoes.js | js/18-conjunto.js | 1 | conjSync |
| js/26-acoes.js | js/25-relatorio-romaneio.js | 1 | renderCfg |
| js/27-fotos-escolher-colar.js | core/romaneio.js | 1 | candFoto |
| js/27-fotos-escolher-colar.js | js/12-motor-linhas.js | 1 | gerar |
| js/27-fotos-escolher-colar.js | js/16-selecao.js | 1 | selR |
| js/27-fotos-escolher-colar.js | js/21d-novidades.js | 1 | primeirosAtualizar |
| js/28-exportar.js | js/11-utilidades.js | 1 | toast |
| js/28-exportar.js | js/12-motor-linhas.js | 1 | gerar |
| js/28-exportar.js | js/14-persistencia.js | 1 | salvar |
| js/28-exportar.js | js/19d-tabelas-salvas.js | 1 | repModal |
| js/29-importar-e-copia.js | js/11-utilidades.js | 1 | toast |
| js/29-importar-e-copia.js | js/15-planilha.js | 1 | render |
| js/29-importar-e-copia.js | js/19d-tabelas-salvas.js | 1 | repModal |
| js/29-importar-e-copia.js | js/28-exportar.js | 1 | obterDL |
| js/30-eventos-mouse-e-clique.js | core/colunas.js | 1 | clone |
| js/30-eventos-mouse-e-clique.js | core/dominio.js | 1 | novaComp |
| js/30-eventos-mouse-e-clique.js | js/00-adaptadores-nucleo.js | 1 | cfg |
| js/30-eventos-mouse-e-clique.js | js/11-utilidades.js | 1 | toast |
| js/30-eventos-mouse-e-clique.js | js/17-lancamento.js | 1 | renderForm |
| js/30-eventos-mouse-e-clique.js | js/18-conjunto.js | 1 | conjSync |
| js/30-eventos-mouse-e-clique.js | js/19c-colar-romaneio.js | 1 | ROM |
| js/31-eventos-campos-e-grade.js | core/exportacao.js | 1 | TIPO_PAD |
| js/31-eventos-campos-e-grade.js | js/14-persistencia.js | 1 | salvar |
| js/31-eventos-campos-e-grade.js | js/16-selecao.js | 1 | vis |
| js/31-eventos-campos-e-grade.js | js/19c-colar-romaneio.js | 1 | ROM |
| js/31-eventos-campos-e-grade.js | js/21b-romaneio-extras.js | 1 | fiscalCampo |
| js/31-eventos-campos-e-grade.js | js/21d-novidades.js | 1 | campoMsg |
| js/31-eventos-campos-e-grade.js | js/25-relatorio-romaneio.js | 1 | renderCfg |
| js/31-eventos-campos-e-grade.js | js/27-fotos-escolher-colar.js | 1 | desfazer |
| js/33-janelas-busca-e-paleta.js | core/colunas.js | 1 | semAc |
| js/33-janelas-busca-e-paleta.js | core/utilidades.js | 1 | esc |
| js/33-janelas-busca-e-paleta.js | js/00-adaptadores-nucleo.js | 1 | romSit |
| js/33-janelas-busca-e-paleta.js | js/11-utilidades.js | 1 | toast |
| js/33-janelas-busca-e-paleta.js | js/15-planilha.js | 1 | celular |
| js/33-janelas-busca-e-paleta.js | js/18-conjunto.js | 1 | irPara |
| js/33-janelas-busca-e-paleta.js | js/19c-colar-romaneio.js | 1 | ROM |
| js/33-janelas-busca-e-paleta.js | js/20-armazenamento-idb.js | 1 | backupTotal |
| js/33-janelas-busca-e-paleta.js | js/27-fotos-escolher-colar.js | 1 | desfazer |
| js/33-janelas-busca-e-paleta.js | js/35-visoes-menu-e-final.js | 1 | visPara |
| js/34-filtros-importacao-e-cartoes.js | core/utilidades.js | 1 | esc |
| js/34-filtros-importacao-e-cartoes.js | js/11-utilidades.js | 1 | toast |
| js/34-filtros-importacao-e-cartoes.js | js/15-planilha.js | 1 | celular |
| js/34-filtros-importacao-e-cartoes.js | js/18-conjunto.js | 1 | rolarPane |
| js/34-filtros-importacao-e-cartoes.js | js/23-fotos-imgbb-e-nota-fiscal.js | 1 | nfRotear |
| js/34-filtros-importacao-e-cartoes.js | js/27-fotos-escolher-colar.js | 1 | avisoEdicao |
| js/35-visoes-menu-e-final.js | core/utilidades.js | 1 | esc |
| js/35-visoes-menu-e-final.js | js/10-limites-e-colunas.js | 1 | abertos |
| js/35-visoes-menu-e-final.js | js/30-eventos-mouse-e-clique.js | 1 | guardarAbertos |
| js/35-visoes-menu-e-final.js | js/34-filtros-importacao-e-cartoes.js | 1 | pilulaAtualiza |
| js/36-cadastros-salvar.js | js/11-utilidades.js | 1 | toast |
| js/36-cadastros-salvar.js | js/15-planilha.js | 1 | render |
| js/36-cadastros-salvar.js | js/20-armazenamento-idb.js | 1 | romSalvarSoon |
| js/37-moeda.js | core/utilidades.js | 1 | num |

## Proposta de agrupamento (tabela do spec) contra o acoplamento medido

Para cada arquivo de `src/js/`: fatia proposta, acoplamento (simbolos nos dois sentidos) com a propria fatia proposta e com a outra fatia proposta mais acoplada. `!` marca arquivo mais acoplado a outra fatia que a sua.

| Arquivo | Proposta | Com a propria | Outra mais acoplada | Simbolos |
|---|---|---|---|---|
| js/00-adaptadores-nucleo.js | (sem proposta) | 0 | lancamento | 68 |
| js/10-limites-e-colunas.js | (sem proposta) | 0 | lancamento | 22 |
| js/11-utilidades.js | (sem proposta) | 0 | lancamento | 10 |
| js/12-motor-linhas.js | lancamento | 3 | planilha | 2 |
| js/14-persistencia.js | armazenamento | 26 | lancamento | 17 |
| js/15-planilha.js ! | planilha | 15 | lancamento | 22 |
| js/16-selecao.js | planilha | 14 | armazenamento | 4 |
| js/17-lancamento.js | lancamento | 13 | romaneio | 7 |
| js/18-conjunto.js | lancamento | 13 | romaneio | 6 |
| js/19-configuracoes-e-catalogo.js ! | configuracao | 0 | romaneio | 9 |
| js/19b-assistente-outro-sistema.js | exportacao | 1 | armazenamento | 1 |
| js/19c-colar-romaneio.js | romaneio | 24 | lancamento | 10 |
| js/19d-tabelas-salvas.js ! | tabelas | 0 | armazenamento | 27 |
| js/20-armazenamento-idb.js | armazenamento | 30 | romaneio | 20 |
| js/21-edicao-em-lote-e-revisao.js | romaneio | 32 | armazenamento | 12 |
| js/21b-romaneio-extras.js | romaneio | 20 | armazenamento | 6 |
| js/21c-diagnostico-dados.js | armazenamento | 4 | tabelas | 1 |
| js/21d-novidades.js ! | app | 0 | armazenamento | 6 |
| js/22-importar-pdf-romaneio.js | romaneio | 6 | planilha | 2 |
| js/23-fotos-imgbb-e-nota-fiscal.js ! | notafiscal | 0 | romaneio | 18 |
| js/25-relatorio-romaneio.js ! | romaneio | 4 | configuracao | 8 |
| js/26-acoes.js | lancamento | 7 | planilha | 3 |
| js/27-fotos-escolher-colar.js ! | lancamento | 10 | armazenamento | 23 |
| js/28-exportar.js ! | exportacao | 2 | planilha | 4 |
| js/29-importar-e-copia.js ! | exportacao | 1 | armazenamento | 2 |
| js/30-eventos-mouse-e-clique.js | (sem proposta) | 0 | armazenamento | 11 |
| js/31-eventos-campos-e-grade.js | (sem proposta) | 0 | lancamento | 10 |
| js/33-janelas-busca-e-paleta.js ! | app | 1 | lancamento | 2 |
| js/34-filtros-importacao-e-cartoes.js ! | planilha | 1 | romaneio | 11 |
| js/35-visoes-menu-e-final.js ! | app | 1 | planilha | 4 |
| js/36-cadastros-salvar.js ! | configuracao | 0 | armazenamento | 12 |
| js/37-moeda.js | configuracao | 0 | - | 0 |
