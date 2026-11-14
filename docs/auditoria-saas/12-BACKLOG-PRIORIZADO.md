# 12 — Backlog priorizado

Estimativas em pessoa-dias, incluindo correção e teste local, sem contratação/espera externa. Não somar mecanicamente: há sobreposição de testes e extração. P0: contenção antes de ampliar exposição; P1: integridade/prontidão SaaS; P2: manutenção/eficiência; P3: expansão condicionada. Probabilidade é julgamento qualitativo, não frequência medida. Caminhos abreviados abaixo: H = `cadastro-pecas.html`; G = `tools/demo.py`.

## Achados

| ID | Evidência e comportamento | Risco / causa provável | Estado; severidade; probabilidade | Owner; prioridade; esforço |
|---|---|---|---|---|
| A01 | H:2652 aceita string; H:1713/1770/1973 inserem ID sem escape | Injeção de atributo/XSS; confiança indevida no ID importado | Injeção CONFIRMADA; XSS PROVÁVEL; alta; média com backup não confiável | UI/imports; P0; 2–4 |
| A02 | H:2891/2911/3047 PDF.js afetado, sem mitigação explícita | Execução via PDF nas condições do advisory; dependência antiga | Versão CONFIRMADA; exploração NÃO VERIFICADA; alta; média | imports; P0; 3–6 |
| A03 | H:1105/3660 SheetJS 0.18.5 em leitura | Poluição de protótipo/ReDoS; dependência antiga | Versão CONFIRMADA; exploração NÃO VERIFICADA; alta; média | imports/exports; P0; 3–6 |
| A04 | H:1642–1648 permite lançar e depois troca S pelo remoto | Edição perdida; falta revisão/reconciliação na inicialização | PROVÁVEL; alta; média no modo remoto | persistence; P1; 2–4 |
| A05 | H:3414 ignora null de idbPut; H:3013 também não aguarda resultado | Perda de original e sucesso aparente; erro não propagado | CONFIRMADO no caminho; alta; média em quota/abort | media; P1; 2–3 |
| A06 | H:2611–2613 erro de leitura vira []; 2617 anuncia completo | Backup incompleto; ausência de manifesto/fail-closed | CONFIRMADO no caminho; alta; média em falha IDB | archives; P1; 3–5 |
| A07 | H:2706–2725 writes separados/compensação não durável | Restore parcial após interrupção; armazenamento heterogêneo | Mecanismo CONFIRMADO; perda PROVÁVEL; alta; média | archives; P1; 4–8 |
| A08 | H:1519 grava config e peças separadas; 2732 ignora erro remoto | Estado remoto parcial/lost update; sem CAS/transação visível | CONFIRMADO; alta; média no remoto | persistence; P1; 3–6 para mitigação local; backend separado |
| A09 | H:1643 provedor opaco; chaves locais fixas | Sem isolamento empresarial demonstrado para SaaS | Lacuna CONFIRMADA no app; backend NÃO VERIFICADO; crítica se lançado sem controle; condicional | tenancy/security; P1 bloqueante SaaS; 10–20 |
| A10 | H:1107–4213 estado/DOM/regras/persistência; wrapper 3201 | Regressão e conflito; fechamento monolítico e ordem de carga | CONFIRMADO; alta; alta em evolução paralela | architecture/catalog; P1; 10–20 incremental |
| A11 | H:2911–2919,3044/3047,3660/2703 leitura integral sem orçamento uniforme | Travamento por arquivo grande; limites incompletos | CONFIRMADO nos caminhos; alta; média | imports; P1; 3–5 |
| A12 | H:2957/3988 chave imgbb em localStorage | Leitura por scripts da origem; padrão local inadequado a segredo compartilhado | CONFIRMADO; média; condicionada a XSS/acesso local | media/security; P1 antes de SaaS; 3–5 |
| A13 | demo-netlify/_headers:2 não permite imgbb | Upload bloqueado se headers aplicados | PROVÁVEL; média; alta se recurso oferecido | release; P2; 1–2 |
| A14 | G minifica com npx sem versão; arquivos gerados ignorados no Git | Artefatos não reproduzíveis/divergentes; build textual | CONFIRMADO; média; média | release; P1; 2–4 |
| A15 | H:1305 indexOf por grupo; 2542 find por linha; 1488 snapshots integrais | CPU/GC com volume; loops e cópias repetidos | Padrões CONFIRMADOS; gargalo medido NÃO VERIFICADO; média; cresce com N | catalog; P2; 2–5 |
| A16 | H:1187 ID Math.random curto; H:1311/2652 IDs externos | Colisão/inconsistência em escala; identidade local sem constraint | Uso CONFIRMADO; colisão NÃO VERIFICADA; média; baixa local | catalog/data; P1 na migração; 2–4 |
| A17 | H:3020/3113/3136/3143 Number e arredondamento por etapa | Diferenças de custo/totais; regra decimal não formalizada | Uso CONFIRMADO; erro comercial específico NÃO VERIFICADO; alta futura; média | catalog/imports; P1; 4–8 |
| A18 | inventário Git sem testes/CI; deploy manual LEIA-ME | Regressão sem gate e recuperação não provada | Ausência na árvore CONFIRMADA; serviços externos NÃO VERIFICADOS; alta; alta | QA/platform; P1; 6–12 |
| A19 | H:2732/2735/4198 catches silenciosos | Falha de sync/inicialização sem diagnóstico acionável | CONFIRMADO; média; média | persistence; P1; 2–4 |
| A20 | H:4201–4209 sinaliza outra aba só após alteração e permite manter estado | Aviso não é lock; sobrescrita possível em concorrência | Mecanismo CONFIRMADO; perda concorrente PROVÁVEL; alta; média | persistence; P1; 3–6 |

