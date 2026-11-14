# 12 — Backlog priorizado e verificável

H = cadastro-pecas.html; G = tools/demo.py. Linhas do snapshot em 01. Esforços em pessoa-dias de planejamento, não prazo contratado. P0 = conter antes de ampliar distribuição do vetor; P1 = integridade/prontidão; P2 = melhoria; P3 = expansão. Probabilidade qualitativa, não frequência medida. Não somar esforços mecanicamente: testes e extrações se sobrepõem.

## Evidências, risco e causa

| ID | Local / comportamento observado | Risco e causa provável | Estado; severidade; probabilidade | Prioridade / owner / esforço |
|---|---|---|---|---|
| A01 | H:1467–1468,1946,3144,3153: unicidade antes da limpeza; ab"c e abc viram abc | IDs indistintos podem associar edição/foto errada; normalização não injetiva | algoritmo CONFIRMADO; efeito E2E NÃO VERIFICADO; alta; média com backup inconsistente | P1 / catalog-imports / 2–4 |
| A02 | H:3417,3437,3573: PDF 3.11.174 com isEvalSupported:false nos dois caminhos | manutenção de biblioteca antiga; vetor conhecido mitigado | CONFIRMADO; exploração NÃO VERIFICADA; média residual; baixa para vetor mitigado | P2 / imports / 3–6 |
| A03 | H:1347–1348; lib/LEIA-ME; demo/index: local 0.20.3, fallback 0.18.5; lib ausente na pasta demo | arquivo malicioso pode alcançar biblioteca afetada; empacotamento omite dependência | artefato CONFIRMADO; execução no host NÃO VERIFICADA; alta; alta ao distribuir somente demo | P0 / release-imports / 2–4 |
| A04 | H:1979–1986: render/edição antes da resposta que substitui S | edição perdida; ausência de revisão/reconciliação | perda PROVÁVEL; ordem CONFIRMADA; alta; média em modo remoto | P1 / persistence / 2–4 |
| A05 | H:3539: romCriar dispara idbPut de foto sem verificar; manual 3968 verifica | original ausente após sucesso parcial; durabilidade não aguardada | caminho CONFIRMADO; perda simulada NÃO VERIFICADA; alta; média em quota | P1 / media-imports / 2–3 |
| A06 | H:3071,3074,3136–3159: export marca incompleto; restore ignora marca | recuperação parcial tratada como completa; contratos divergentes | fluxo CONFIRMADO; perda real NÃO VERIFICADA; alta; média após falha de backup | P1 / archives / 2–4 |
| A07 | H:3163–3182: writes separados, compensação em memória e salvar agendado | estado misto após crash; sem journal/commit durável | mecanismo CONFIRMADO; perda PROVÁVEL; alta; média | P1 / archives / 4–8 |
| A08 | H:1813–1817,3189: docs remotos separados; erro retorna antes do local | estado remoto parcial e cópia local atrasada; sem transação/CAS exposta | CONFIRMADO no código; alta; média no remoto | P1 / persistence / 3–6 |
| A09 | H:1981 e chaves fixas locais: nenhuma membership/tenant implementada no app | lançamento sem isolamento demonstrado; fronteira confiável ausente no código disponível | lacuna CONFIRMADA; provedor NÃO VERIFICADO; crítica se lançado assim; condicional | P1 bloqueante SaaS / tenancy-security / 10–20 |
| A10 | H:1350–5084; wrapper 3728; 378 funções e 63 innerHTML | regressão/conflitos; fechamento compartilhado e dependência da ordem | CONFIRMADO; alta; alta em evolução paralela | P1 / architecture-catalog / 10–20 |
| A11 | H:1353–1367,3330–3331,3963: limites existem; romPlanilha0 materializa antes de limitar linhas | CPU/memória excessivas; bytes comprimidos não limitam expansão | ordem CONFIRMADA; exaustão NÃO VERIFICADA; média/alta; média | P1 / imports / 3–5 |
| A12 | H:4644: chave imgbb em localStorage | scripts da origem podem ler; inadequado para segredo compartilhado SaaS | armazenamento CONFIRMADO; comprometimento NÃO VERIFICADO; média; condicional | P1 antes SaaS / media-security / 3–5 |
| A13 | G:60 (gera demo/_headers): connect-src/img-src omitiam imgbb, enquanto o _headers publicado antes da regeneração permitia https://i.ibb.co e https://api.imgbb.com | regenerar a demo removia sem aviso a permissão e quebrava upload/preview de fotos; arquivo publicado e gerador divergiam | CONFIRMADO (arquivo anterior observado, 686 bytes, e gerador comparados); corrigido em G nesta verificação; média; alta se feature ofertada | P2 (corrigido) / release / 1–2 |
| A14 | G:49 e bloco de geração: npx terser sem versão, substituições literais | artefato divergente/não reproduzível; build textual e dependência flutuante | CONFIRMADO; média; média | P1 / release / 2–4 |
| A15 | H:2992 find por linha; gerar/histNota percorrem estado extenso | CPU/GC crescem; buscas/cópias repetidas | padrão CONFIRMADO; gargalo medido NÃO VERIFICADO; média; cresce com N | P2 / catalog / 2–5 |
| A16 | H:1451 uid Math.random curto; identidade local | colisão na consolidação; sem unicidade global persistida | mecanismo CONFIRMADO; colisão aleatória NÃO VERIFICADA; média; baixa local | P1 na migração / data / 2–4 |
| A17 | calcBanho/celulasBase/relCsv usam Number e arredondamento | divergência de valores na migração; regra decimal implícita | uso CONFIRMADO; erro comercial NÃO VERIFICADO; alta futura; média | P1 / catalog / 4–8 |
| A18 | tests/run_all.py:26–31; finais t30/t31/t32: nonzero só conta com stderr; pageerror acumulado depois de print sem exit | falso sucesso; resultado baseado em texto incompleto | controle de fluxo CONFIRMADO; suíte NÃO EXECUTADA; alta; média | P1 / QA / 1–3 |
| A19 | H:3189,1795,1831: rejeições remotas suprimidas e async no unload | falha sem diagnóstico/durabilidade; status não cobre todos caminhos | mecanismo CONFIRMADO; perda no unload NÃO VERIFICADA; média/alta; média | P1 / persistence / 2–4 |
| A20 | H:4882–4890: aviso storage depois do write e opção manter aba | corrida/lost update; detecção posterior não é lock/CAS | mecanismo CONFIRMADO; perda PROVÁVEL; alta; média multiaba | P1 / persistence / 3–6 |
| A21 | G:33–40 (guarda de domínio): sem endereço informado a lista D ficava vazia e só localhost/file: passavam | demo gerada sem argumento exibia “Esta demonstração só funciona no endereço oficial” em qualquer host real: indisponibilidade total | CONFIRMADO por execução (host simulado antes e depois); corrigido em G: sem endereço = sem trava de domínio, anti-iframe mantido; alta; alta ao gerar sem argumento | P1 (corrigido) / release / 0,5 |

