# 14 — Registro de decisões e revisão adversarial

ADRs abaixo são recomendações documentadas, não infraestrutura implementada. Escopo do produto foi confirmado pelo usuário; escolhas técnicas serão materializadas em PRs posteriores.

| ADR | Decisão / razão técnica e financeira | Alternativas descartadas ou adiadas | Quando rever |
|---|---|---|---|
| 001 | Auditar Cadastro de Peças real; ERP é expansão separada | Presumir CRM/financeiro existentes produziria inventário falso | novo repositório ou escopo comercial confirmado |
| 002 | Migração incremental e extração de regras | Reescrita total sem prova de inviabilidade; risco de perder regras e custo maior | núcleo impossível de caracterizar/extrair com evidências |
| 003 | Monólito modular Next/BFF + Supabase, sem API separada inicial | Microsserviços e backend dedicado adicionam serviços/custo sem demanda atual | clientes API independentes, jobs medidos, release independente |
| 004 | SPA React/Vite é alternativa válida se roadmap ficar restrito | Next não é necessário à planilha; escolhido para fronteira server de expansão | ausência de integrações/jobs e ganho econômico comprovado |
| 005 | Domínios reais: catálogo, imports, exports, mídia, arquivos, identidade/tenancy | Criar pastas de ERP vazias; camada genérica por padrão | domínio real com regras/owner/testes |
| 006 | Tenant explícito + membership ativo + RLS + FKs compostas | Filtro frontend, role global no JWT, projeto por tenant inicial | requisitos contratuais de isolamento físico ou carga extrema comprovada |
| 007 | JWT do usuário em CRUD; privilégios elevados só em rotas operacionais específicas | service_role como cliente padrão do backend | necessidade excepcional documentada com controles equivalentes |
| 008 | PostgreSQL fonte de verdade; rascunho local separado | Dual-write sem transação; sincronização offline implícita | offline completo for requisito financiado e testado |
| 009 | Dinheiro decimal e cálculo versionado com paridade | Reutilizar Number sem regra; mudar centavos silenciosamente | moeda/regra nova aprovada com migração explícita |
| 010 | Fotos privadas por padrão; publicação externa separada | Bucket público universal ou signed URL curta como link permanente de ERP | requisitos do destino e política comercial de catálogo |
| 011 | Índices baseados em consulta/plano; escalar por métricas | Particionar/shardear para 10 mil empresas antes de carga real | I/O, locks, restore, custo ou isolamento exigirem |
| 012 | Testes especificados nesta auditoria, executáveis na implementação | Criar schema/testes fictícios e declarar RLS auditada | ambiente e código existirem no primeiro PR de fundação |
| 013 | Realtime/worker somente por requisito medido | Subscriptions globais, jobs em request longo, polling contínuo | colaboração simultânea real ou tarefas excederem orçamento |
| 014 | Build fixado e artefatos com proveniência | Cópias editadas manualmente e minificador flutuante | nenhum motivo atual para reverter |

## Revisão como atacante

Hipótese: membro de A controla JSON importado, IDs, path de foto, tenant no request e calls diretas a RPC/Data API. Ponto fraco: “autorizado no BFF” não cobre RPC direto, helper DEFINER, view privilegiada ou Storage. Planejamento corrigido: grants mínimos, RLS por comando, FK composta, tenant imutável inclusive para multiAB e testes R01–R16. Privilege escalation de role/membership não usa CRUD genérico. Links assinados já emitidos têm janela de validade explícita. A01–A03 antecedem migração para evitar transportar XSS ao contexto autenticado.

Risco residual: funções privilegiadas e jobs continuam capazes de escapar RLS se mal implementados. Exigem revisão independente e teste com ator restrito; não declarar “seguro por usar Supabase”.

## Revisão como mantenedor

Hipótese: pessoa nova altera cálculo sem conhecer referências e export. Ponto fraco: dezenas de pacotes abstratos ou tipos globais apenas transfeririam acoplamento. Correção: API pública por domínio, corpus de comportamento, versionamento de cálculo e imports proibidos. Um owner integra o HTML enquanto não extraído; não prometer paralelismo pleno durante M1/M2.

Risco residual: contratos podem crescer demais. Revisar export público por PR; evitar objetos `any`, domínio dependente de DOM e pacotes compartilhados com regra de catálogo.

## Revisão como operador financeiro

Hipótese: repetição de request, falha depois do commit, duas edições e rounding por item. Ponto fraco: transação por HTTP não cobre duas chamadas independentes nem efeito externo. Correção: confirmar import em uma transação com idempotência, lock de referência, revisão e outbox; calcular decimal canônico. Não confundir custo de peça com contabilidade. Futuro financeiro tem gate separado de baixa/estorno/reconciliação.

Risco residual: paridade com cálculo antigo pode perpetuar erro. Divergência deve ser explicitada em fixture, aprovada como mudança de regra, versionada e não aplicada retroativamente sem migração.

## Revisão como empresa em crescimento

Hipótese: 10→1.000→10.000 tenants com fotos e importações desiguais. Ponto fraco: número de tenants não mede consultas, conexões nem TB de arquivos. Correção: premissas de uso em 07, quotas por empresa, testes com tenants grandes, pool limitado, backlog/egress e backup observados. Worker é adicionado ao monólito antes de considerar microsserviços; sharding é última decisão sustentada por medidas.

Risco residual: estimativas de compute/hosting não comprovam capacidade e backup de 10 TB pode exceder reserva. Reorçar com piloto, medir restore e margem operacional antes de vender SLA.

## Contradições resolvidas

- “Não alterar arquivos na fase” versus “criar documentos”: somente documentação foi escrita após diagnóstico; código e configuração preservados.
- “Criar testes RLS” versus “não iniciar implementação”: especificação detalhada entregue; sem banco não se produz evidência falsa de execução.
- SaaS com isolamento versus exportação de links públicos: mídia privada e publicação explícita são fluxos separados.
- Rollback de app versus dados novos: export/delta e reconciliação são pré-requisitos, flag não desfaz schema/dados.
- Múltiplos tenants do mesmo usuário: WITH CHECK de membership não garante imutabilidade; coluna/trigger restrita é requisito adicional.
- Quotas de egress: cached e uncached calculados separadamente, não somados em franquia única.
