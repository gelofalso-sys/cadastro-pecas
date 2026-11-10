# Leitura consolidada — estado mais recente

**Situação: auditoria parcial, não certificação.** Esta seção prevalece sobre informações preliminares nos apêndices cronológicos abaixo. A suíte em cópia isolada terminou com 40 scripts reportados OK, um ignorado e zero falhas reportadas; o agregador tem defeito que reduz a confiança nesse resultado. O HTML montado corresponde por SHA-256 ao HTML local; a página publicada e a pasta local de publicação têm identificadores e tamanhos diferentes, sem comprovação de equivalência funcional. O Git confirmou HEAD 43c04fd e ausência de alterações rastreadas; há arquivos não rastreados listados na atualização abaixo.

| Frente | Situação atual | Limite principal |
|---|---|---|
| A Persistência | Análise, recarga, duas abas e backup sintético testados; falhas de rollback, índice e fechamento pendente reproduzidas na interface com falhas injetadas | Falhas reais de IDB, quota e concorrência assíncrona não reproduzidas |
| B Cálculos | Cenários de bruta e valores limite em XLSX; ambiguidade de ponto confirmada | Conjuntos, descontos e limites não esgotados |
| C Importação | Omissão e truncamento de romaneio e conversão incorreta de CSV reproduzidos na interface; nota fiscal testada com XML sintético | PDF/XML reais e reconciliação ampla pendentes |
| D Exportação | XLSX e CSV sintéticos reabertos; corrida de clipboard reproduzida na interface com atraso injetado | Frequência no clipboard normal, demais modelos e importador Bling não verificados |
| E Fotos | Foto sintética em backup restaurada e exibida | Bytes armazenados comparados em uma imagem sintética; alto volume e falhas pendentes |
| F Segurança | Revisão estática e casos inofensivos HTML/CSV; advisories verificados | Cobertura de campos e parsers não é pentest completo |
| G Interface | Criação, busca, edição, importação e backup em cenários selecionados | Todos os fluxos e estados não cobertos |
| H Responsividade | 375×812 e 768×1024 observados em cópia local | Aparelho físico, teclado virtual e janelas não esgotados |
| I Acessibilidade | Semântica e teclado analisados; imagens sem teclado identificadas | Leitor de tela, contraste e navegação integral pendentes |
| J Desempenho | Duas medições de 1.000 peças; 5.000 interrompido | Sem medição de memória ou resultado de 20.000 |
| K Testes | Suíte executada; defeitos do agregador, t40 e t44 identificados | Auditoria exaustiva de todos os testes pendente |
| L Publicação | Build local e HTML público comparados; processo examinado | Equivalência funcional de produção não comprovada |
| M SaaS | Documentação e obstáculos principais revistos | Arquitetura futura, RLS e implantação não validadas |

Não se atribuem notas 0–10 nem uma nota geral confiável porque as lacunas impedem sustentá-las; isso não significa nota máxima. M seria separada. Prioridades principais: AUD-A-007 sobrescrita de alteração em variação (P1, interface); AUD-C-004 conversão incorreta de valor CSV e identificação (P1, interface); AUD-C-001 omissão de linha sem descrição (P1, interface); AUD-C-003 truncamento de romaneio (P1, interface); AUD-A-001 backup leve potencialmente irrestaurável (P1, funções simuladas); AUD-A-003 rollback pode comunicar sucesso incorreto (P1, interface com falhas injetadas); AUD-A-004 índice de romaneio pode não persistir (P1, interface com falha injetada); AUD-B-001 entrada numérica ambígua (P1, interface); AUD-D-001 corrida de cópia (P1, interface com atraso injetado); AUD-A-002 migração de grades (P1, impacto confirmado em interface sintética); AUD-K-001 agregador pode mascarar erro (P1, código); AUD-J-001 lentidão em lote (P2, duas medições); AUD-C-002 conferência de nota ambígua (P2, interface). A ordem entre eles depende da probabilidade real e recuperação.

Veredito provisório: não há base para garantir segurança de uso intensivo ou ausência de perda de dados. Os cálculos e exportações foram corretos nos cenários concretos testados, exceto os riscos explicitados; isso não valida todos os casos. Os testes existentes detectam parte das regressões, mas apresentam lacunas e não bastam como garantia. Antes de considerar o sistema estável, reproduzir falhas de armazenamento reais de forma controlada, garantir recuperação, corrigir importação e mensagens enganosas, cobrir concorrência e obter uma suíte confiável. Nenhuma correção está autorizada por esta auditoria.

---
# Auditoria técnica — 09/11/2026

## Resumo executivo

Esta é uma auditoria **parcial**, predominantemente estática; não é certificação de segurança ou de prontidão para produção. O risco mais relevante identificado é a possibilidade de uma cópia leve acima do limite ser apresentada como restaurável, mas ser recusada. Não foi demonstrada perda real nesta rodada. A confiabilidade comercial não pode ser generalizada a partir dos testes executados. Recomenda-se validar recuperação e concorrência em ambiente isolado antes de mudanças.

## Escopo e linha de base — primeira rodada histórica

Diretório: `versao-organizada`. Lidos LEIA-ME, PROMPT-NOVA-SESSAO, auditoria consolidada e resumo SaaS anteriores. Três agentes independentes examinaram persistência/fotos, regras comerciais/importação/exportação e segurança/testes/publicação. As frentes críticas tiveram revisão cruzada por outro agente. Nenhuma correção foi implementada. Na primeira tentativa Git retornou `cannot change to ... Cadastro Peças`; consulta posterior confirmou HEAD e estado rastreado conforme atualização abaixo. A versão publicada foi observada na conversa anterior, mas não foi demonstrada equivalência com o código local. Antes destas instruções restritivas, foram criados registros sintéticos na versão publicada a pedido do usuário; eles permanecem no armazenamento daquele navegador. Não houve nova escrita no site nesta auditoria.

A montagem foi executada em cópia isolada: SHA-256 do HTML montado e do original `E0AD3101081AF633FF0180D87CE97FE390C8C008DF20C92FBAEEE15639EA19A3`. O script também sobrescreve o wrapper Chrome mesmo com destino alternativo (`tools/montar.py:15-19`). A suíte também sobrescreve o wrapper (`tests/run_all.py:8-10`), justificando isolamento.

| Linha de base | Resultado |
|---|---|
| Scripts identificados pelo agregador | 41 |
| Reportados OK na primeira tentativa | 2 (t42 e t43; a rodada posterior reportou 40 OK) |
| Falhas de infraestrutura na primeira tentativa | 38: módulo Python `playwright` ausente; dependência instalada temporariamente na rodada posterior |
| Ignorados | 1: t18, sem CP_BACKUP |
| Falhas funcionais demonstradas pela rodada | Nenhuma; não confundem-se com dependência ausente |
| Build | Concluída em cópia; hash igual ao original |
| Tempo | Não medido de forma confiável |

`run_all.py` também pularia t16 sem CP_BACKUP, mas esse arquivo não estava presente na cópia. Não se usou backup real.

## Achados

| ID | Frente | Prioridade | Certeza | Evidência e impacto | Correção sugerida | Esforço |
|---|---|---|---|---|---|---|
| AUD-A-001 | A | P1 | Confirmado por código, cenário de volume não reproduzido | `src/js/20-armazenamento-idb.js:37-51,137`: versão leve pode continuar acima do limite e ser recusada, sem aviso final correspondente. | Medir novamente o arquivo leve e impedir falsa garantia; oferecer formato restaurável. | M |
| AUD-D-001 | D | P1 | Provável | `src/js/28-exportar.js:48-61,94-100`: assinatura da configuração é capturada após esperas, enquanto dados foram preparados antes. Mudança concorrente pode permitir limpeza após exportação divergente. | Capturar e validar snapshot consistente antes da limpeza. | M |
| AUD-K-001 | K | P1 | Confirmado por código | `tests/run_all.py:25-26`: saída não zero com stderr vazio e sem linha `FALHA ` pode ser reportada OK. | Considerar todo retorno não zero falha, preservar stdout/stderr. | P |
| AUD-K-002 | K | P2 | Confirmado por código | `tests/t44.py:39`: condição aceita tanto igualdade quanto desigualdade do primeiro elemento, não valida renumeração correta. | Comparar sequência completa esperada. | P |
| AUD-F-001 | F | P2 | Confirmado em regex isolado, cenário patológico | `19c-colar-romaneio.js:4-10` | Leitura pode consumir tempo excessivo | Validar padrão e limitar trabalho | M |
| AUD-I-001 | I | P2 | Confirmado por código; interação manual não verificada | `src/js/15-planilha.js:61-65,124` e `30-eventos-mouse-e-clique.js:242`: foto clicável sem foco/teclado; cartão interativo contém botões. | Usar controles semânticos independentes e testar teclado/leitor de tela. | M |

### AUD-A-001 — Backup leve potencialmente irrestaurável (registro inicial)

Condição: dados remanescentes após remoção de fotos excedem o limite de 150 MiB. A construção inclui romaneios e tabelas; após gerar o blob leve não há nova validação de tamanho, enquanto restauração rejeita arquivos acima do limite. A interface promete versão restaurável, mas a condição descrita contradiz essa promessa. Impacto: recuperação pode falhar justamente quando necessária; frequência não medida. Recuperação depende de outra cópia válida. Teste necessário: gerar dados sintéticos que mantenham o arquivo leve acima do limite e tentar restaurar. Aceite: toda cópia anunciada como restaurável passa pela validação e restaura integralmente, ou o usuário recebe erro antes de depender dela. Risco de correção: alterar formato ou escopo do backup.

### AUD-D-001 — Janela de concorrência na exportação (registro inicial; reprodução posterior abaixo)

Condição: configuração relevante muda durante uma espera de download/cópia. A preparação dos dados antecede a captura de `sigCfg`; a limpeza posterior usa essa assinatura. A revisão independente confirmou a janela no código, mas o efeito no arquivo depende de referências mutáveis e da sequência; não houve reprodução. Impacto possível: limpar registros cuja saída não representa configuração atual. Teste: atrasar download em ambiente isolado, alterar configuração, comparar arquivo reaberto e estado antes de limpar. Aceite: mudança relevante durante a operação impede limpeza ou a saída e assinatura refletem o mesmo snapshot. Risco: regressão em modelos e exportações agrupadas.

### AUD-K-001 — Agregador pode mascarar falha

