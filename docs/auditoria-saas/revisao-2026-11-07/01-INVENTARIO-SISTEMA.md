# 01 — Inventário revalidado

## Escopo e limitações

A pasta fornecida é Cadastro Peças. LEIA-ME.txt:2 identifica cadastro-pecas.html como fonte principal. O pedido descreve ERP para produção sob encomenda, mas esta árvore implementa cadastro de peças/semijoias e integrações de planilha. Não se presume que este seja todo o ERP. Nenhum outro repositório foi informado/acessado.

HEAD observado: 7fe026f3f7752768e401b5d95196d0e84ba0bdcb. Antes da auditoria já havia mudanças em cadastro-pecas.html e tests/t30.py; docs/, .claude/, t31/t32 e pedido_peso.txt estavam não rastreados. Nenhum foi revertido.

Foram enumerados arquivos ativos, ocultos, rastreados/ignorados, backups e worktree existente; lidos configuração local, gerador, dependências declaradas, documentação e caminhos críticos do código/testes. Biblioteca minificada não recebeu revisão manual integral. Backups são históricos, não módulos ativos. Banco/provedor remoto, produção e dados reais NÃO VERIFICADOS. Nenhum AGENTS.md encontrado na árvore examinada ou no pai consultado.

## Snapshot

| Artefato | Bytes | SHA-256 |
|---|---:|---|
| cadastro-pecas.html | 671579 | 3757d61d0a5b42a7011e4c2a5330b480e42f4bd95de74694ad2db32ca5838e9b |
| Cadastro de Pecas - abrir no Chrome.html | 671770 | 9e558574a491825b24c7ecd0ef9aed6cfc1477cc6845eb8c7f3ef633056941cc |
| lib/xlsx.full.min.js | 951904 | cc015130aa8521e7f088f88898eba949ccdcbfb38df0bd129b44b7273c3a6f41 |
| tools/demo.py | 5572 | 8c5c2585f1810de59562b79a5e18cf657c20973bc87c112e3f46a6282a03feeb |
| demo-netlify/index.html | 586111 | f5fa42019b41592d01c9b63ea4f4913f7dd636a8c3bfabbcd87b391f35a7d9e7 |
| demo-netlify/_headers | 686 | a16dd738cea3a8691822d03a9f681ecebd20fdb8c73fae694d05361f3c149a74 |

Linhas de tools/demo.py, demo-netlify/index.html e _headers atualizadas em 07/11/2026 após a correção do gerador (ver A13 e A21 em 12); as demais linhas são da captura inicial.

5.086 posições ao dividir por newline, incluindo posição final vazia; 378 declarações nomeadas; 63 ocorrências .innerHTML. Contagem lexical não mede complexidade ciclomática. Nenhuma declaração nomeada duplicada encontrada; há reassociação de romCriar em H:3728. Código morto e ciclos de chamadas NÃO VERIFICADOS: eventos e callbacks impedem inferir ausência de uso por busca textual.

## Stack, dependências e ambientes

