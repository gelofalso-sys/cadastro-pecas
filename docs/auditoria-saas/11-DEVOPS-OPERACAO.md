# 11 — DevOps, observabilidade e operação

## Atual

CONFIRMADO: publicação manual documentada no Netlify Drop; script gerador local; headers em arquivo; nenhuma pipeline versionada no conjunto Git examinado. Deploy real, proteção da branch, monitoramento e plano de recuperação do host: NÃO VERIFICADOS. Backup local depende do operador e do armazenamento do navegador.

## Ambientes e pipeline propostos

| Ambiente | Dados / segredos | Uso |
|---|---|---|
| Local por worktree | seed sintético e Supabase local exclusivo | domínio, SQL, reprodução de bugs |
| CI | banco descartável e identidades de teste | checks de PR; nenhum segredo de produção em fork |
| Staging | projeto separado, Storage separado, configuração equivalente | E2E, carga, upgrade e restore |
| Produção | secrets restritos, acesso mínimo, MFA de operadores | só artefatos aprovados e rastreáveis |

Pipeline: dependências fixadas → lint/strict → unidade/contrato → bootstrap/migrate DB → RLS/API/Storage → build → E2E → scans → artefato com hash → staging → gates → deploy gradual. Não executar código de PR não confiável com credenciais privilegiadas. Preview não aponta para banco de produção.

Variáveis públicas só URL/chave pública deliberada; service_role, SMTP, assinatura webhook e conexão SQL exclusivamente servidor/secret manager. Revisar bundle produzido. Rotação de credenciais tem runbook e teste de invalidação; logs mascaram Authorization, cookies, chave imgbb e tokens de convite.

Migrations expand/contract conforme [04](04-BANCO-DE-DADOS.md). App antiga e nova devem coexistir com schema expandido. Rollback de app usa artefato anterior; rollback de dados exige plano próprio. Feature flags por tenant e registro de versão de schema/cálculo/formato na operação.

Gerador legado deve fixar minificador, validar saída e testar limites demo. Artefato desktop e demo precisam proveniência (commit+hash+flags), evitando correção apenas no principal. Headers reais de HTTP devem ser verificados após deploy; arquivo `_headers` existente não garante aplicação pelo host.

## Conexões e runtime

Preferir Data API/RPC inicialmente para evitar pool SQL próprio no BFF. Se usar driver direto, dimensionar pool considerando número máximo de instâncias, deixar reserva para migração/operador e definir timeouts. Em serverless, avaliar pooler transacional; não depender de variáveis de sessão persistentes para tenant e não assumir suporte a prepared statements no modo escolhido. Contexto transacional deve ser configurado/limpo dentro da transação e testado em reuso A/B. Referência: [conexões Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

Valores iniciais propostos: request interativo timeout 10 s, statement timeout 5 s, lock timeout 2 s; jobs separados com orçamento explícito. Validar com importações grandes; não manter transação enquanto processa PDF. Retries com jitter, teto e idempotência; sem retry automático ilimitado de erro de autorização/validação.

## Indicadores e alertas mínimos

| Sinal | Instrumentação | Alerta/ação inicial |
|---|---|---|
| Latência/erros API | p50/p95/p99 por rota e versão | p95 acima da meta por 10 min ou erro >1%: investigar/pausar rollout |
| Banco | slow queries, locks, conexões, CPU/I/O, espaço | >80% conexões/espaço sustentado, deadlocks ou fila: triagem |
| Integridade | duplicatas impedidas, conflitos, falhas de commit, reconciliação | qualquer discrepância de dados críticos: incidente |
| Segurança | falhas de auth, negativas, suporte excepcional, alteração de papel | surto por ator/IP/tenant ou escalonamento: limitar e revisar |
| Jobs | idade da fila, tentativas, dead letter | backlog fora do SLA ou repetição: pausar consumidor defeituoso |
| FinOps | uso e projeção por recurso/tenant | 50/80/100% orçamento e crescimento anormal |
| Backup | idade do último backup verificado e restore | backup atrasado ou restore falho bloqueia release |

Log estruturado: timestamp, severity, event, request_id, trace_id, tenant interno, ator pseudonimizado quando possível, operação, versão e resultado. Correlation ID propagado BFF→RPC/outbox, sem confiar cegamente em ID externo como chave de segurança. Não usar tenant como label de alta cardinalidade em toda métrica; detalhar em logs amostrados e consultas autorizadas.

Audit trail de negócio é append-only, separado de log operacional: quem, empresa, ação, alvo, antes/depois mínimo, motivo e vínculo de idempotência. Autor legado textual mantém proveniência. Proposta inicial: logs operacionais 30 dias, audit 180 dias configuráveis e backups diários 30 dias independentes; confirmar exigências contratuais e necessidade de dados antes de fixar retenção. Não são afirmações de obrigação legal.

## Backup e recuperação

Objetivo inicial proposto: RPO 24 h, RTO 8 h para cadastro, condicionado a teste. Com requisitos de operação financeira ou RPO 15 min, reavaliar PITR/custo e testar cadeia completa. Snapshot de banco não prova recuperação de objetos Storage: copiar/verificar objetos e metadados separadamente, com hashes, inventário, criptografia e acesso limitado.

Restore trimestral e antes de grandes migrações: provisionar destino isolado; restaurar DB; recuperar objetos; verificar contagem/hash/FKs/roles/RLS; executar smoke de leitura/exportação; medir RTO; confirmar ponto de corte; documentar falhas. Retenção/eliminação de tenant deve incluir objetos, índices, exportações e expiração natural das cópias; não prometer apagar imediatamente backup imutável.

## Runbook de incidente

1. Identificar versão, request IDs e tenants afetados; preservar evidência sem copiar dados sensíveis desnecessários.
2. Conter rota/job/tenant por flag ou revogar credencial comprometida; manter leitura segura quando possível.
3. Congelar ações que ampliem inconsistência; não “corrigir” com delete em massa.
4. Restaurar em ambiente separado ou aplicar correção revisada e reconciliar antes de promover.
5. Validar isolamento, contagens e funcionalidade; comunicar impacto real aos responsáveis conforme plano operacional.
6. Registrar causa, janela, perda comprovada, recuperação e teste de prevenção. Não afirmar ausência de vazamento sem evidência.
