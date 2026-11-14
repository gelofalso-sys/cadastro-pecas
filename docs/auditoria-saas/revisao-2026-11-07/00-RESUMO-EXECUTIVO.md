# 00 — Resumo executivo

Auditoria revalidada em **07/11/2026**, sobre a pasta Cadastro Peças. Implementação, migrations e publicação não iniciadas. Os 16 documentos anteriores foram preservados; esta revisão consolidada está em docs/auditoria-saas/revisao-2026-11-07/.

## Diagnóstico objetivo

Existe um aplicativo local rico de cadastro de peças/semijoias: banhos, grades, conjuntos, romaneios, NF, fotos, relatórios e exportação Jueri/Bling. Não há evidência de ERP financeiro nem SaaS multi-tenant implementado nesta árvore. O HTML principal reúne estado, DOM, cálculo e persistência: 378 declarações nomeadas e 63 ocorrências de innerHTML.

Existem 26 scripts de teste, contrariando o inventário anterior. Entretanto, o executor pode reportar falso sucesso. Proteções de IDs, PDF, limites e backup também evoluíram e foram consideradas nesta revisão.

Recomendo **migração incremental para monólito modular TypeScript/Next.js + Supabase**, preservando regras e formatos. Não há evidência para justificar reescrita integral ou microsserviços. Se este cadastro for apenas parte do ERP pretendido, os outros repositórios precisarão de descoberta própria antes de ampliar estas conclusões.

## Dez maiores riscos atuais

| Ordem | ID | Risco | Classificação | Prioridade |
|---|---|---|---|---|
| 1 | A03 | Fallback SheetJS antigo; demo não inclui biblioteca local | artefato CONFIRMADO; deploy NÃO VERIFICADO | P0 antes de redistribuir |
| 2 | A09 | Lançamento sem isolamento empresarial comprovado | lacuna local CONFIRMADA; provedor NÃO VERIFICADO | P1 bloqueante SaaS |
| 3 | A01 | IDs distintos colidem após limpeza | algoritmo CONFIRMADO; E2E NÃO VERIFICADO | P1 |
| 4 | A08 | Gravações remotas parciais; falha remota impede cópia local | CONFIRMADO no código | P1 |
| 5 | A04 | Resposta remota tardia substitui edição | perda PROVÁVEL | P1 |
| 6 | A07 | Restore interrompido sem commit durável | mecanismo CONFIRMADO; perda PROVÁVEL | P1 |
| 7 | A06 | Restore não distingue backup marcado incompleto | CONFIRMADO no fluxo | P1 |
| 8 | A05 | Foto de romaneio sem confirmação de gravação | CONFIRMADO no código | P1 |
| 9 | A18 | Testes podem indicar sucesso falso | CONFIRMADO no controle de fluxo | P1 |
| 10 | A10/A20 | Acoplamento e escritores concorrentes | acoplamento CONFIRMADO; perda PROVÁVEL | P1 |

Cada achado tem localização, causa, impacto, prioridade, esforço, dependências e aceite em [12](12-BACKLOG-PRIORIZADO.md). Não foi demonstrado incidente em produção.

## Correções importantes em relação ao histórico

- idLimpo sanitiza IDs no carregamento normal. Não foi confirmado XSS pelo backup no fluxo completo. O risco demonstrado é unicidade conferida antes da normalização.
- PDF.js 3.11.174 usa isEvalSupported:false nos dois pontos de abertura, mitigação do advisory consultado.
- SheetJS local é 0.20.3; o problema permanece no fallback 0.18.5 e no empacotamento da demo.
- fotoNaPeca verifica falha de IDB; romCriar ainda não aguarda a foto.
- Backup já marca INCOMPLETO; restore não trata essa marca como contrato específico.
- Limites de entrada, testes, pontos de recuperação e backup de pasta existem e devem ser preservados.

## Correções desta verificação (07/11/2026, depois da captura final)

- Âncoras e fatos conferidos contra HEAD ebcfb66 (fonte 671595 bytes, hash 06830fa9…): fallback SheetJS 1348, limpeza de ID 1468–1469, escritas remotas 1814–1816, substituição tardia 1987, PDF sem eval 3438/3574, foto de romaneio 3540, backup incompleto 3072. Todos conferem. Ajustadas duas âncoras (A12 → 4644; A18 → run_all.py:26–31).
- Novo A21 (P1, corrigido): a demo gerada sem endereço bloqueava qualquer host real com “Esta demonstração só funciona no endereço oficial”. Corrigido em tools/demo.py.
- A13 confirmado e corrigido: o _headers publicado antes da regeneração permitia imgbb (686 bytes); o gerador não. A pasta demo-netlify/ é ignorada pelo git, então a diferença não aparecia no histórico. O gerador agora inclui i.ibb.co e api.imgbb.com.
- Fora desta auditoria, a suíte completa (t1–t32, t18 pulado por exigir backup real) foi executada sobre o HEAD ebcfb66 com 0 falhas. Isso não altera os achados estáticos, mas atualiza a afirmação de que os testes não foram executados.
- Correções de tools/demo.py e dos hashes da demo ainda não estão commitadas no momento desta revisão.