- HTML/CSS/JavaScript moderno em IIFE strict (H:1350). Não é ES5. const/let, async, Map/Set e spread.
- Estado S/G/ROM/NF/configuração compartilhado no fechamento. Não são todas funções globais de window. Globais externos XLSX, pdfjsLib, window.claude; exposições window.__nf (3745) e window.__modais (4862).
- SheetJS local 0.20.3 confirmado em contexto Node; hash confere com lib/LEIA-ME.txt. Fallback 0.18.5 permanece (1348).
- PDF.js 3.11.174 carregado sob demanda, worker por blob/fallback CDN. Ambos getDocument têm isEvalSupported:false. Google Fonts é outra dependência remota.
- localStorage: cadpecas4, fallback cadpecas3, rascunhos/índices/preferências/autor/chave imgbb.
- IndexedDB cadpecas-big v3: fotos, roms, tabs, pontos (3033). Fotos originais e miniaturas têm chaves distintas.
- Integração opcional window.claude.use("db"): dados/config, dados/lancamentos, dados/romaneio. API de documentos não identifica banco nem prova isolamento/autenticação.
- Nenhum manifest Node, lockfile, tsconfig, migrations SQL ou workflow CI localizado na árvore ativa. Não significa que não existam fora dela.
- Testes: 26 scripts t*.py, Playwright+Edge, openpyxl; t18 depende de CP_BACKUP. run_all reconstrói wrapper existente e cria fixture XLSX temporária. Não executado nesta auditoria.
- Desenvolvimento: edição do principal/abertura wrapper Chrome. Produção documentada: gerador tools/demo.py e Netlify Drop. Deploy/headers/logs efetivos NÃO VERIFICADOS.
- Gerador usa substrings/asserts e npx terser sem versão (G:49); não copia lib. Demo contém index/_headers/robots/LEIA-ME, sem lib/xlsx.full.min.js, embora index a referencie. A demo foi regenerada depois desta captura (a pasta demo-netlify/ é ignorada pelo git, então o arquivo que estava publicado não ficou versionado). Por isso o _headers publicado e o gerado divergiam: ver A13. Continua sem lib/ na pasta demo.
- Histórico: 12 snapshots HTML e gerador antigo em backups. Worktree .claude existente foi enumerada e preservada.
- Python/py do PATH eram aliases WindowsApps inacessíveis. Node v24.18.0 disponível.

## Matriz de módulos

H = cadastro-pecas.html. Complexidade/risco são avaliações de engenharia.