## Soluções, dependências, impactos e testes de aceite

| ID | Solução | Dependências / impacto | Teste necessário |
|---|---|---|---|
| A01 | unicidade após normalização; rejeitar colisão ou remapear todas referências; escapar atributos | backup, fotos, grades, romaneios | T13/T17: dois IDs que normalizam igual não entram indistintos; rejeição não altera estado |
| A02 | atualizar PDF/worker com corpus, manter opção segura | extração de imagens e NF | T09/T10/T15: texto/foto/parsing equivalentes e todos pontos sem eval |
| A03 | distribuir biblioteca fixada com hash, retirar reserva antiga; erro claro se ausente | G, desktop/demo, leitura/escrita XLSX | T05–T07/T15: artefato isolado nunca carrega 0.18.5; biblioteca ausente não provoca downgrade |
| A04 | revisão de estado e reconciliação, preservar rascunho | API do provedor não documentada aqui | T12: editar durante promise pendente; edição preservada ou conflito recuperável |
| A05 | aguardar write e resultado discriminado; reportar parcial e retry | confirmação de lote e mídia | T11: abort/quota ao gravar foto de romaneio; nenhum sucesso falso, retry sem duplicar peça |
| A06 | bloquear restore integral de incompleto; recuperação parcial explícita com manifesto | preservar aviso já existente no export | T13: incompleto:[fotos] com fotos:{} não anuncia recuperação integral; original mantido |
| A07 | staging, journal e marcador de commit durável; verificar compensações | A06, formatos locais | T13: interromper cada checkpoint e reabrir; antigo ou novo consistente, sem mistura |
| A08 | journal local confirmado e sincronização por revisão; comando transacional no SaaS | A04/A07, investigar CAS do provedor | T12/T18: falhar segunda write e reabrir; edição recuperável e estado misto não é confirmado |
| A09 | Auth/membership/RLS/FKs/Storage/BFF | schema/ambiente sintético | R01–R16 via JWT, Data API/RPC/Storage; inspecionar grants e bypass |
| A10 | extrair domínio/portas/contratos por fluxo; integrador único no HTML | baseline T01–T16 | paridade de corpus, import rules e ausência de ciclos novos |
| A11 | limitar dimensões antes da conversão; células/colunas/pixels/tempo; worker cancelável | A03 e corpus válido | T15: expansão excessiva rejeitada sem travamento; arquivo no limite aceito |
| A12 | publicação autorizada via servidor; segredo por escopo e quotas | auth/media; distinguir URL pública de privado | bundle/log/cache sem segredo; ator sem permissão não publica |
| A13 | imgbb incluído na allowlist do gerador; decisão de produto sobre a feature da demo pendente | build/deploy | verificar resposta HTTP real e upload/preview; origens não necessárias continuam bloqueadas |
| A14 | versões/hashes fixados, build verificável e artefato completo | A03/A18 | mesmo input gera equivalente; recurso ausente reprova build; smoke desktop/demo |
| A15 | medir antes, Map seletivo e snapshots graduais | corpus volumoso e extração | saída idêntica, CPU/memória/tempo registrados; preservar undo/virtualização |
| A16 | UUID + mapa por tenant/origem/tipo/legacy_id | A01/A09 | colisão simulada e reimportação retomável, vínculos corretos |
| A17 | decimal canônico, moeda e cálculo versionado | corpus e decisão de negócio | T04/T10/t31: rateios somam total; divergência antiga/nova explicitada |
| A18 | nonzero sempre falha; assert/exit por teste; relatório estruturado; wrapper temporário | Python/Playwright, sem dados reais de CI | exit(1) sem stderr e pageerror isolado reprovam; sucesso passa; wrapper original intacto |
| A19 | erros tipados, status pendente/falhou, journal e retries limitados | A04–A08 | T12: offline/unload/quota visíveis e recuperáveis; logs sem dados sensíveis |
| A20 | revisão e escritor coordenado, resolução explícita | A08 e compatibilidade navegador | T12/T18: duas abas/mesma revisão; conflito ou um vencedor, sem perda silenciosa |
| A21 | sem argumento = sem trava; com argumento, validar a lista e testar host permitido e não permitido | G, LEIA-ME da demo | smoke HTTP: host permitido abre; host fora da lista mostra o aviso; sem argumento abre em qualquer host |

## Entregas novas — não vulnerabilidades existentes

| ID | Entrega | Prioridade / owner | Dependências | Estimativa / conclusão |
|---|---|---|---|---|
| P01 | vertical SaaS catálogo/import/export/arquivos/mídia | P1 catalog-data | A09/A10/A16/A17 | 15–30 dias; paridade/autorização/migração retomável |
| P02 | operação, alertas, quotas e backup independente | P1 platform | A18, staging | 5–10 dias; restore e alertas simulados |
| P03 | consultas e custo por tenant medidos | P2 platform | piloto | 3–5 dias; HAR/EXPLAIN seguro/orçamento |
| P04 | worker do mesmo monólito | P2 condicionado | timeout/fila medidos | 4–8 dias; idempotência/retry/cancelamento |
| P05 | CRM/financeiro/produção/agenda/pós-venda | P3 produto | descoberta própria | não estimado; contratos e gates antes de implementar |

Ordem exata em 13. P0 não significa incidente ativo; impede ampliar distribuição pelo caminho afetado.

