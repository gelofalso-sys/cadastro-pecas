# 13 — Roadmap de execução

## Sequência obrigatória

| Ordem | Marco / backlog | Pré-requisito | Paralelismo permitido | Conclusão objetiva / risco |
|---|---|---|---|---|
| 1 | Baseline M0, corpus T01–T14, hash e backup | acesso ao snapshot correto | inventário e fixtures sem editar HTML | backup legível/contagens; risco: auditar versão divergente |
| 2 | Contenção A01/A02/A03 | 1 | fixtures e pesquisa de dependências; integração HTML serial | payload inerte + PDF/XLSX compatíveis; risco: regressão de parser |
| 3 | Build A14 e testes A18; limites A11 | 1–2 | pipeline por owner separado | artefatos reproduzíveis e checks; risco: demo diferente da fonte |
| 4 | Persistência A04–A08/A19/A20 | 1 | testes de falha em paralelo ao núcleo puro, sem concorrência no HTML | falha não anuncia sucesso, restore recuperável; risco: formato persistido |
| 5 | Extração A10; cálculo A17; IDs A16 | 2–4 | catálogo e export após contrato comum; import parser isolado | corpus equivalente; risco: arredondamento/referências |
| 6 | Auth/tenancy/RLS A09 | contratos estáveis de 5 | plataforma em ambiente separado; UI com mock contratual | R01–R16 passando; risco: bypass de RPC/Storage |
| 7 | Vertical SaaS P01 e mídia A12 | 5–6 | catálogo, imports, exports, arquivos em paths próprios | fluxo ponta a ponta sem perda e sem acesso cruzado |
| 8 | Operação P02, desempenho A15/P03 | 7 | carga, restore e quotas com donos distintos | restore/SLO/custo medidos; risco: noisy neighbor |
| 9 | Migração piloto M5 | 7–8 | somente suporte/QA paralelos ao corte | manifesto reconciliado e rollback demonstrado |
| 10 | Expansão M6 e retirada M7 | piloto estável | migrações por tenant com limites | matriz de paridade completa e retenção definida |

Dependências representam gates; tarefas 4/5/6 podem ter preparação paralela, mas não ultrapassar seus critérios de segurança/contrato. Alterar estrutura sem baseline não é atalho aceitável.

Estimativa agregada para cadastro SaaS: 70–140 pessoa-dias, com parte de testes integrada aos módulos. Duas pessoas não reduzem automaticamente calendário pela metade; capacidade de revisão, corpus real, acesso de teste aos destinos e suporte do provedor são bloqueios. Cinco ou dez pessoas só aumentam paralelismo após extração do HTML. CRM/financeiro/produção não estão incluídos.

## Primeira etapa de implementação — escopo delimitado

**Entrega 1: segurança de IDs importados com caracterização mínima.** Implementar somente após esta auditoria, sem iniciar nesta sessão.

Escopo: capturar fonte atual com hash; montar fixtures sintéticas de backup válido e ID contendo aspas; reproduzir T13/T15; corrigir validação e atributos de `data-lid`, incluindo lista/tabela/formulário e IDs relacionados identificados no review. Usar o gerador existente apenas em saída temporária para validar variantes, sem publicar. Não trocar stack, schema, UI ou regras de referência nesse PR.

Paths de produção permitidos nesse futuro PR: `cadastro-pecas.html`, estritamente regiões de validação/escape necessárias. Paths novos permitidos: fixture e harness de segurança a definir com a primeira configuração de testes. `tools/demo.py` só muda se uma incompatibilidade comprovada impedir gerar artefato seguro; alteração separada e justificada. Não sobrescrever cópias locais sem preservar origem.

Critérios de aceite:

1. Backup válido da versão atual mantém IDs, referências e quantidade de peças.
2. ID com aspas/markup é rejeitado claramente ou mapeado de forma segura e consistente; não vira atributo nem handler.
3. Lista, tabela e formulário permanecem inertes com campos adversariais; nenhum request externo disparado pelo payload.
4. Backup inválido não altera localStorage/IndexedDB nem estado em memória.
5. Fonte e distribuições geradas passam sintaxe e smoke; evidência registra hash e testes.
6. Alteração preexistente do usuário permanece preservada; diff mostra só escopo autorizado.

Esforço: 2–4 pessoa-dias; owner UI/imports, revisão de segurança independente. Rollback: artefato anterior preservado para investigação, mas não redistribuir caminho vulnerável; se necessário desabilitar importação de backups não confiáveis até correção.

**Entregas seguintes imediatas:** A02 e A03, separadas para reduzir regressão. A primeira entrega não libera nova distribuição ampla enquanto dependências vulneráveis permanecerem. Cada upgrade precisa de fixtures de parser e exportação antes de release.

## Pacote para nova sessão/agente

Informar: commit/hash alvo, módulo, IDs do backlog, paths permitidos, contrato público, fixtures aplicáveis, critérios acima, owner revisor e pré-requisitos concluídos. A sessão deve ler 00, 08, 14 e a linha correspondente de 15, verificar Git e atualizar resultados sem reescrever decisões implicitamente.

Bloqueios conhecidos: ausência de ambiente Supabase, dados de teste de negócio aprovados, execução real em navegadores, validação atual nos destinos Bling/Jueri e semântica do banco do provedor. Eles não impedem contenção local, mas impedem afirmar prontidão comercial multi-tenant hoje.