Condição: subprocesso termina com código diferente de zero, stderr vazio e sem prefixo específico no stdout. `tests/run_all.py:25-26` não adiciona erro nessa condição e pode apresentar OK. Isto não demonstra que t42/t43 falharam nesta rodada. Impacto: confiança indevida em uma suíte verde. Teste: subprocesso sintético com exit 1 e stderr vazio. Aceite: retorno não zero sempre produz falha e saída diagnóstica. Risco de correção: testes que atualmente dependem desse comportamento passarão a falhar.

## Pendências anteriores — avaliação inicial; ver atualizações posteriores

A classificação abaixo é conservadora: a análise estática identificou mudanças, mas não comprovou todos os cenários por teste dinâmico.

| Pendência | Estado | Evidência e risco residual |
|---|---|---|
| sincFormCelula | AINDA PRESENTE | Confirmada na interface: ouro não salvo volta ao valor anterior ao editar prata; ver AUD-A-007. |
| tabSalvar | CORRIGIDA E VERIFICADA NOS CENÁRIOS TESTADOS | Peça nova e edição existente durante atraso foram preservadas; configurações/fotos não esgotadas. |
| flush | NÃO VERIFICADA | `14-persistencia.js:43-53` revalida conflito; falta teste de abas concorrentes. |
| guardarMinis | NÃO VERIFICADA | `14-persistencia.js:38-39` compara conteúdo; falta ensaio de troca durante gravação. |
| excluirLinhas/pontoAuto | CORRIGIDA PARCIALMENTE | `14-persistencia.js:66-67` captura antes da espera; `27-fotos-escolher-colar.js:166-167` não aguarda sucesso do ponto. Falha do IDB não reproduzida. |
| Linhas sem descrição | CORRIGIDA PARCIALMENTE | `30-eventos-mouse-e-clique.js:290-291` bloqueia caso com código e quantidade positiva; demais casos não verificados. |
| Limite de planilha | NÃO VERIFICADA | `10-limites-e-colunas.js:16-17` limita linhas, colunas e células; execução adversarial não realizada. |
| sigLanc | CORRIGIDA PARCIALMENTE | `28-exportar.js:94-100` inclui assinatura de configuração, sujeita à janela AUD-D-001. |
| Backup grande | AINDA PRESENTE | `20-armazenamento-idb.js:47-51,137`; backup automático `14-persistencia.js:72`; ver AUD-A-001. |

## Cobertura e limitações — primeira rodada

Não há correções anteriores classificadas como verificadas por teste nesta rodada. `t40` contém expectativas independentes e reabre XLSX; `t43` verifica fórmula; `t46` cobre arredondamento; `t47` trata zeros. Sua existência não comprova sucesso atual nem cobertura completa. Faltaram Playwright Python, testes de importação/exportação ponta a ponta, backup grande, concorrência, interrupções, fotos, acessibilidade assistiva, viewports 375×812 e 768×1024 e carga de 1.000/5.000/20.000 linhas. Não se atribuem notas numéricas ou nota geral com evidência insuficiente. Também não foram estabelecidos hashes ou equivalência da publicação nem realizado pentest nela.

A biblioteca XLSX local identificada informa 0.20.3, não se deve repetir automaticamente o achado antigo sobre 0.18.5. Os caminhos PDF.js usam `isEvalSupported:false` (`22-...js:22`, `23-...js:100`); eficácia completa da mitigação não foi testada. O app pode transmitir fotos e referência ao imgbb quando configurado (`23-fotos...js:2-5,19-27`) e carrega PDF.js do cdnjs. SaaS é análise consultiva: Auth, RLS, multi-tenant, migração e isolamento exigem validação própria; uma reescrita integral não está demonstrada como necessária.

## Plano de trabalho e veredito provisório

Onda 0: nenhuma falha P0 demonstrada nesta rodada. Onda 1: reproduzir e corrigir AUD-A-001, AUD-D-001 e AUD-K-001, com testes de falha e concorrência; executar suíte em ambiente funcional. Onda 2: corrigir acessibilidade e teste de renumeração, e medir desempenho e celular. Onda 3: melhorias de manutenção após caracterização. Aceite de cada onda depende de testes reproduzíveis e ausência de regressões; esforço e risco devem ser estimados após reprodução.

Não é possível afirmar segurança para dados comerciais importantes, ausência de perda silenciosa, confiabilidade geral de cálculos, integridade de todos os formatos, suporte a volume intenso, ausência de vulnerabilidades ou suficiência da suíte. Há risco de recuperação demonstrado por análise condicional e corrida provável; os cálculos conferidos na interação preliminar não validam todos os cenários. Primeiro passo recomendado: assegurar backup restaurável e uma linha de base de testes confiável, seguido da reprodução da corrida de exportação. Dez riscos priorizados e painel numérico não são apresentados como concluídos porque faltam investigação e medições suficientes.

## Continuação da auditoria — execução da suíte e reproduções isoladas

Em continuação à primeira rodada, instalou-se Playwright Python em diretório temporário e executou-se a suíte em cópia isolada usando Edge, sem CP_BACKUP. Resultado final do agregador: **40 scripts reportados OK, 1 ignorado (t18), Falhas: 0**, código de saída 0. A rodada anterior com 38 erros de infraestrutura permanece registrada como histórico; não representa o resultado desta nova rodada. O tempo exato não foi medido. O defeito AUD-K-001 limita a confiança no resultado agregado; não se verificou independentemente o código de saída de cada subprocesso. A suíte não cobre integralmente os cenários abaixo.

### AUD-C-001 — Linha com quantidade e preço pode ser omitida sem alerta

**P1; confirmado na lógica isolada; teste ponta a ponta pendente.** Em `src/js/30-eventos-mouse-e-clique.js:290-293`, uma linha sem descrição só é registrada como erro quando há código e quantidade positiva. Exemplo sintético com cabeçalhos Descrição, Quantidade, Preço: `[Brinco, 1, 10]` e `[vazio, 2, 20]`, sem coluna de código. Execução em Node do trecho extraído retornou apenas a primeira linha, com listas de erro e zero vazias. O fluxo informa a contagem aceita, mas não identifica a linha omitida; a prévia é limitada às primeiras quatro (`21-edicao-em-lote-e-revisao.js:147,152`). Revisão independente confirmou a condição. Impacto potencial: importar quantidade e valor incompletos, com risco comercial; frequência não medida. A linha não é recuperável pelo fluxo já importado sem retornar à fonte. Sugere-se sinalizar linhas não vazias sem descrição e exigir correção ou decisão explícita; testar linhas após a prévia, com e sem código, quantidades inválidas e reconciliação de totais. Aceite: nenhuma linha com dados comerciais relevantes é descartada sem identificação e decisão do usuário. A mudança deve preservar tratamento de linhas efetivamente vazias e cabeçalhos.

### Complemento de AUD-A-001

Um agente executou a função real de backup extraída em Node com dependências simuladas e um romaneio sintético contendo texto de 151 MiB. O arquivo leve gerado mediu **158.335.046 bytes**, acima do limite de **157.286.400 bytes**, e a mensagem informava que o backup leve fora salvo. A verificação do código da restauração rejeita arquivos acima do limite. A revisão independente confirmou o mecanismo condicional. O ensaio não exercitou IndexedDB, imagem válida nem interface; não se demonstrou que esse romaneio específico possa ser criado no fluxo normal. O risco também depende do volume acumulado de dados mantidos no backup. Não significa que todos os backups leves sejam inválidos.

### Complemento de publicação e segurança

A biblioteca `lib/xlsx.full.min.js` e a cópia em `publicar-netlify/lib/` têm SHA-256 `cc015130aa8521e7f088f88898eba949ccdcbfb38df0bd129b44b7273c3a6f41`, em acordo com o arquivo de documentação local; isso não comprova o conteúdo remoto. O texto local sobre fallback CDN da biblioteca parece obsoleto: não foi encontrada referência correspondente no código examinado. Os limites dimensionais de planilha são aplicados após a leitura pelo parser, portanto não comprovam proteção contra todo consumo de recursos durante o parsing.

### Limitações ao final da segunda rodada

A tentativa de abrir a cópia servida localmente no navegador da ferramenta terminou em timeout; o sandbox também recusou conexão local. Não foram concluídos testes visuais nos dois viewports exigidos, carga de 1.000/5.000/20.000 linhas, ciclos completos de backup/restauração com imagens, concorrência de exportação pela interface, comparação da versão publicada com a local ou inventário Git. A auditoria permanece parcial e nenhuma nota geral confiável foi atribuída. A primeira onda recomendada inclui AUD-C-001 junto com backup, exportação concorrente e confiabilidade do agregador; priorização definitiva depende de reprodução completa e do volume real de uso.

## Continuação — validação dinâmica e publicação

AUD-C-001 foi reproduzido pela interface em cópia local, com CSV sintético `Descrição;Quantidade;Preço`, linha `Brinco teste;1;10` e linha `;2;20`. A prévia mostrou as duas linhas, incluindo “sem descrição”; após “Usar estas colunas”, o romaneio exibiu “1 peças lidas” e “1 linhas · 1 peças”, sem aviso de descarte da segunda. A classificação é CONFIRMADO também pela interface. A prévia expõe o problema se o usuário examinar essa linha, mas não oferece alerta específico posterior; linhas além das primeiras quatro não aparecem nessa prévia. Revisão independente confirmou a lógica.

Teste isolado de persistência: uma peça bruta sintética gerou duas linhas e ambas permaneceram após recarregamento; um backup completo de 9.404 bytes foi baixado. Isso não comprova restauração nem concorrência. A referência Git local lida em metadados é `43c04fd23869d8c3aa4186801c265b5e23ad4e87`, branch main; estado de trabalho e conteúdo versionado continuam não verificados porque Git não conseguiu acessar o diretório pai.

A página pública retornou HTTP 200. O HTML obtido, convertido da resposta UTF-8, tinha 611.322 bytes e identificador de geração `6af1af067167`; `publicar-netlify/index.html` tinha 612.962 bytes e identificador `6af1bcc44953`. Não se comprova equivalência entre os artefatos; identificadores diferentes não demonstram por si só diferença funcional. A inspeção foi somente leitura.

Em cópia local, verificou-se visualmente 375×812 e 768×1024. Em 375×812, Cadastros abriu e rolou até os campos de galvânica; a barra inferior permaneceu visível. Em 768×1024 a tabela apareceu com rolagem horizontal. Não foram verificados teclado virtual, orientação, contraste completo, todas as janelas ou aparelhos físicos; não se declara conformidade responsiva integral.

