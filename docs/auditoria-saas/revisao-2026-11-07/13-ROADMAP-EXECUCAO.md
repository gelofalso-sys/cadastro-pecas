# 13 — Roadmap de execução

## Sequência obrigatória

| Ordem | Marco / backlog | Pré-requisito | Paralelismo permitido | Conclusão objetiva / risco |
|---|---|---|---|---|
| 1 | Baseline M0, corpus T01–T14, hash e backup | acesso ao snapshot correto | inventário e fixtures sem editar HTML | backup legível/contagens; risco: auditar versão divergente |
| 2 | Contenção A03, gate A18 e integridade A01 | 1 | fixtures e pesquisa de dependências; integração HTML serial | payload inerte + PDF/XLSX compatíveis; risco: regressão de parser |
| 3 | Build A14 e ampliação dos testes; limites A11 | 1–2 | pipeline por owner separado | artefatos reproduzíveis e checks; risco: demo diferente da fonte |
| 4 | Persistência A04–A08/A19/A20 | 1 | testes de falha em paralelo ao núcleo puro, sem concorrência no HTML | falha não anuncia sucesso, restore recuperável; risco: formato persistido |
| 5 | Extração A10; cálculo A17; IDs A16 | 2–4 | catálogo e export após contrato comum; import parser isolado | corpus equivalente; risco: arredondamento/referências |
| 6 | Auth/tenancy/RLS A09 | contratos estáveis de 5 | plataforma em ambiente separado; UI com mock contratual | R01–R16 passando; risco: bypass de RPC/Storage |
| 7 | Vertical SaaS P01 e mídia A12 | 5–6 | catálogo, imports, exports, arquivos em paths próprios | fluxo ponta a ponta sem perda e sem acesso cruzado |
| 8 | Operação P02, desempenho A15/P03 | 7 | carga, restore e quotas com donos distintos | restore/SLO/custo medidos; risco: noisy neighbor |
| 9 | Migração piloto M5 | 7–8 | somente suporte/QA paralelos ao corte | manifesto reconciliado e rollback demonstrado |
| 10 | Expansão M6 e retirada M7 | piloto estável | migrações por tenant com limites | matriz de paridade completa e retenção definida |

Dependências representam gates; tarefas 4/5/6 podem ter preparação paralela, mas não ultrapassar seus critérios de segurança/contrato. Alterar estrutura sem baseline não é atalho aceitável.

Estimativa agregada para cadastro SaaS: 70–140 pessoa-dias, com parte de testes integrada aos módulos. Duas pessoas não reduzem automaticamente calendário pela metade; capacidade de revisão, corpus real, acesso de teste aos destinos e suporte do provedor são bloqueios. Cinco ou dez pessoas só aumentam paralelismo após extração do HTML. CRM/financeiro/produção não estão incluídos.

## Primeira etapa de implementação — ainda não iniciada

PR 1: tornar runner confiável e gerar wrapper temporário. Paths: tests/run_all.py e testes afetados; sem mudar regras/UI. Aceite: exit(1) sem stderr reprova; pageerror reprova; sucesso real passa; wrapper original conserva hash. Estimativa 1–3 pessoa-dias, QA.

PR 2: empacotar SheetJS corrigida e eliminar fallback 0.18.5. Paths: carregamento no HTML, tools/demo.py, biblioteca/metadados e teste de artefato. Aceite: pasta gerada isolada contém lib com hash esperado; desktop/demo nunca pedem 0.18.5; falta da biblioteca gera erro claro; CSV/XLSX mantêm cabeçalhos/tipos/fórmulas/encoding/grupos/zeros; falha de empacotamento interrompe build. Não publicar. Estimativa 2–4 pessoa-dias, release/imports, revisão de segurança.

Depois: A01 unicidade pós-normalização; A06/A07 restore; A04/A08 persistência; A05 foto de romaneio. A02 é manutenção com mitigação já presente. Não redistribuir fallback vulnerável como rollback. Preservar alterações preexistentes e baseline de negócio.

## Pacote para nova sessão/agente

Informar: commit/hash alvo, módulo, IDs do backlog, paths permitidos, contrato público, fixtures aplicáveis, critérios acima, owner revisor e pré-requisitos concluídos. A sessão deve ler 00, 08, 14 e a linha correspondente de 15, verificar Git e atualizar resultados sem reescrever decisões implicitamente.

Bloqueios conhecidos: ausência de ambiente Supabase, dados de teste de negócio aprovados, execução real em navegadores, validação atual nos destinos Bling/Jueri e semântica do banco do provedor. Eles não impedem contenção local, mas impedem afirmar prontidão comercial multi-tenant hoje.


Revisão de 07/11/2026. Auditoria e proposta, sem implementação. Snapshot/âncoras em [01](01-INVENTARIO-SISTEMA.md); histórico preservado no diretório pai.