| Módulo | Arquivos e âncoras | Dependências | Complexidade/risco | Migração |
|---|---|---|---|---|
| Catálogo/referências | H:1578 gerar;1942 lerLanc;4011 adicionar | S/config/grades/banhos | alta/alta | regras puras com sequência preservada |
| Cálculo/conjuntos/células | H:1661 calcBanho;1748 celulasBase;conjCalc | 31 colunas, overrides, quantidades | alta/alta | caracterizar, decimal versionado |
| Editor/tabela | H:2068 janelaHtml;2087 renderTopo;4615 onField | G/DOM/seleção/histórico | alta/alta | React por fluxo, preservar virtualização |
| Cadastros/configuração | lerConfig; H:3851 renderCfg | fornecedor/categoria/modelos | média/alta | schemas e IDs estáveis |
| Romaneios | H:3329 romPlanilha0;3529 romCriar | parsers/ROM/catálogo/fotos | alta/alta | parser separado da confirmação |
| NF XML/PDF | nfLerXml/nfPdfParse/nfConfirmar; wrapper 3728 | ROM/custos/fornecedor | alta/alta | contrato explícito, sem sobrescrita |
| Mídia | H:3419 carregarPdfJs;3967 fotoNaPeca;3539 | canvas/IDB/imgbb | alta/alta | Storage privado e publicação separada |
| Arquivo/relatório | H:2990 tabSalvar;3772 relGerar | snapshots/peças/romaneios | média/alta | snapshots versionados |
| Backup/restore | H:3064 bkMontar;3160 restaurarTotal | todos armazenamentos | alta/crítica | manifesto/staging/recuperação |
| Persistência | H:1807 flush;1970 carregar;3033 idbOp | estado/UI/provedor | alta/crítica | porta com revisão/resultado |
| Exportação | H:4167 baixar;4188 montarXlsx;modeloBling | geração/modelos/SheetJS | alta/alta | adaptadores e fixtures por formato |
| Distribuição/testes | G;tests/*.py;demo/_headers | Python/Edge/npx/HTML | média/alta | runner confiável/build fixado |

## Fluxos, acoplamentos e extração

1. Formulário → adicionar → S.lanc → gerar/celulas → preview → CSV/XLSX → sequências. Extrair funções preservando ordem/zeros; não gerar SKUs novos sem reconciliação.
2. Arquivo → hash/fila → parser → revisão ROM/NF → romCriar → peças/fotos/histórico. Wrapper NF depende da ordem de avaliação. Parsing pode ser extraído; confirmação precisa adaptação transacional.
3. salvar agenda 600 ms; flush tenta remoto e depois local. Erro remoto retorna antes do local; miniaturas têm commits próprios.
4. carregar renderiza local e permite editar antes de substituir pelo remoto. Aviso multiaba ocorre depois da gravação.
5. Backup reúne stores e marca falhas; restore não trata incompleto como contrato distinto. Pontos de recuperação/backup de pasta existem, sem prova de restauração integral.
6. Exportação mantém Jueri 31 colunas, Bling 59 posições, agrupamentos/lotes/modelos customizados. Não houve validação atual nos fornecedores.

Gargalos: mesmo fechamento para regras/DOM/persistência, colunas por letras, geração dependente de configuração, serialização de estado e distribuição textual. tabSalvar faz find por linha (2992), potencialmente quadrático; medir antes de otimizar. Virtualização já existe.

Extrair sem reescrever semântica: geração/cálculos/parsers/formatos, após caracterização. Adaptar: UI, persistência, snapshots, mídia e autorização. Construir novos: identidade/membership/RLS/BFF, pois não há implementação auditável local. Isso não justifica reconstruir funcionalidades maduras.

CRM, contratos, caixa/DRE, conciliação, ordens de produção, agenda e pós-venda não foram localizados. NÃO VERIFICADOS como existentes em outros sistemas. Quantidade/preço não equivalem a livro de estoque/razão financeiro; NF importada não implica emissão ou autenticidade fiscal.

## Índice lexical e inventário dos testes

O índice abaixo é gerado da fonte do snapshot para relocalização; não afirma uso nem cobertura.


Testes encontrados: t1.py, t2.py, t3.py, t6.py, t7.py, t9.py, t10.py, t12.py, t13.py, t15.py, t17.py, t18.py, t19.py, t20.py, t21.py, t22.py, t23.py, t24.py, t25.py, t26.py, t27.py, t28.py, t29.py, t30.py, t31.py, t32.py.


## Revalidação final e alteração concorrente

Durante a auditoria, sem escrita desta sessão no código, HEAD mudou para ebcfb66dc7efdaba53e59f40827648035fac607c. Fonte final: 671595 bytes, SHA-256 06830fa92aa8d7a67a5b2620897ef5e80df92678e1783c1495dba86fedc392f0. Wrapper final: 671786 bytes, SHA-256 67ddf8836593264aec7e684060884d05b93fbb476c4b416e6954723d1a0258ed. Gerador manteve hash até esta captura; depois dela foi corrigido (hash atual no snapshot acima). Não atribuir autoria externa; origem da edição não investigada.

As referências numéricas no corpo dos documentos são da captura inicial da tabela. Rechecagem final confirmou fallback SheetJS (1348), limpeza (1468–1469), unicidade antes da normalização (3145/3154), writes remotos (1814–1816), substituição tardia (1987), foto de romaneio sem await (3540), mitigação PDF (3438/3574), backup incompleto (3072) e runner com mesma condição de falha. Compilação sintática final dos scripts também passou. Não houve segunda execução integral de todos fluxos; mudanças fora desses pontos permanecem NÃO VERIFICADAS. Fixar snapshot antes de implementar.

O índice abaixo foi regenerado na captura FINAL, ao contrário das linhas históricas do corpo.

| Função | Linha H final |
|---|---:|
| checaTam | 1365 |
| checaPaginas | 1366 |
| checaLinhasPlan | 1367 |
| resumoCat | 1390 |
| colcfgPadrao | 1397 |
| letraN | 1410 |
| proxLetra | 1411 |
| zoomAplicar | 1459 |
| num | 1471 |
| comSufixoCat | 1487 |
| libGradeSel | 1490 |
| effGrade | 1493 |
| gradeDaCat | 1497 |
| selFaixa | 1499 |
| sincGrade | 1505 |
| libSiglas | 1521 |
| descVar | 1539 |
| prefixosTodos | 1544 |
| renderNum | 1549 |
| fnum | 1560 |
| proxDe | 1561 |
| inicioDe | 1562 |
| contFinal | 1563 |
| listaDe | 1569 |
| opts | 1574 |
| toast | 1575 |
| descBanho | 1576 |
| gerar | 1579 |
| checaCel | 1648 |
| marcaRuim | 1658 |
| lerValor | 1660 |
| calcBanho | 1662 |
| valorCol | 1677 |
| saidaLinhas | 1697 |
| celCol | 1714 |
| validarModelo | 1719 |
| chaveDoCabecalho | 1736 |
| traduzF | 1741 |
| celulas | 1743 |
| celulasBase | 1749 |
| avisos | 1758 |
| histIni | 1775 |
| undoBtns | 1776 |
| histTam | 1777 |
| histNota | 1779 |
| salvar | 1794 |
| flushJa | 1796 |
| jsonLocal | 1804 |
| guardarMinis | 1806 |
| flush | 1808 |
| pontoSalvar | 1831 |
| pontoAuto | 1832 |
| bkPasta | 1835 |
| bkPerm | 1836 |
| bkEscrever | 1837 |
| bkAuto | 1840 |
| bkStatus | 1844 |
| pontosCarregar | 1849 |
| pontoRestaurar | 1851 |
| carregarMinis | 1855 |
| migrarFotos | 1860 |
| lerConfig | 1869 |
| migrarJueri | 1892 |
| migrarGrades | 1916 |
| migrarGrades0 | 1923 |
| lerLanc | 1943 |
| lerForm | 1955 |
| resolverCorrompido | 1957 |
| dadosCorrompidos | 1958 |
| carregar | 1971 |
| gavetaAlt | 2007 |
| formAbrir | 2008 |
| vista | 2016 |
| pendente | 2018 |
| casa | 2021 |
| renderFiltros | 2032 |
| cartoes | 2047 |
| render | 2062 |
| renderListas | 2063 |
| janAlturas | 2067 |
| janPos | 2068 |
| janelaHtml | 2069 |
| janRepintar | 2074 |
| janMedir | 2080 |
| janGarantir | 2085 |
| guiaHTML | 2087 |
| renderTopo | 2088 |
| abrirCel | 2141 |
| novaLivre | 2156 |
| gravarCel | 2157 |
| sincFormCelula | 2166 |
| fecharCel | 2174 |
| lerTsv | 2191 |
| colarCel | 2196 |
| passo | 2220 |
| maxRi | 2221 |
| selBox | 2222 |
| selecionar | 2223 |
| pintarSel | 2224 |
| rolarAte | 2230 |
| textoCel | 2231 |
| idsDaSel | 2232 |
| copiarSel | 2233 |
| limparSel | 2235 |
| preencherAbaixo | 2239 |
| renderSelBar | 2243 |
| usarModelo | 2256 |
| campoHTML | 2264 |
| romQFim | 2277 |
| painelMulti | 2279 |
| painelRapido | 2283 |
| renderForm | 2299 |
| dividirTamanhos | 2372 |
| addTamanhos | 2374 |
| letrasDeTamanho | 2380 |
| salvarRapido | 2381 |
| previsao | 2409 |
| fatorDoPreco | 2411 |
| conjErro | 2426 |
| conjResumoHTML | 2432 |
| conjCalc | 2438 |
| conjLimpar | 2450 |
| conjSync | 2453 |
| conjTotHTML | 2473 |
| conjPainel | 2481 |
| atualizarGera | 2502 |
| renderFormSoon | 2543 |
| ajustarAltura | 2544 |
| rolarPane | 2556 |
| irPara | 2558 |
| sec | 2578 |
| abaCfg | 2579 |
| acharCat | 2586 |
| prefixoNovo | 2587 |
| nomeCatErro | 2588 |
| nomeCatLivre | 2589 |
| planoLista | 2597 |
| aplicaPlano | 2607 |
| previaInfo | 2608 |
| atualizaPrevia | 2617 |
| catTopo | 2618 |
| dupAviso | 2626 |
| dupPainel | 2629 |
| dupAbrir | 2634 |
| dupCampo | 2636 |
| dupOk | 2641 |
| focoChip | 2649 |
| subRenomear | 2650 |
| subRenomear0 | 2651 |
| letraBanhoLivre | 2668 |
| nomeBanhoLivre | 2669 |
| corOpts | 2670 |
| corNovaOk | 2672 |
| secCat | 2678 |
| renderGraf | 2725 |
| modPrev | 2740 |
| secModelo | 2744 |
| abrirNovoSistema | 2772 |
| lerNovo | 2775 |
| mostrarNovo | 2790 |
| modeloParaJson | 2795 |
| modeloDeJson | 2798 |
| padraoRegex | 2812 |
| mapaCat | 2818 |
| lerRomaneio | 2822 |
| padroesAuto | 2858 |
| lerRomaneioAuto | 2863 |
| romIds | 2871 |
| romNomeId | 2872 |
| romSetForn | 2875 |
| romReset | 2883 |
| romColsR | 2884 |
| romForm | 2889 |
| romFixaRefs | 2914 |
| romMonta | 2918 |
| romPreview | 2924 |
| romLinhasHTML | 2932 |
| renderRom | 2937 |
| renderRom0 | 2938 |
| setAutor | 2960 |
| arqRef | 2961 |
| gravarIdx | 2964 |
| tabIndex | 2971 |
| fotoViva | 2976 |
| varrerFotos | 2978 |
| varrerTudo | 2979 |
| tabsMigrar | 2982 |
| repModal | 2990 |
| tabSalvar | 2991 |
| tabListaAbrir | 3003 |
| tabSalvarAbrir | 3006 |
| tabSalvarOk | 3011 |
| tabRestaurar | 3013 |
| tabVer | 3017 |
| romVer | 3025 |
| tabCsv | 3030 |
| idbOp | 3034 |
| romRec | 3037 |
| romIndex | 3038 |
| romGravarBig | 3040 |
| avisoIdb | 3042 |
| romExcluirSalvo | 3043 |
| romArma | 3045 |
| romMarcar | 3046 |
| romFotosBig | 3048 |
| romAbrirSalvo | 3050 |
| romListaTabela | 3058 |
| romListaRef | 3059 |
| romListaAbrir | 3060 |
| romBadge | 3064 |
| bkMontar | 3065 |
| backupTotal | 3074 |
| checarConfig | 3085 |
| checarLanc | 3108 |
| romLimpo | 3118 |
| tabLimpa | 3128 |
| validarBackup | 3137 |
| restaurarTotal | 3161 |
| romSalvarSoon | 3185 |
| romSalvar | 3186 |
| romRascunho | 3191 |
| romLimparRascunho | 3192 |
| romSync | 3193 |
| romRetomar | 3194 |
| romBulkHTML | 3198 |
| romSelecionar | 3208 |
| romSelN | 3210 |
| romLote | 3211 |
| romRevisar | 3221 |
| romCardHTML | 3242 |
| romBodyHTML | 3272 |
| romUltHTML | 3284 |
| romAtual | 3288 |
| romLoteResumo | 3306 |
| romLoteHTML | 3313 |
| romLoteAtualiza | 3318 |
| romLotePeso | 3319 |
| romLoteAdd | 3320 |
| romLoteDecora | 3324 |
| romNovaCat | 3326 |
| romPlanilha | 3329 |
| romPlanilha0 | 3330 |
| romPlanHTML | 3337 |
| romExInfo | 3344 |
| romExAtualiza | 3347 |
| romCampo | 3349 |
| romLer | 3402 |
| romAplicaR | 3406 |
| romDividir | 3416 |
| carregarPdfJs | 3420 |
| miniFoto | 3427 |
| imgCanvas | 3430 |
| lerPdf | 3437 |
| romFotos | 3453 |
| romPdf | 3457 |
| melhorarFoto | 3465 |
| abrirZoom | 3470 |
| testarChaveImgbb | 3489 |
| fotoReduzida | 3496 |
| enviarFoto | 3501 |
| enviarFotos | 3516 |
| romCriar | 3530 |
| nfIdx | 3553 |
| nfIdxSet | 3554 |
| nfNormaliza | 3556 |
| nfLerXml | 3559 |
| nfTextoXml | 3571 |
| nfPdfItens | 3573 |
| nfCols | 3578 |
| nfColDe | 3591 |
| nfPdfParse | 3593 |
| nfCatDe | 3623 |
| nfAcharForn | 3629 |
| nfIniciar | 3632 |
| nfBuscaDup | 3641 |
| nfOv | 3647 |
| nfFechar | 3649 |
| nfErro | 3650 |
| nfAbrir | 3651 |
| nfRotear | 3659 |
| nfRotear0 | 3660 |
| nfLinhas | 3663 |
| nfCalc | 3670 |
| nfResumo | 3672 |
| nfRowHTML | 3678 |
| nfTopHTML | 3693 |
| nfFoco | 3698 |
| nfLinhaRefaz | 3699 |
| nfCustosRefaz | 3700 |
| nfRender | 3701 |
| nfConfirmar | 3714 |
| relGerar | 3773 |
| relFaixas | 3781 |
| relTexto | 3783 |
| relCsv | 3788 |
| arqSalvar | 3790 |
| relNormalizar | 3793 |
| relLer | 3802 |
| relAbrir | 3803 |
| parseMapa | 3816 |
| secRom | 3818 |
| resetBar | 3841 |
| resetar | 3843 |
| renderCfg | 3852 |
| renderCfg0 | 3853 |
| lembrarForn | 3934 |
| aplicarMemForn | 3938 |
| resumoMem | 3945 |
| marcadosPadrao | 3948 |
| trocarBanhista | 3950 |
| banhistaDoFornecedor | 3953 |
| limparForm | 3954 |
| lerFotoArquivo | 3961 |
| fotoNaPeca | 3968 |
| fotosEmLote | 3973 |
| fotoDoFormulario | 3991 |
| fotoRemover | 3992 |
| adicionar | 4012 |
| mostrarNoFim | 4048 |
| desfazer | 4054 |
| desfazer0 | 4055 |
| dobrarOv | 4075 |
| editar | 4087 |
| cancelar | 4095 |
| duplicar | 4096 |
| duplicarLinha | 4101 |
| excluirLinhas | 4111 |
| excluir | 4122 |
| faixaRefs | 4130 |
| faixaFiltro | 4131 |
| celulaXlsx | 4132 |
| obterDL | 4134 |
| pendenciasExport | 4136 |
| conferirExport | 4150 |
| abrirConferencia | 4151 |
| mostrarConferencia | 4152 |
| txtSaida | 4157 |
| montarCsv | 4159 |
| gerarExport | 4167 |
| baixar | 4168 |
| dividirLotes | 4186 |
| montarXlsx | 4189 |
| copiar | 4198 |
| gravarExport | 4214 |
| importar | 4222 |
| aplicarImp | 4236 |
| backup | 4244 |
| restaurar | 4247 |
| exemplo | 4254 |
| ativarConjunto | 4313 |
| gradeDoEl | 4582 |
| aplicaFaixa | 4583 |
| validaBanho | 4585 |
| limpaUlt | 4601 |
| prefixoEmUso | 4605 |
| trocarPrefixo | 4606 |
| onField | 4616 |
| romSit | 4896 |
| romFiltroAplicar | 4898 |
| romFiltroMontar | 4907 |
| romCompacto | 4919 |
| romNav | 4920 |
| palAbrir | 4947 |
| pilulaAtualiza | 4967 |
| impHash | 4975 |
| impPrepara | 4979 |
| romGaranteRom | 4983 |
| impAbrirArq | 4984 |
| impAdd | 4991 |
| renderImp | 4998 |
| cardsModoCompacto | 5007 |
| cardsDecorar | 5008 |
| tabelasRotular | 5030 |
| visAtual | 5035 |
| visPara | 5036 |
| sideMarcar | 5056 |
| sideAplicar | 5060 |
| hdrLayout | 5065 |