## Soluções, dependências, impacto e comprovação

| ID | Solução recomendada | Dependências / impacto | Teste de aceite |
|---|---|---|---|
| A01 | validar/mapear IDs e escapar atributos, revisar todos os sinks | formato de backup, grades, editor; preservar IDs legítimos | T13/T15; atributos não se expandem e handlers não executam |
| A02 | versão corrigida suportada e worker compatível; mitigação em todos getDocument | parsing de imagens/NF; risco de incompatibilidade major | T09/T10/T15 com corpus PDF e opção segura |
| A03 | distribuição corrigida oficial ou substituto equivalente | leitura e escrita XLSX/modelos | T05–T07/T15; tipos e fórmulas preservados |
| A04 | revisão de estado local + carregamento remoto reconciliado; impedir substituição cega | modo Claude; não bloquear permanentemente modo offline | T12: editar enquanto promise remota pendente, edição preservada/conflito explícito |
| A05 | resultado discriminado, aguardar commit antes de sucesso | miniatura/original e fluxo romaneio | T11 com quota/abort; original antigo intacto ou erro claro |
| A06 | manifesto, propagação de erro, backup parcial explicitamente identificado | todas as stores; tamanho do JSON | T13 falha getAllKeys/get; nunca “completo” com store faltante |
| A07 | staging durável e commit marker; reconciliação na retomada | A06; compatibilidade com restore antigo | T13 interromper em cada checkpoint, reabrir e recuperar estado consistente |
| A08 | snapshot versionado/CAS quando provedor suportar; RPC no SaaS | API do provedor a investigar; A09/A10 | falhar segunda write e repetir; nenhum estado misto apresentado como confirmado |
| A09 | memberships/roles/RLS/FKs/Storage e BFF autenticado | schema e identidade; libera piloto | R01–R16; inspeção independente de grants |
| A10 | extração de regras/portas, contratos públicos, UI por fluxo | T01–T14 baseline; não extrair tudo simultaneamente | paridade de corpus e checagem de ciclos |
| A11 | cotas bytes/páginas/linhas/pixels, worker e cancelamento | A02/A03; mensagens e acessibilidade | arquivo no limite passa, acima falha antes de alocar excessivamente |
| A12 | segredos por servidor/tenant; publicação de foto explícita | auth/media; exportação externa pode precisar URL pública | bundle sem segredo; usuário sem permissão não publica |
| A13 | decidir feature demo e CSP mínima correspondente | provedor de hospedagem/artefato | teste HTTP real de upload permitido ou recurso desabilitado claramente |
| A14 | build fixado com hash e inputs validados; generator testado | primeiro manifest/lockfile futuro | mesmo input gera output equivalente; demo e desktop smoke |
| A15 | profiling, mapas/indexação e otimização seletiva | corpus volumoso, A10 | medir antes/depois CPU/memória sem alterar saídas |
| A16 | UUID e mapa legacy_id com unique constraints | banco/migração | T17 colisão simulada e reimportação retomável |
| A17 | decimal e regra de arredondamento versionada | decisão de produto sobre divergências | T04/T10 propriedade soma de partes = total com resíduo explícito |
| A18 | pipeline e suíte por risco, restore periódico | contratos/ambientes | checks obrigatórios e release barrado por regressão conhecida |
| A19 | erros tipados, status durável, log sanitizado, retry limitado | A04–A08 | simular offline/erro; usuário identifica falha e pode recuperar |
| A20 | revisão/CAS e escritor coordenado; conflito explícito | compatibilidade navegador, modo remoto | duas abas com barreira de corrida, nenhuma perda silenciosa |

## Itens de projeto (não vulnerabilidades existentes)

| ID | Entrega | P / owner | Dependências | Estimativa / aceite |
|---|---|---|---|---|
| P01 | Núcleo SaaS de catálogo e migração piloto | P1 / catalog+data | A09/A10/A16/A17 | 15–30 dias; T17/T18 + paridade |
| P02 | Operação, alertas, quotas e backup independente | P1 / platform | A18, staging | 5–10 dias; restore medido e alertas simulados |
| P03 | Custo por tenant e perfil de consultas | P2 / platform | piloto instrumentado | 3–5 dias; modelo 07 substituído por medição |
| P04 | Worker para jobs longos | P2 condicionado / platform | evidência de timeout/fila | 4–8 dias se necessário; retry/idempotência/cancelamento |
| P05 | CRM/financeiro/produção/agenda/pós-venda | P3 / produto | descoberta própria e prioridade comercial | não estimado; não usar escopo do cadastro como orçamento ERP |

Ordem e primeira tarefa em [13](13-ROADMAP-EXECUCAO.md). Achados condicionais não justificam afirmar incidente ou explorar contas reais.