O processo de publicação usa `npx --yes terser` sem versão fixada (`tools/publicar.py:39-49`), o que prejudica reprodutibilidade; não foi executado. `t42.py` depende de texto de falha para comunicação ao agregador e `t43.py` contém verificações de presença de fonte além de verificações comportamentais. A virtualização é aplicada à visão de planilha, enquanto a visão de cartões constrói todos os cartões e procura a peça para cada linha (`src/js/15-planilha.js:55-62,73-74,135`). `gerar` usa `list.indexOf` por grupo (`src/js/12-motor-linhas.js:16-23`); são riscos de crescimento de custo, não prova isolada de travamento.

### Recuperação sintética e carga

O backup sintético de 9.404 bytes foi restaurado em outro contexto Edge isolado. Antes havia outra peça sintética; o diálogo informou substituição de uma peça por outra. Após confirmação, as duas linhas da peça do backup apareceram, as linhas da outra peça desapareceram e esse resultado persistiu após reload. Escopo: uma peça bruta; sem fotos, romaneios ou tabelas salvas. Isso substitui a nota anterior que dizia que a restauração não estava verificada, apenas para esse cenário restrito.

**AUD-J-001 — P2, confirmado em uma medição, confiança baixa:** em Edge headless local, perfil novo e dados sintéticos, adicionar 1.000 peças prontas pelo painel de várias linhas levou 46,89 s entre o clique de adicionar e o retorno, com toast de 1.000 adicionadas. Uma tentativa de 5.000 permaneceu mais de 20 s no clique e foi interrompida preventivamente (cerca de 70 s desde o início total); não há tempo final nem confirmação de persistência da tentativa. O cenário 20.000 não foi executado devido ao custo observado. Não se mediu memória nem se confirma que as 1.000 persistiram após recarga nessa medição. Repetir em dispositivos representativos, medir separadamente geração, renderização e persistência e definir meta de interação com o usuário. `12-motor-linhas.js:16-23` e `15-planilha.js:55-62,73-74,135` são pontos de investigação, não prova de causa única. A interrupção do ensaio não estabelece capacidade máxima.

O ciclo criação → reload em outra sessão também preservou a descrição de uma peça sintética. A etapa de download XLSX desse roteiro não concluiu dentro do tempo observado, portanto não foi validado o ciclo completo por esse ensaio. O teste t40 da suíte foi reportado OK e inclui reabertura de XLSX, mas o defeito conhecido do agregador recomenda validação independente do retorno.

### Ciclos comerciais, abas e dependências

Em outro ambiente Edge isolado, uma peça bruta sintética (peso 2,5; compra R$ 10; ouro quantidade 3 e varejo R$ 50; prata quantidade 2 e varejo R$ 45) foi criada, recarregada e exportada para XLSX; o arquivo foi reaberto com SheetJS. As duas linhas preservaram referência, descrição, peso, compra, preço e quantidade; banho ouro R$ 3,75, prata R$ 3,85, verniz R$ 1,05 e insumos R$ 0,50 correspondiam aos parâmetros. Este ensaio substitui a tentativa anterior inconclusiva de download apenas para esse caso e não valida todos os modelos nem importação anterior.

Em duas abas do mesmo contexto sintético, A lançou uma peça e B exibiu aviso de que outra aba alterara dados e que B parara de salvar. Ao lançar em B, o estado ainda informava “NÃO está salvando”; após recarregar A, sua peça estava presente e a de B não havia persistido. Proteção básica confirmada nesse cenário, sem cobrir janela de espera assíncrona nem opção “Manter esta aba”.