## Decisões executáveis

Arquitetura A: React/Next.js, TypeScript strict, BFF no mesmo deploy, PostgreSQL/Supabase Auth e Storage. Alternativa B adiciona backend Node dedicado apenas com clientes/jobs/ciclos de release que o justifiquem. Alternativa C React/Vite + Supabase/RPC continua adequada se o escopo ficar restrito ao cadastro sem integrações complexas. Comparação em [02](02-ARQUITETURA-ALVO.md).

Organização por catalog, imports, exports, media, archives, identity e tenancy, com contratos públicos e domínio sem DOM. Não criar módulos ERP vazios. Árvore em [03](03-ESTRUTURA-DE-PASTAS.md).

Isolamento: tenant_id não nulo, membership ativo, papéis por empresa, FKs compostas, tenant imutável, RLS por comando e Storage privado. service_role não participa do CRUD comum nem do browser. Testes negativos R01–R16 são gates futuros, não resultados executados. Modelagem em [04](04-BANCO-DE-DADOS.md) e [05](05-SEGURANCA-RLS.md).

Otimizar comandos transacionais, payload parcial versionado, paginação/cursor, cache por tenant/permissão, miniaturas e índices baseados em consultas/EXPLAIN. Não há Supabase atual para medir redução. Realtime/worker somente com necessidade observada. Modelo em [07](07-PERFORMANCE-CUSTOS.md).

Para 2/5/10+ pessoas: ownership de domínio, worktrees/bancos isolados, contratos e migrations coordenados. Um integrador altera o HTML enquanto monolítico. Regras em [08](08-GOVERNANCA-MULTIEQUIPE.md).

## Roadmap e investimento

1. Fixar baseline e tornar runner confiável.
2. Empacotar biblioteca corrigida e retirar fallback antigo.
3. Corrigir unicidade, persistência, fotos e recuperação.
4. Extrair regras e formatos mantendo paridade.
5. Implementar fundação SaaS e testes de autorização.
6. Pilotar migração com manifesto/reconciliação/rollback.
7. Ampliar por métricas; retirar legado após paridade.

Primeira etapa delimitada e aceites em [13](13-ROADMAP-EXECUCAO.md). Estimativa de planejamento para o cadastro SaaS: 70–140 pessoa-dias, baixa confiança; reestimar após baseline. Exclui construir CRM/financeiro/produção completos.

Cenários mensais ilustrativos de [07](07-PERFORMANCE-CUSTOS.md): US$65 / 125 / 474,42 / 2.917,37 para 10 / 100 / 1.000 / 10.000 empresas sob premissas explícitas. Não são cotações de capacidade. Preços-base reconsultados em fontes oficiais; compute, backup e hosting em escala são hipóteses.

## Evidência e limites

**Alteração concorrente:** HTML/wrapper e HEAD mudaram externamente durante a revisão. Pontos críticos foram rechecados e permanecem; hashes e relocalização constam em 01. Esta sessão escreveu somente documentação. Não houve nova auditoria integral de todas as alterações externas.


Node v24.18.0 compilou os dois scripts inline sem erro; probe inofensivo confirmou normalização/colisão e conferiu versão/hash SheetJS. E2E não executado: aliases Python/py inacessíveis e runner sobrescreve wrapper existente. RLS, carga, planos SQL, Storage e restore real NÃO EXECUTADOS, sem ambiente correspondente.

CONFIRMADO = demonstrado em código/probe; PROVÁVEL = evidência indireta; NÃO VERIFICADO = depende de investigação; NÃO APLICÁVEL = fora da arquitetura examinada. Proposta não é achado. Esta é auditoria estática com provas isoladas, não certificação de prontidão comercial.

## Navegação

[01 Inventário](01-INVENTARIO-SISTEMA.md) · [02 Arquitetura](02-ARQUITETURA-ALVO.md) · [03 Pastas](03-ESTRUTURA-DE-PASTAS.md) · [04 Banco](04-BANCO-DE-DADOS.md) · [05 RLS](05-SEGURANCA-RLS.md) · [06 Segurança](06-SEGURANCA-APLICACAO.md) · [07 Custos](07-PERFORMANCE-CUSTOS.md) · [08 Governança](08-GOVERNANCA-MULTIEQUIPE.md) · [09 Migração](09-PLANO-MIGRACAO.md) · [10 Testes](10-TESTES-QUALIDADE.md) · [11 Operação](11-DEVOPS-OPERACAO.md) · [12 Backlog](12-BACKLOG-PRIORIZADO.md) · [13 Roadmap](13-ROADMAP-EXECUCAO.md) · [14 ADRs](14-REGISTRO-DE-DECISOES.md) · [15 Rastreabilidade](15-MATRIZ-RASTREABILIDADE.md).