A medição de carga usou Windows, Edge 157.0.4341.42, processador AMD Ryzen 5 5600X com 12 processadores lógicos, viewport 1400×900; memória não foi medida. O aviso oficial do [PDF.js](https://github.com/mozilla/pdf.js/security/advisories/GHSA-wgrm-67xf-hhpq) identifica versões vulneráveis até 4.1.392 e indica desabilitar `isEvalSupported` como mitigação, configuração observada nos dois pontos locais. Os avisos [SheetJS sobre poluição de protótipo](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6) e [sobre ReDoS](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9) indicam intervalos anteriores a 0.19.3 e 0.20.2, respectivamente; a cópia local identificada como 0.20.3 está fora desses intervalos. Não se conclui ausência de outras vulnerabilidades. A proteção CSV cobre prefixos específicos (`28-exportar.js:33,37,41`); espaços ou LF antes de prefixos exigem teste no aplicativo destinatário, não constituem vulnerabilidade demonstrada nesta auditoria.

### Foto e entradas numéricas

Em cópia local isolada, com solicitações ao imgbb bloqueadas, um PNG sintético foi anexado a uma peça bruta e o backup continha um lançamento e duas chaves de fotos. Após restaurar em outro contexto e recarregar, as duas linhas e duas imagens apareceram. Não foi comparada a identidade binária do original nem testado volume de fotos; romaneios e tabelas salvas seguem em investigação.

Em cenários sintéticos isolados, os valores de custo reabertos no XLSX foram: `0`→0; `0,01`→0,01; `1,005`→1,01; `1.500`→1,50; `1.500,25`→1500,25; `1500.25`→1500,25. `-1` foi bloqueado com mensagem de custo negativo e `abc` não gerou linhas. O parser trata ponto único como decimal (`src/js/11-utilidades.js:6`); `1.500` é ambíguo para quem usa ponto como separador de milhares, e não foi identificada explicação dessa convenção junto ao campo (`src/js/17-lancamento.js:1-12`). Risco comercial condicionado à intenção de digitar R$ 1.500,00; não se pode afirmar que a interpretação do usuário neste experimento fosse outra. Avaliar explicação e validação para entradas ambíguas e incluir teste de aceite com formatos locais.

**AUD-B-001 — P1, CONFIRMADO sob a condição de entrada ambígua.** Uma revisão independente confirmou que `num('1.500')` resulta em 1,5 (`src/js/11-utilidades.js:6-11`), e o campo de custo não explica a regra na construção inspecionada (`src/js/17-lancamento.js:12,73`). Reprodução: digitar `1.500` em Custo de Compra, criar e exportar; o XLSX reaberto contém 1,50. Para o usuário que pretendia mil e quinhentos reais, há diferença material; o valor formatado na tabela oferece oportunidade de detecção e a intenção não é inferível. Não é falha aritmética universal: um ponto pode significar decimal. A correção sugerida é comunicar a convenção e solicitar esclarecimento para entrada ambígua, preservando formatos decimais já usados; testar `1.500`, `1.500,25`, `1500.25` e `1,005` no formulário e arquivo. Aceite: entradas ambíguas não são aceitas sem informação ou confirmação clara, e valores inequívocos permanecem corretos. Mudança na interpretação pode alterar fluxos existentes; exige testes de regressão. Frequência não medida; recuperação por edição ou reimportação quando o erro for identificado.

### Romaneios e tabelas no backup

Teste em Edge local isolado com `rom_amostra.txt` sintético: o romaneio produziu oito cartões; após criar uma peça e salvar tabela “HISTORICO SINTETICO”, o backup continha um romaneio e uma tabela. A restauração em outro contexto informou uma peça, um romaneio e uma tabela; após recarga, o histórico mostrava a tabela, a lista indicava oito itens e a reabertura apresentou oito cartões. Não houve comparação campo a campo ou restauração da tabela histórica para a área de trabalho. Dados e scripts de evidência são sintéticos, na pasta privada `persist-test` do workspace de visualizações.

### AUD-K-003 — Verificação incompleta dos custos no XLSX em t40

**P2, CONFIRMADO por leitura de código.** `tests/t40.py:75-81` percorre as linhas do arquivo e calcula `pr`, mas não compara esse valor com a expectativa; `dif` também não é usado nesse trecho. A asserção verifica somente quantidade de linhas e preços de varejo vazios. Embora a tabela seja comparada antes com um cálculo independente, o teste não demonstra a igualdade dos custos exportados que o comentário anuncia. Uma regressão restrita aos custos do XLSX pode passar. Recomendação: reabrir o arquivo, calcular ou inspecionar cada fórmula e comparar os campos relevantes com resultados independentes; incluir uma mutação controlada de teste para confirmar que a asserção detecta divergências. O cenário XLSX específico testado separadamente nesta auditoria reduz a lacuna apenas para os valores utilizados nele.

## Continuação — comparação de históricos e segurança

Após restaurar e recarregar o cenário de um romaneio de oito cartões e uma tabela, foi baixado um segundo backup sintético. A comparação das estruturas JSON completas `roms` e `tabs` foi igual entre os dois arquivos. A comparação de `innerText` dos cartões retornou diferente, mas a diferença não foi isolada, e esse método não compara valores de inputs; não se caracteriza corrupção nem equivalência visual. A janela de concorrência durante espera assíncrona não foi reproduzida.

Em Edge local isolado, uma descrição literal `<img src=x onerror=alert(1)>` apareceu como texto e não criou elemento `img[src=x]`. Uma descrição `=1+1` foi reaberta no XLSX como célula de tipo texto, e no CSV saiu prefixada por apóstrofo. Em outro ensaio, o CSV Bling incluiu pai e variações com custos e quantidades observados; não foi importado no Bling real. Estes ensaios confirmam proteção desses casos específicos, não garantem ausência geral de XSS ou injeção em outros campos, prefixos e leitores. A análise independente confirmou ainda que `tests/t40.py:75-81` não compara `pr` com o valor esperado no XLSX (AUD-K-003).

Ampliação isolada do CSV Bling, com arquivo reaberto via SheetJS: descrições de produto pai `=1+1`, `+SOMA(1;2)`, `-ABC` e `@teste` saíram com apóstrofo inicial; `Joia, "azul" ç` preservou vírgula, aspas e acento. A importação pelo Bling real não foi testada. Em outro ensaio `-1+1` saiu protegido e uma entrada inicial com espaço foi normalizada e protegida; uma quebra de linha inicial foi transformada em espaço pelo campo HTML. Esses testes não cobrem todos os campos ou leitores, e o apóstrofo é parte dos dados lidos no CSV.

Ciclo sintético completo adicional: importou-se CSV com uma linha válida e a linha sem descrição já identificada em AUD-C-001; a linha válida foi lançada, editada de peso 2 para 8, recarregada e exportada. O XLSX reaberto mostrou BR1670A, descrição esperada, peso 8, compra 10 e quantidade 1; BR1670B tinha peso 8, compra 10 e quantidade vazia na divisão de uma unidade. A linha sem descrição não apareceu, consistente com o defeito já registrado. O resultado não demonstra integridade de todos os modelos ou condições.

### AUD-A-002 — Migração pode vincular grades independentes

**P1, PROVÁVEL quanto ao impacto comercial; mecanismo confirmado por leitura e mudança de configuração observada em ambiente isolado.** Em configuração antiga sem marcador v14, `src/js/14-persistencia.js:117-118` vincula uma grade à primeira categoria de anel quando os nomes dos itens coincidem. A comparação não comprova equivalência de IDs, letras ou demais atributos. `src/js/11-utilidades.js:30,71` passa a usar itens e atributos da grade fonte, com possíveis consequências para seleções armazenadas por ID. No cenário sintético, a grade de Prata 925 passou a ter `usa: "Anél"` e a opção independente desapareceu após ciclo de backup/restauração; repetiu-se com wrapper UTF-8 correto. Uma revisão independente confirmou a lógica. Ainda não se isolou se a mudança ocorre na restauração ou em recarga normal, nem se demonstrou perda de uma seleção ou erro de exportação; a existência de `usaId` válido pode alterar o caminho. O efeito depende de configuração antiga com grades iguais por nome mas independentes. Recomenda-se caracterizar os atributos antes de vincular e preservar IDs ou pedir decisão explícita; testar grades com nomes iguais e letras/IDs diferentes, recarga, restauração, mudança posterior e exportação. Aceite: migração preserva comportamento e seleções de cada categoria, ou comunica mudança e exige escolha. Frequência e recuperação dependem de configuração e backup; uma mudança nessa migração pode afetar usuários já migrados.

No teste subsequente de AUD-A-002 com wrapper UTF-8, bastou criar uma peça e recarregar: `Prata 925.grade.usa` passou de ausente para `Anél` e o marcador v14 passou a true. Portanto a migração não é exclusiva de restauração. Após isso, alterar pela interface a primeira opção da grade Anél de 11 para 99 foi confirmado no backup, mantendo o vínculo da Prata 925. O efeito na seleção de Prata 925 continua inferência do código: uma tentativa de observá-lo no formulário não mostrou 99, sem causa identificada. Não se afirma perda de seleção ou exportação incorreta. Os testes anteriores que serviram o fragmento HTML sem charset têm limitação de codificação; a repetição citada acima usou wrapper correto.

## Continuação — falhas de restauração e concorrência (análise inicial; reproduções posteriores abaixo)

**AUD-A-003 — P1, PROVÁVEL quanto ao estado parcial; mecanismo confirmado por código e revisão independente.** Atualização do achado A07 da auditoria SaaS anterior, não uma causa nova: `src/js/20-armazenamento-idb.js:143-145` ignora exceções ao reverter localStorage e não verifica os retornos de `idbDel`/`idbPut`. Se uma restauração parcial falhar e a compensação também falhar, as mensagens em `:152,157,163` ainda afirmam que nada mudou ou que tudo voltou. Não houve reprodução da dupla falha; a existência de dados parciais depende das operações e da persistência da falha. A solução deve verificar cada compensação e comunicar estado incerto, além de prever recuperação; testar falha de gravação após uma operação bem-sucedida, falha do rollback e interrupção. Aceite: nenhuma mensagem assegura reversão integral sem verificar os armazenamentos; estado remanescente e recuperação são informados. Risco de intervenção: afetar restauração de fotos e históricos.

Em ensaio Node VM isolado, funções reais de `28-exportar.js` foram executadas com dependências simuladas: o texto de copiar foi construído, a promessa do clipboard permaneceu pendente enquanto configuração mudou, e a assinatura capturada depois permitiu limpar a peça. Isso reforça AUD-D-001 no caminho de cópia, sem comprovar que o usuário consiga alterar a configuração durante a promessa real ou que o cenário ocorra na UI. Continua PROVÁVEL para impacto operacional.

**AUD-A-004 — P1, PROVÁVEL; efeito não reproduzido.** `src/js/20-armazenamento-idb.js:10-11,164-167` ignora o retorno de `romIndex` ao salvar ou restaurar romaneios. `gravarIdx` retorna falso quando localStorage falha (`src/js/19d-tabelas-salvas.js:7-11`), enquanto o registro pode ter sido gravado no IndexedDB e o índice em memória atualizado. Após reinício, se a gravação do índice falhou, o histórico pode não mostrar o romaneio; uma revisão independente não encontrou reconstrução equivalente à varredura de tabelas `tabsMigrar` (`19d:27-33`). Não se afirma destruição física: o backup varre chaves do banco. A falha de índice tem de ocorrer após a gravação principal; frequência desconhecida. Testar em ambiente isolado com falha específica de escrita `cadpecas-roms`, recarga e recuperação; comparar IDB e interface. Aceite: falha de índice não produz sucesso incondicional e registros gravados podem ser redescobertos. Corrigir deve preservar exclusões intencionais e sincronização entre abas.

A revisão de acessibilidade também identificou suporte existente a setas, Home e End nas abas (`32-eventos-entrada-teclado-e-arrasto.js:31`) e contenção de foco em modais registrados (`33-janelas-busca-e-paleta.js:15-26`); isso não substitui testes completos por teclado e leitor de tela.

A nova tentativa de obter estado Git ampliado não foi executada: revisão automática atingiu limite de uso. A referência local lida antes continua sem comprovação do estado de trabalho.

### Reprodução adicional de AUD-A-003

A função original `aplicarBackupTotal` foi extraída e executada em Node VM com armazenamento simulado: a gravação `roms:um` teve sucesso; a segunda gravação retornou falha; o `idbDel` compensatório também falhou. O registro `roms:um` permaneceu e o toast declarou “Backup NÃO restaurado — memória do navegador cheia. Nada foi alterado.” O mecanismo e mensagem enganosa estão **CONFIRMADOS em ensaio controlado** sob falhas encadeadas. Não se exercitou IndexedDB real, nem se demonstrou perda de dados preexistentes ou frequência dessa condição.

### Reprodução adicional de AUD-A-004

Ensaio Node VM com funções reais `romRec`, `romIndex`, `romGravarBig` e `gravarIdx`, com armazenamento simulado: `idbPut` teve sucesso e a gravação de `cadpecas-roms` foi recusada. A promessa retornou sucesso, o registro continuou no banco simulado, mas o índice persistido ficou vazio e a leitura equivalente à inicialização retornou zero registros. O mecanismo está **CONFIRMADO no cenário simulado**; não foi usada falha real de IndexedDB/localStorage ou interface, e não se demonstrou destruição do registro. A causa concreta e frequência da falha de índice não foram medidas.

### Nota fiscal — cenários a validar

A revisão identificou duas hipóteses que não foram classificadas como falhas confirmadas. Em `src/js/23-fotos-imgbb-e-nota-fiscal.js:166,191-204`, custo líquido é arredondado por unidade; por exemplo, três unidades com total líquido de R$ 1,00 podem gerar 3 × R$ 0,33 = R$ 0,99. O resumo exibe o custo calculado e o valor da nota, mas não há comparação explícita dessa diferença. É preciso definir a regra comercial de rateio e reproduzir pela interface antes de concluir que o comportamento é incorreto. Também há hipótese de uma linha selecionada de quantidade zero ser contada em uma conferência embora não gere linha (`:191-196,206-209,254`); a interface avisa sobre quantidade ausente e mostra o resumo. O texto final e as condições ainda precisam de reprodução; não se afirma omissão sem qualquer aviso.

## Continuação — conferência de nota fiscal (ensaio inicial; interface posteriormente testada)

**AUD-C-002 — P2, CONFIRMADO em ensaio de funções extraídas; interface completa não exercitada.** Em `src/js/23-fotos-imgbb-e-nota-fiscal.js:191-196,254-255`, a quantidade zero impede geração de linha, mas a mensagem de conferência conta os itens marcados na nota e compara a soma original. Com dois itens marcados, um deles de quantidade zero, um ensaio Node VM das funções originais gerou uma linha e mensagem “✓ 2 itens conferem com a nota”. A prévia indica “sem quantidade”, o resumo informa número de peças e a mensagem final informa uma peça: há pistas, mas a marca de conferência pode sugerir reconciliação dos itens importados. Revisão independente confirmou o mecanismo. Recomenda-se diferenciar explicitamente conferência dos totais originais e reconciliação das linhas geradas; teste deve incluir itens zero, excluídos e fracionários. Aceite: o usuário vê quais itens não geraram linhas e nenhum selo sugere equivalência que não foi verificada.

No ensaio separado, 3 unidades e total líquido R$ 1,00 resultaram em custo unitário R$ 0,33 e total R$ 0,99; o resumo exibe os dois totais. A diferença de um centavo é confirmada nas funções, mas não se classifica como defeito sem regra de rateio acordada e teste de interface. Uma política de arredondamento pode tornar essa diferença esperada.


### AUD-A-002 — impacto em seleção ensaiado isoladamente

Com `effGrade` original em Node VM e dados sintéticos, uma grade Anél tinha item `id=a11`, nome 11 e letra A; Prata 925 tinha item `id=p11`, mesmo nome e letra P, com seleção `gsel=[p11]`. Antes do vínculo o item era selecionado; após aplicar manualmente `usa=Anél` simulando a migração, `effGrade` retornou `a11` e o filtro por ID em `itensGrade` resultou vazio. Isso confirma o mecanismo condicional de impacto, não uma perda persistida nem um teste ponta a ponta de migração. O cenário real depende de configuração antiga e IDs diferentes; a reprodução de alteração pela interface ainda está pendente.

### AUD-A-005 — Lembrete registra backup inadequado como recente

**P1, CONFIRMADO por código; frequência não medida.** `src/js/20-armazenamento-idb.js:51` grava `cadpecas-bk-em` antes de verificar `falhas.length` ou o tamanho excessivo do backup completo. `src/js/33-janelas-busca-e-paleta.js:29-32` usa essa data para lembrar de backup completo depois de sete dias. Assim um arquivo identificado como incompleto ou grande demais para restauração pode adiar o lembrete; a interface exibe aviso específico sobre essas condições, que não deve ser omitido na interpretação. A versão leve também registra data, mas a política desejada para ela depende da definição de backup completo. Corrigir registrando sucesso completo/restaurável em estado distinto e preservando avisos; testar leitura IDB falha, limite excedido, versão leve e backup íntegro. Aceite: arquivo reconhecidamente incompleto ou recusável não satisfaz o lembrete de backup completo. A existência de outro backup válido anterior depende do usuário.

**Risco operacional relacionado, PROVÁVEL:** em `tools/publicar.py:31-33`, `DL.save` resolve ao acionar o link sem verificar término do download. O código pode marcar a data e informar sucesso mesmo se o navegador bloquear ou cancelar o salvamento. O comportamento concreto sob bloqueio não foi reproduzido, e navegadores não necessariamente oferecem confirmação de gravação à página. Não afirmar que downloads normais falham; rever a mensagem e mecanismo conforme a capacidade do navegador.

## Índice atualizado de achados

Esta tabela consolida os IDs; detalhes e limites estão nas seções abaixo. “Simulado” indica execução de funções reais com dependências controladas, não teste completo de navegador.

| ID | Frente | Prioridade | Certeza | Evidência principal | Impacto | Ação sugerida | Esforço estimado |
|---|---|---|---|---|---|---|---|
| AUD-A-001 | A | P1 | Confirmado em simulação, condicionado a volume | `20-armazenamento-idb.js:47-51,137` | Cópia leve acima do limite recusada | Revalidar tamanho e garantir cópia restaurável | M |
| AUD-A-002 | A | P1 | Confirmado em interface com controle sintético | `14-persistencia.js:117-118`; `11-utilidades.js:30,71` | Grade independente pode mudar seleção | Preservar IDs e equivalência semântica | M |
| AUD-A-003 | A | P1 | Confirmado na interface com falhas injetadas | `20-armazenamento-idb.js:143-157,162-163` | Rollback falho com mensagem de reversão total | Verificar compensações e informar estado incerto | G |
| AUD-A-004 | A | P1 | Confirmado na interface com falha injetada | `20-armazenamento-idb.js:8-11,164`; `19d-tabelas-salvas.js:7-11` | Romaneio no banco pode não aparecer no histórico | Validar índice e recuperar registros órfãos | M |
| AUD-A-005 | A | P1 | Confirmado por código | `20-armazenamento-idb.js:51`; `33-janelas-busca-e-paleta.js:29-32` | Arquivo inadequado adia lembrete | Registrar sucesso completo separadamente | P |
| AUD-A-009 | A | P1 | Confirmado na interface com backup sintético marcado | `20-armazenamento-idb.js:113-139,167` | Marcador de backup incompleto não é alertado ao restaurar | Avisar e exigir decisão informada | P–M |
| AUD-A-008 | A | P1 | Confirmado na interface com falha injetada | `27-fotos-escolher-colar.js:166-175`; `14-persistencia.js:65-67` | Exclusão prossegue sem ponto prometido | Confirmar gravação ou avisar e pedir decisão | M |
| AUD-A-007 | A | P1 | Confirmado na interface; revisão independente | `15-planilha.js:183-190` | Alteração não salva de outra variação é descartada | Sincronizar apenas a variação afetada | M |
| AUD-A-006 | A | P1 | Confirmado em interface sob falhas injetadas | `14-persistencia.js:27-32,40-55` | Fechamento durante gravação pendente pode perder lançamento | Rastrear gravações pendentes e avisar | M |
| AUD-B-001 | B | P1 | Confirmado; impacto depende da intenção | `11-utilidades.js:6-11`, XLSX reaberto | 1.500 pode ser entendido como R$ 1,50 | Esclarecer/confirmar entrada ambígua | M |
| AUD-C-001 | C | P1 | Confirmado pela interface isolada | `30-eventos-mouse-e-clique.js:290-293` | Linha com valores omitida sem aviso específico | Identificar linhas não vazias omitidas | M |
| AUD-C-004 | C | P1 | Confirmado na interface e revisão independente | `21-edicao-em-lote-e-revisao.js:140-141` | CSV ponto e vírgula pode multiplicar preço por 100 e remover zeros | Preservar texto e converter com locale explícito | M |
| AUD-C-003 | C | P1 | Confirmado na interface sintética; revisão independente | `19c-colar-romaneio.js:30-31,48` | Leitura limitada a 3.000 pode omitir linha sem alerta específico | Detectar excesso e informar ou bloquear | M |
| AUD-C-002 | C | P2 | Confirmado na interface com XML sintético | `23-fotos-imgbb-e-nota-fiscal.js:191-196,254` | Selo de conferência pode ser confundido com importação integral | Distinguir totais da nota e linhas geradas | P |
| AUD-D-001 | D | P1 | Confirmado na interface com atraso injetado | `28-exportar.js:78-100` | Alteração durante cópia pode permitir limpeza de peças | Snapshot e assinatura no mesmo instante | M |
| AUD-F-001 | F | P2 | Confirmado em regex isolado, cenário patológico | `19c-colar-romaneio.js:4-10` | Leitura pode consumir tempo excessivo | Validar padrão e limitar trabalho | M |
| AUD-I-001 | I | P2 | Confirmado por navegação com Tab | `15-planilha.js:61-65,124` | Foto inacessível por teclado; controles aninhados | Controles semânticos separados | M |
| AUD-J-001 | J | P2 | Confirmado em duas medições; confiança baixa | Ensaio local de 1.000: 46,89 s | Espera longa em lote | Medir gargalos e otimizar incrementalmente | G |
| AUD-K-001 | K | P1 | Confirmado por código | `tests/run_all.py:25-26` | Subprocesso com erro pode aparecer OK | Falhar para qualquer retorno não zero | P |
| AUD-K-002 | K | P2 | Confirmado por código | `tests/t44.py:39` | Teste não valida renumeração | Comparar sequência esperada | P |
| AUD-K-003 | K | P2 | Confirmado por código | `tests/t40.py:75-81` | Teste não compara custos no XLSX | Comparar fórmulas e valores esperados | M |

Hipóteses não verificadas incluem ordem de entrega do evento `storage` perante conclusão de gravação e bloqueio de download na publicação. Fechamento durante espera assíncrona foi reproduzido sob quota e atraso injetados conforme AUD-A-006. `flush` limpa `dirty` antes de esperas (`14-persistencia.js:40-41`), enquanto `beforeunload` considera `dirty`, conflito e corrupção (`:31-32`); impacto de encerramento foi demonstrado sob condições injetadas; sua frequência depende do navegador e do ambiente. O caminho local síncrono não deve ser generalizado a partir dessa hipótese. Não foi encontrado teste explicitamente dedicado a NF-e na busca por nomes e funções; isso não prova ausência de cobertura indireta.

## Atualização da linha de base Git

Após a revisão de acesso voltar a funcionar, `git status --short` no repositório pai mostrou apenas itens não rastreados, incluindo relatórios/documentação, `.claude/`, `founder/`, `tools/comprimir_fotos.py` e artefatos temporários de auditoria; `git diff --stat` não mostrou alteração em arquivos rastreados. A referência HEAD é `43c04fd23869d8c3aa4186801c265b5e23ad4e87`. `versao-organizada/publicar-netlify/` e `marcas-dagua.csv` aparecem como ignorados. O relatório desta auditoria é não rastreado. Isso substitui a limitação anterior referente ao estado Git; não garante que todos os arquivos ignorados ou não rastreados foram revisados quanto a conteúdo sensível.

## Atualização — testes de interface e Git

AUD-A-003 foi reproduzido em Edge local, em cópia sintética, com falhas injetadas nos protótipos IndexedDB sem acesso ao IIFE: o primeiro `put` de romaneio ocorreu, o `put` de tabela e os `delete` compensatórios falharam. A interface declarou “Backup NÃO restaurado — memória do navegador cheia. Nada foi alterado.” Uma leitura somente de observação do IndexedDB encontrou uma chave de romaneio. A mensagem falsa e o resíduo estão confirmados na interface sob falhas artificiais; frequência e perda de dados anteriores não foram demonstradas. Evidência sintética: `persist-test/rollback_ui.py` no workspace privado de visualizações.

AUD-C-002 foi reproduzido em Edge local usando XML sintético: dois itens selecionados, um com quantidade 1 e outro com quantidade 0. A prévia avisou “sem quantidade”, mostrou “1 peça · 1 unidade” e botão “Importar 1 peça”; após importar, apareceu “1 peça importada” e simultaneamente “✓ 2 itens conferem com a nota”. Confirma-se a redação potencialmente ambígua, com os avisos que a acompanham. No cenário de três unidades e R$ 1,00, a UI mostrou custo de R$ 0,99 e nota de R$ 1,00; a diferença foi visível e não se classifica como defeito sem regra de rateio.

AUD-A-004 também foi reproduzido em Edge local isolado, com `QuotaExceededError` injetado especificamente em `Storage.prototype.setItem` para `cadpecas-roms`: um romaneio sintético de oito cartões foi lido, fechado e a página recarregada. A leitura do IndexedDB encontrou a chave do romaneio, enquanto o histórico informava “Nenhum romaneio salvo ainda.” A falha seletiva foi injetada duas vezes; o estado de mensagem de salvamento não foi observado durante toda a sessão. O ensaio confirma indisponibilidade no histórico sob essa condição, sem demonstrar perda física ou frequência. Evidência: `persist-test/indice_ui.py` no workspace privado.

Medição independente adicional de AUD-J-001: Edge 157 headless, arquivo local isolado e perfil limpo; 1.000 peças prontas via “Várias linhas” levaram 45.602 ms do clique até conclusão, após 306 ms de preparação do painel. O toast confirmou 1.000; após recarga, totais visíveis mostraram 1.000 peças, compra R$ 2.000, insumos R$ 500 e custo R$ 2.500. Essa é uma segunda medição próxima da anterior, não comparação campo a campo. Na nova tentativa de 5.000, o preenchimento automatizado excedeu 15 segundos e o clique não foi alcançado. O teste de 20.000 não foi iniciado por cautela após instabilidade no menor cenário; isso é uma limitação e não demonstra o resultado em 20.000; não se estabelece teto de capacidade.



### AUD-D-001 — reprodução pela interface

Teste repetido duas vezes em Edge local isolado com API de clipboard artificialmente atrasada por 12 segundos, sem acesso ao IIFE. Uma peça bruta gerou duas linhas. Durante a cópia pendente, alterou-se o custo de insumos padrão de R$ 0,50 para R$ 7,00 e confirmou-se o campo com Tab. O texto copiado manteve R$ 0,50; a tabela passou a mostrar R$ 7,00. Após concluir a cópia, “gravar e limpar” removeu ambas as linhas sem alerta de configuração alterada. **Certeza: CONFIRMADO nessas condições de interface com atraso injetado**; frequência com clipboard normal desconhecida. O valor copiado está disponível, mas o estado corrente é limpo. Evidência privada: `conc-test/race_verify.py`. O ensaio reforça a necessidade de capturar a assinatura da configuração antes da espera e recusar limpeza quando houver mudança, com teste de regressão para cópia e download.


### AUD-A-006 — Fechamento durante gravação pendente

**P1, CONFIRMADO na interface sob falhas artificialmente injetadas; frequência desconhecida.** `src/js/14-persistencia.js:40-41` zera `dirty` antes de concluir gravação; após erro de quota, aguarda `guardarMinis()` antes de restaurar o indicador (`:51-55`). O aviso de `beforeunload` consulta esse indicador e outras condições, mas não a promessa em curso (`:27-32`). Em Edge local isolado, uma peça sintética com foto foi adicionada, `localStorage.setItem` para `cadpecas4` recebeu erro de quota e `indexedDB.open` foi mantido pendente por instrumentação. Após 1,4 s a tela dizia “Salvando…”; a aba fechou sem diálogo detectado e, em nova aba, a peça não apareceu. A sequência foi repetida. Uma revisão independente confirmou a relação de código. A espera indefinida é artificial e extrema; não extrapolar frequência nem o caminho local normal. A perda afeta dados ainda não confirmados e recuperação depende de outra cópia. Recomenda-se rastrear operação pendente até confirmação ou falha e avisar adequadamente ao sair; testar também promessas lentas que terminam, rejeições, quota, conta e fechamento móvel. Aceite: alteração não confirmada não é apresentada como segura para fechar; cenário controlado não perde silenciosamente o lançamento. Evidência privada: `conc-test/close_pending.py`.

### Acessibilidade e viewport — ensaio adicional

Em Edge local sintético a 1280×900, uma foto anexada gerou `img[data-act=tab-foto]` sem `tabindex`; o elemento não é foco nativo, confirmando a evidência de AUD-I-001. No modal “Tabelas salvas”, dez Tabs percorreram ciclicamente três botões internos e Escape fechou o modal. Nos estados iniciais de 375×812 e 768×1024, `scrollWidth` do documento foi igual à largura da janela. Não se testaram leitores de tela, todos os modais, contraste ou foto no celular; ausência de overflow inicial não prova responsividade integral. Evidência sintética privada em `a11y-check`.


A confirmação por teclado de AUD-I-001 foi ampliada na visão Lista: a partir do primeiro cartão com foto, cinco Tabs passaram por Duplicar, Excluir, próximo cartão, Duplicar e Excluir; nenhuma foto recebeu foco (`tabIndex=-1`). No modal vazio de Tabelas salvas, os contêineres medidos couberam em 375×812 e 768×1024, com margem de 8 px; isso não valida listas longas, outros modais, teclado virtual ou leitores de tela. Capturas sintéticas privadas em `a11y-check`.

**Complemento AUD-A-006: atraso finito e controle.** Em dois contextos Edge locais independentes, injetou-se `QuotaExceededError` apenas na primeira gravação de `cadpecas4` e atraso finito de 5 segundos na abertura do IndexedDB. Com a tela em “Salvando…”, fechar após 1,4 s não mostrou diálogo detectável e a nova aba não apresentou a peça sintética (duas linhas antes). No controle, aguardaram-se 12,5 s até “Salvo neste navegador”; após fechar e reabrir, as duas linhas estavam presentes. O ensaio mostra perda de lançamento ainda pendente quando o fechamento ocorre na janela, sob quota transitória e atraso injetados; não estabelece frequência dessas condições reais. Evidência privada: `conc-test/close_finite.py`.




## Plano de correções consolidado — para aprovação posterior

Nenhuma alteração foi implementada nesta auditoria. Esforços são relativos (P pequeno, M médio, G grande) e dependem de reprodução e revisão de compatibilidade.

**Onda 0 — P0:** nenhum P0 demonstrado. Se uma nova reprodução demonstrar perda ampla e inevitável, reclassificar antes de iniciar. Saída: risco crítico avaliado, com proteção e recuperação demonstradas quando aplicável.

**Onda 1 — P1:** primeiro tornar a suíte confiável (K-001, P), preservar edição de variações (A-007 M), caracterizar e proteger gravação pendente e recuperação (A-006 M, A-003 G, A-004 M, A-008 M, A-009 P–M), validar backups e lembrete (A-001 M, A-005 P), depois tratar omissões de importação e cópia concorrente (C-001 M, C-003 M, C-004 M, D-001 M), entrada ambígua (B-001 M) e migração de grades (A-002 M). Dependência: cópias recuperáveis e testes de caracterização antes de migrar ou alterar persistência. Risco alto de regressão em dados, fotos, históricos, formatos e versões antigas. Criar testes com falhas injetadas e controle sem falha, quota transitória, reinício, recuperação de índice, múltiplas abas, backups grandes, linhas sem descrição, clipboard atrasado e IDs de grade distintos. Executar suíte existente em ambiente isolado, além de reabrir arquivos gerados. Saída: testes passam, nenhum sucesso é anunciado sem confirmação disponível e dados de teste são reconciliados após recarga/restauração; exceções de download devem ser expressas conforme limitações do navegador.

**Onda 2 — P2:** C-002, I-001, J-001, K-002 e K-003; esforço de P a G. Dependência: estabilizar os fluxos da onda 1. Risco: alterações visuais, teclado e virtualização afetarem operação em lote. Acrescentar testes de nota com zero, teclado em foto/cartão, modal, comparação de custos no XLSX e renumeração completa; repetir medições e tentar 5.000/20.000 somente com limite seguro. Saída: critérios de cada achado atendidos e nenhuma regressão funcional observada nos testes abrangidos.

**Onda 3 — P3:** separar responsabilidades gradualmente, documentação e publicação reprodutível com dependência fixada; esforço M–G. Dependência: caracterização dos resultados e ondas anteriores. Risco: divergência de regras devido à ordem compartilhada do IIFE. Executar suíte e comparações de saída antes/depois. Saída: build repetível sob dependências fixas e manutenção sem alterar resultados caracterizados.

## Veredito — dez respostas, com confiança limitada

1. **Uso diário de dados comerciais importantes:** não é possível atestar segurança; há riscos confirmados sob falhas injetadas e erro de importação reproduzido. A decisão depende das proteções e dos backups disponíveis.
2. **Perda silenciosa:** demonstrou-se perda de lançamento pendente em condição injetada e resíduo após rollback falho; frequência no ambiente real não foi medida.
3. **Cálculos:** os casos específicos de bruta e XLSX conferiram; não se garante o universo de regras. `1.500` é ambíguo e o rateio de centavos de NF depende de regra comercial.
4. **Importação/exportação:** não se garante preservação integral; a omissão sem descrição e a corrida de cópia foram reproduzidas nos cenários documentados.
5. **Volume:** 1.000 itens foram adicionados em duas medições de cerca de 46 s; testes maiores não concluíram. Não há capacidade máxima estabelecida.
6. **Segurança:** proteção foi observada nos poucos payloads testados e há mitigação de advisory PDF; ausência de vulnerabilidades não foi demonstrada.
7. **Suíte:** não é suficiente como garantia de regressões críticas; o agregador e asserções de testes têm lacunas confirmadas, e cenários críticos permanecem sem cobertura.
8. **Uso intensivo:** prontidão não demonstrada, sobretudo por desempenho e recuperação.
9. **Condições para estabilidade:** resolver ou aceitar formalmente riscos, restaurar dados sintéticos de forma reconciliada, cobrir falhas e concorrência, corrigir o agregador, validar formatos e medir volume representativo.
10. **Primeira onda:** não houve P0 demonstrado; recomenda-se iniciar onda 1 com confiabilidade da suíte e preservação/recuperação de dados.

## Correções anteriores verificadas e limites da auditoria

As proteções básicas observadas em testes — detecção simples de segunda aba, recuperação de uma peça e de foto, e igualdade serializada dos históricos no cenário sintético — são comportamentos verificados nos cenários descritos, não comprovação de que todas as pendências anteriores foram corrigidas. Nenhuma correção anterior é declarada universalmente verificada apenas por existir em commit ou teste. As nove pendências estão na tabela histórica e nas atualizações específicas.

A auditoria permanece parcial: falta reproduzir todas as falhas em armazenamento real sem injeção, medir 20.000 linhas, cobrir todos os formatos e dispositivos, leitores de tela, pentest completo, integração real com sistemas externos, equivalência funcional exata da publicação e testes com dados reais autorizados. A tentativa de 5.000 não concluiu; 20.000 não foi iniciada, portanto o limite de capacidade é desconhecido. O HTML público é apenas observado; não se executaram ações ofensivas nele. O arquivo Markdown local é a entrega verificável; não há publicação como Artifact privado disponível nesta sessão.

## Rodada adicional — migração de grades com controle

**AUD-A-002, impacto funcional CONFIRMADO pela interface em cenário sintético controlado.** Foram restaurados dois backups idênticos, exceto pelo marcador `v14`: a grade Prata 925 possuía item `p11` com nome 11, a grade Anél tinha `a11` com o mesmo nome, e uma peça selecionava `p11` com quantidade 1 para cada banho. Com v14 já marcado (controle), a tabela mostrou BR1670AA/BA, tamanho 11 e quantidade 1. Com v14 falso, a migração vinculou Prata 925 a Anél e a tabela mostrou BR1670A/B sem tamanho nem quantidades. O JSON manteve `gsel=p11` e os overrides, portanto não se demonstra apagamento definitivo dos dados: há divergência funcional após migração, condicionada a grades independentes com nomes iguais e IDs diferentes. Evidência sintética privada: `persist-test/grade_controle.py`. A seleção da grade fonte pode priorizar `usaId` quando existente; não generalizar a configurações que não atendam às condições.


### AUD-C-003 — Romaneio truncado em 3.000 linhas sem alerta específico

**P1, CONFIRMADO na interface local com dados sintéticos.** `src/js/19c-colar-romaneio.js:30-31` limita a coleta a 3.000 correspondências. O aviso de conteúdo remanescente em `:48` procura especificamente valores com `R$`. Em Edge local, o modelo “Pedido com itens por peso (GR)” recebeu texto de 58.714 caracteres, abaixo do limite de 60.000, contendo 3.001 linhas sintéticas com códigos únicos e valores sem `R$`: linhas no padrão `1 CODIGO X 1 1,00 1,00`, entre `Unit. Total` e `Total Produtos`. A interface mostrou 3.000 peças e cartões e “Lista: —”, sem aviso de truncamento; havia apenas avisos genéricos de peso e divisão. O contador de linhas lidas é visível, mas não informa que uma linha reconhecível ficou para trás. O impacto depende do volume e do modelo, não medidos no uso real. Recomenda-se detectar correspondência excedente e bloquear ou exigir decisão informada, indicando a quantidade ou existência de linhas restantes; testar também formatos com `R$`, totais e limites de caracteres. Aceite: exceder o limite nunca produz aparência de importação integral sem aviso inequívoco. Evidência sintética: `limite-ui/test.py` no workspace privado. Esforço M; risco de regressão em parsers e tempos de leitura.

Uma revisão independente de AUD-A-002 confirmou a causa: nomes são comparados na mesma ordem sem comparar IDs; `effGrade` passa a resolver a grade de origem e `itensGrade` filtra pelo antigo `gsel`. Os overrides da variação anterior não são aplicados quando o motor cai na chave de banho simples. Dados podem continuar serializados, portanto não se afirma apagamento físico. A revisão foi estática; o ensaio controlado anterior é a evidência de interface.

### Quota real — cenário básico

Em perfil descartável de Edge local, chaves sintéticas da mesma origem foram preenchidas até `QuotaExceededError`, sem instrumentar a API. Uma peça adicionada apareceu em duas linhas, mas status e toast informaram “NÃO salvo — memória do navegador cheia. Baixe o backup”; após reload as linhas não persistiram. O aplicativo **avisou corretamente nesse cenário simples**; não comprova segurança em fechamento com IndexedDB lento ou outras falhas. Em um controle anterior sem esgotar quota, a peça salvou e persistiu. Evidência sintética privada: `persist-test/quota_real.py`.

AUD-C-003 recebeu revisão independente: o limite de 3.000 e o critério de aviso de sobras apenas com `R$` sustentam o cenário. Totais configurados e encontrados, ou símbolo monetário no texto remanescente, podem produzir outros avisos; não se afirma ausência universal de alerta.


### AUD-C-004 — CSV de romaneio altera decimais e zeros à esquerda

**P1, CONFIRMADO pela interface local e revisão independente.** No fluxo de planilha de romaneio, `src/js/21-edicao-em-lote-e-revisao.js:140-141` usa `XLSX.read` em texto e depois `sheet_to_json(...,raw:true)`. A inferência numérica ocorre antes de `raw:true`. Em Edge isolado, CSV UTF-8 `Código;Descrição;Quantidade;Preço` com `001;Peça aço;2;3,25` mostrou na prévia código `1` e preço `325`; no romaneio o custo era R$ 325,00. O mesmo ocorreu com Windows-1252. CSV com delimitador vírgula e decimal ponto `3.25` preservou 3,25, mas `001` virou 1. A prévia expõe os valores alterados, embora não informe a conversão. Teste independente com a biblioteca local reproduziu `3,25→325`, `0,01→1`, `12,50→1250`, `19,90→1990`, `1.500,25→1,50025` e `001→1`. Isso afeta os exemplos e esse fluxo, não todos os CSVs ou importadores. O impacto é custo comercial incorreto e perda de identificação; frequência depende dos arquivos usados, não medida. Pode ser corrigido manualmente quando percebido ou por reimportação da fonte. Recomendação: preservar texto bruto na leitura e converter colunas com regra de locale explícita e códigos textuais, mantendo prévia verificável. Testes: delimitadores `;`/`,`/tab, vírgula e ponto decimais, aspas, codificações, zeros à esquerda e arquivo reaberto. Aceite: entradas representadas conforme formato informado preservam valores e identificadores ou geram aviso de ambiguidade; não alterar leitura de XLSX numérico existente. Esforço M; risco de regressão em formatos anteriores. Evidência sintética privada: `limite-ui/encoding2.py` e `limite-ui/sheet.cjs`.

### Foto — comparação de bytes armazenados

Em backup sintético com imagem 1×1 e imgbb bloqueado, original armazenada e miniatura tinham hashes SHA-256 idênticos antes e depois da restauração/reload (`17756029a742683dfe68104fb6d86645f10d5a37e65fb3d8f983e878fe97d43a` em ambas as chaves). O aplicativo converteu o PNG para JPEG, portanto a igualdade é entre os dados armazenados nos backups, não com os bytes do PNG de origem. Após excluir duas linhas, um Desfazer restaurou uma linha e sua imagem; após recarga a linha e imagem persistiram e backup reteve as duas chaves. Não foi testado segundo Desfazer. Evidência privada: `persist-test/foto_hash_undo.py`.


**Complemento AUD-C-004 — XLSX:** um controle pela interface usou código numérico `1` com formato de célula `000`, apresentado como `001` na planilha de origem. O importador mostrou `1`; o preço numérico 3,25 permaneceu correto. Uma célula explicitamente textual `001` foi preservada como `001`. Revisão independente com a biblioteca encontrou para a célula formatada `v=1` e `w='001'`: `raw:true` extrai o primeiro. Os zeros são formatação visual, não parte intrínseca do número; existe divergência de identificação caso o código comercial dependa dessa apresentação. Corrigir por tipo de coluna, sem aplicar conversão formatada indiscriminadamente a preço e quantidade.

**Complemento de exclusão e desfazer:** em outra execução sintética, após excluir duas linhas, o primeiro Desfazer restaurou uma e o segundo restaurou duas. Imediatamente após o segundo Desfazer o DOM mostrava zero imagens; após recarga exibiu duas, e o backup conservou hashes dos bytes armazenados. Não se demonstrou falha permanente nem se mediu conclusão de carregamento assíncrono; não tratar ausência momentânea como defeito confirmado sem teste de espera e eventos.

No controle adicional de CSV `A001;Peça aço;2;"3,25"`, o código alfanumérico A001 foi mantido, mas a prévia mostrou 325 e o custo R$ 325,00. As aspas não impediram a inferência indevida nesse cenário.


**Quantidade no mesmo defeito AUD-C-004:** CSV sintético `A001;Peça aço;1,5;3,25` apresentou 15 unidades e 325 na prévia e no romaneio, sem rejeição de quantidade fracionária. Revisão independente da chamada de biblioteca retornou `[1,'Peca',15,325]` para código `001`; em `30-eventos-mouse-e-clique.js:289-291`, a validação recebe 15 já convertido, que passa como inteiro. Se recebesse a string original `1,5`, o parser a interpretaria como 1,5 e a validação a rejeitaria. A alteração de quantidade é parte da mesma causa-raiz de inferência prévia de CSV e não é duplicada como outro achado; aplica-se ao formato e fluxo testados. Evidência sintética privada `limite-ui/fraction.py`.

## Verificação adicional da publicação

Consulta HTTP HEAD somente de leitura à página publicada em 09/11/2026 retornou 200 e enviou `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` desabilitando câmera, microfone e geolocalização, `Strict-Transport-Security` e `Cache-Control: no-cache`. A CSP efetiva permite scripts inline e cdnjs. O carregamento dinâmico de PDF.js e worker do cdnjs não apresenta verificação de integridade no código local (`src/js/22-importar-pdf-romaneio.js:2-7`): é dependência de disponibilidade e integridade do terceiro, não evidência de comprometimento. A consulta não comprova que todo o código local corresponde ao site publicado.

## Verificações adicionais de importação

A conferência de valor de romaneio usa `preco × quantidade` quando disponível, independentemente de o modelo escolher `precod` como custo (`src/js/19c-colar-romaneio.js:42-44`). Ensaio Node VM com modelo sintético: preço R$ 10,00, descontado R$ 5,00, quantidade 2 e total do item R$ 10,00; a conferência computou R$ 20,00. Isso pode estar correto quando o total comparado é explicitamente sem desconto, como no modelo padrão, e pode induzir uma comparação inadequada em modelo personalizado cujo `valorRe` represente valor líquido. Regra de negócio e UI/caso real não foram verificados; não classificar como erro universal. Essa é a pendência conhecida sobre conferência de desconto, não um achado duplicado.

Há hipótese não verificada de consumo de memória na extração de imagens de PDF: `src/js/22-importar-pdf-romaneio.js:13-19,29-31` cria arrays/canvases conforme dimensões de imagem e o limite de tamanho do arquivo não garante limite equivalente de pixels descomprimidos. Não houve PDF sintético nem medição que comprove travamento ou exploração. Testar com documentos artificiais limitados e estabelecer teto de pixels antes de classificar o impacto.

### Verificação de pendência anterior: `tabSalvar`

Em Edge local isolado, `indexedDB.open` foi atrasado artificialmente por quatro segundos. Iniciou-se o salvamento de uma tabela com opção de começar nova e, durante a espera, uma peça sintética nova foi lançada. O histórico final mostrou a peça/duas linhas capturadas originalmente; a tabela corrente manteve as duas linhas da peça nova após conclusão e recarga. Isso verifica a proteção contra perda de **nova peça** nesse cenário, não contra todas as edições de peças existentes ou mudanças de configuração. Evidência privada: `tab_corrida_auditoria.py`. A pendência é corrigida e verificada nesse cenário, com risco residual de concorrência não esgotado.

Consulta pública de leitura da biblioteca `lib/xlsx.full.min.js` retornou 951.904 bytes e SHA-256 `CC015130AA8521E7F088F88898EBA949CCDCBFB38DF0BD129B44B7273C3A6F41`, igual às cópias locais. A igualdade vale para esse recurso, não demonstra equivalência do HTML publicado.

A interpretação da conferência de preço foi revista independentemente: a soma usa preço bruto enquanto `T.custo=precod` seleciona custo descontado. No modelo padrão, o rótulo corresponde explicitamente ao valor sem desconto; não se afirma falha universal. Em modelo personalizado cujo `valorRe` represente total líquido, pode haver aviso divergente ou selo que apenas confere valor bruto; expectativa e interface permanecem sem confirmação.


Revisão independente adicional conferiu novamente o CSV com a biblioteca local (`001;Peca;1,5;3,25` resultou em `1`, `15` e `325`) e verificou o script da reprodução UI de C-003. O ensaio UI de C-003 contém a entrada de 3.001 linhas, sem controle separado de 3.000; a presença de total reconhecido ou `R$` no remanescente pode produzir outro aviso.

### AUD-A-007 — Alteração não salva de uma variação é substituída ao editar outra

**P1, CONFIRMADO em interface sintética; pendência antiga `sincFormCelula` AINDA PRESENTE.** Criar peça bruta com quantidades ouro 1 e prata 2; abrir a peça para edição; no formulário alterar ouro para 8 sem salvar; na tabela alterar quantidade prata para 4 e confirmar com Enter. Em duas execuções isoladas o formulário estava 8/2 antes e depois do clique na célula, mas após Enter mudou para 1/4; salvar e recarregar manteve 1/4. A alteração 8 foi perdida antes de ser salva; não se afirma que o valor 8 já estivesse persistido. A revisão independente identificou a causa em `src/js/15-planilha.js:183-190`: a função clona o lançamento salvo e copia todos os overrides para a coluna (`:190`), inclusive a variação que não foi editada na tabela; a proteção de exclusão em `:189` não impede essa sobrescrita. Os campos de banho usam `S.form.ov[b][W]` (`31-eventos-campos-e-grade.js:112`); `dobrarOv` não funde W globalmente (`27-fotos-escolher-colar.js:127-132`). Revisão estática independente confirma mecanismo. Frequência depende de edição simultânea de formulário e tabela; não medida. Recuperação depende de perceber a mudança e redigitar ou ter histórico anterior. Correção sugerida: sincronizar somente a chave de variação afetada preservando alterações não salvas das demais, sem quebrar operações globais intencionais. Testes: diferentes banhos/tamanhos, quantidade/preço, célula individual, colagem e lote, comparação após salvar/recarregar e undo. Aceite: o exemplo acima preserva ouro 8 e prata 4; ações intencionalmente globais permanecem corretas. Esforço M; risco de regressão no comportamento de edição e sincronização. Evidência privada: `sinc_corrida_auditoria.py`.


### AUD-F-001 — Padrão de leitura personalizado pode consumir tempo excessivo

**P2, CONFIRMADO em ensaios isolados do regex; impacto na UI e frequência não medidos.** O usuário pode editar o formato de linha em `src/js/25-relatorio-romaneio.js:62-66` e ele é salvo em `31-eventos-campos-e-grade.js:90`. `padraoRegex` transforma cada `{desc}` em grupo não guloso limitado de até 250 caracteres (`19c-colar-romaneio.js:4-10`); a proteção `rxPerigo` trata expressões auxiliares, não esse padrão gerado. Um padrão patológico de dez `{desc}` e `{qtd}` aplicado a texto sem dígito excedeu 3 s em processo Node isolado; revisão independente repetiu em worker e interrompeu após 2 s. Exige padrão personalizado incomum e texto sem correspondência; não demonstra travamento com padrões padrão, exploração remota ou duração exata na UI. Recomenda-se validar estrutura/quantidade de tokens e limitar trabalho fora da thread de interface; testes devem incluir padrões válidos, repetidos e texto sem correspondência. Aceite: caso adversarial termina dentro de limite definido sem bloquear a interface e os modelos legítimos continuam funcionando. Esforço M; risco de rejeitar configurações existentes.


No teste adicional de `tabSalvar` com IndexedDB atrasado, editou-se uma peça existente durante a espera: quantidade ouro passou de 1 para 7. O histórico manteve a captura anterior (duas unidades), enquanto a tabela corrente preservou ouro 7 e prata 1 após término e reload. Isso amplia a verificação da pendência aos dois casos sintéticos (criação nova e edição existente), não a mudanças de configuração ou fotos. Evidência privada: `tab_edit_corrida.py`.


Teste adicional local de segurança: CSV sintético com descrição `<img src=x onerror=alert(123)>` foi importado em Edge isolado. A prévia exibiu texto literal, sem elemento `img[src=x]` e sem diálogo; após confirmar, também não havia esse elemento ou diálogo no romaneio. O texto não apareceu em `innerText` do romaneio, possivelmente por estar em input; preservação do valor não foi verificada. Esse ensaio cobre apenas um payload e um caminho e não demonstra ausência geral de XSS.

### AUD-A-008 — Ponto prometido pode falhar sem aviso antes da exclusão

**P1, CONFIRMADO na interface com falha injetada e controle.** Em Edge local isolado, duas peças/quatro linhas foram selecionadas; a confirmação dizia que um ponto de restauração seria guardado antes de excluir. A gravação `put` no object store `pontos` foi forçada a falhar. As quatro linhas foram excluídas, o toast apenas informou exclusão e ofereceu Desfazer, e a consulta de observação ao IndexedDB não encontrou ponto criado. No controle sem falha, havia ponto “antes de excluir 4 linhas”, com duas peças. `src/js/27-fotos-escolher-colar.js:166-175` inicia `pontoAuto` sem aguardar confirmação e `14-persistencia.js:65-67` não comunica falha ao chamador. A captura anterior à exclusão foi corrigida, mas a promessa de persistência continua condicionada ao armazenamento; essa pendência é CORRIGIDA PARCIALMENTE. Desfazer permaneceu disponível na sessão, portanto não se afirma perda irreversível; frequência real não medida. Recomenda-se aguardar o ponto ou informar falha e permitir decisão explícita, com testes de falha IDB, encerramento, undo e controle. Aceite: não prometer ponto guardado se gravação não for confirmada; recuperação ou risco deve ficar claro. Esforço M; risco de alterar experiência e latência de exclusão. Evidências privadas `ponto_falha_auditoria.py` e `ponto_controle_auditoria.py`.

**AUD-F-001, complemento de interface:** na área de configuração técnica de leitura, um padrão sintético de dez `{desc}` seguido de `{qtd}` e texto de 80 letras sem dígitos fez o clique de teste ultrapassar três segundos em Edge local isolado. O processo foi encerrado em segurança; não se mediu tempo final nem se demonstra impacto no padrão normal ou ataque remoto.

**AUD-J-001, complemento 5.000:** em cópia local isolada, preencher 5.000 entradas levou 26.722 ms e prepará-las 1.369 ms; o clique “Adicionar” não retornou dentro do limite de 90 segundos e o processo foi interrompido. Não se observou estado final nem persistência; não se estabelece capacidade máxima. 20.000 não foi iniciado; continua não verificado.


Na frente de segurança de importação, teste Edge local com CSV e XLSX sintéticos incluiu código `<img src=x onerror=alert(123)>` e descrições `<svg onload=alert(456)>`, `=1+1` e `@SUM(1,2)`. A prévia mostrou texto literal; após importar, três cartões tinham valores literais nos campos, sem elementos `img`/`svg` injetados ou diálogos. Cobre apenas código, descrição e esses exemplos; não é validação geral de XSS nem de exportação.

### Exportação filtrada — ensaio adicional

Em Edge local, duas peças sintéticas ALFA e BETA geraram variações. Busca por ALFA: XLSX Jueri reaberto continha apenas BR1670A/B com quantidades 3/2; CSV Bling continha pai BR1670 e filhos A/B, com estoque 3/2 e código pai, sem BETA. Busca por uma só variação BR1670A: Jueri levou somente essa linha; Bling agrupado levou pai e ambos os filhos, comportamento informado pela interface para preservar produto agrupado. Os arquivos foram reabertos com SheetJS; não foram enviados ao Bling real. Evidência sintética privada: `filtro-final/teste.js` e `teste_single.js`.

Em teste de restauração isolado, JSON truncado, versão 999 e IDs duplicados foram recusados sem confirmação de substituição, e as duas linhas da peça sintética original permaneceram após recarga. Isso não prova rejeição de todos os arquivos inválidos.

### AUD-A-009 — Restauração não alerta sobre marcador de backup incompleto

**P1, CONFIRMADO na interface com backup sintético marcado; efeito depende do conteúdo ausente.** `bkMontar` registra `incompleto` quando há falhas de leitura (`src/js/20-armazenamento-idb.js:34-44`); `validarBackup` (`:113-136`) não preserva ou verifica esse marcador. A confirmação de restauração `:139` informa substituição e contagens, mas não o marcador; o sucesso `:167` também não o menciona. Em Edge local, um backup sintético válido de uma peça recebeu `incompleto=['roms','fotos:simulado']`. O diálogo padrão não alertou a incompletude; após aceitar, peças/configuração/formulário foram substituídos conforme anunciado e o toast informou restauração, sem alerta do marcador; o resultado permaneceu após recarga. A revisão independente confirmou o caminho e ressalta que valores individuais inválidos ainda podem ser rejeitados. O aviso original de criação e o nome `INCOMPLETO` podem existir, mas não acompanham necessariamente um arquivo renomeado. Romaneios, tabelas e fotos são adicionados, não automaticamente apagados. Não se afirma perda física de fotos existentes nem que todas as falhas de leitura gerem backup aceito. Recomenda-se preservar o marcador, apresentar lista de falhas e exigir decisão informada antes de substituir; testar falha de enumeração e valor inválido. Aceite: nenhum backup marcado incompleto é anunciado como restauração integral sem aviso específico. Esforço P–M, risco de rejeitar arquivos legados se validação não for compatível. Evidência privada `persist-test/invalid_backup_auditoria.py`.

Teste de segurança adicional percorreu CSV sintético → interface → criar seis linhas → XLSX reaberto. As descrições `<svg onload=alert(456)>`, `=1+1` e `@SUM(1,2)` saíram como células tipo texto (`s`), sem SVG injetado ou diálogo na interface; cobre apenas esses campos e cenário.


**Complemento AUD-A-009 com geração real do marcador:** em Edge isolado, uma falha injetada em `getAllKeys` do store de fotos produziu pelo fluxo normal um arquivo `INCOMPLETO`, com `incompleto:['fotos']`, objeto `fotos` vazio e aviso explícito de que não se deve confiar nele. Em outro contexto, ao restaurar, o diálogo mostrou zero fotos mas não mencionou `incompleto`; o toast informou restauração sem repetir o aviso. Após recarga as duas imagens apareciam porque a miniatura estava embutida no lançamento; não se demonstrou perda visual nem ausência do original pela UI. O resultado confirma a ausência de aviso do marcador durante restauração, não destruição geral de fotos. Evidência privada `persist-test/incompleto_real_auditoria.py`.
