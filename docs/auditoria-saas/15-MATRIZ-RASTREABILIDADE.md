# 15 — Matriz de rastreabilidade e paridade

Estado de toda migração: **não iniciada**. Existência abaixo é CONFIRMADA por código salvo indicação; funcionamento integral continua dependente de teste dinâmico. H = `cadastro-pecas.html`. Testes são definidos em 10; autorização em 05.

| Funcionalidade atual / evidência | Destino | Teste | Lacuna / condição de migração |
|---|---|---|---|
| Peça bruta/pronta, H:1290/3456 | catalog domain/editor | T01/T02 | tipar entrada e preservar regras de geração |
| Numeração automática/manual/zeros, H:1271/1290 | catalog references + counters | T01/T18 | concorrência transacional; referências antigas não mudam |
| Categoria/subcategoria/prefixos, H:1216/3963 | catalog settings | T01/T07 | FK/ID estável, preservar nomes e subprefixos |
| Fornecedor/memória de campos, H:3379–3399 | catalog suppliers/editor | T02/T08 | defaults não sobrescrevem edição explícita |
| Banhos/grades/variações, H:1223–1250/1312–1338 | catalog domain | T02 | combinações sem quantidade e overrides |
| Conjuntos e soma de componentes, função conjCalc | catalog components | T03/T04 | não inventar BOM de produção; preservar cálculo existente |
| Preço, custo e fórmula, H:1355–1480 | catalog pricing / exports | T04/T05 | formalizar arredondamento e diferença decimal |
| Lista e tabela virtualizada, H:1706–1744 | catalog presentation | T08/T16 | comportamento de seleção/altura/foto |
| Colar TSV/copiar/preencher, funções lerTsv/colarCel/preencherAbaixo | catalog editor | T08/T15 | locale, fórmula segura e seleção |
| Editar/cancelar/duplicar/excluir linha, H:3496–3568 | catalog commands/editor | T08/T18 | diferença entre linha variante e peça |
| Undo/redo, H:1482/3496 | editor local history | T08/T12 | não confundir desfazer UI com estornar transação remota |
| Filtros, vista, zoom e preferências, H:1193/1661/1675 | usuário + tenant preferences | T08/T16 | cache/prefs não misturam empresas |
| Jueri padrão, H:1111/1122 | exports/jueri | T05 | validar destino externo em conta teste |
| Bling 59 colunas e agrupamento, H:1113–1121/1408 | exports/bling | T06 | compatibilidade externa atual NÃO VERIFICADA |
| Modelo “Outro sistema”, funções abrirNovoSistema/modeloDeJson | exports/custom-model | T07 | schema e versão, não executar fórmula arbitrária |
| Lotes, CSV/XLSX/clipboard, H:3595–3651 | exports | T05–T07/T15 | encoding, tipos, ordem e segurança |
| Importar cadastros/últimas referências, H:3660–3679 | imports/spreadsheet | T01/T07/T15 | SheetJS vulnerável antes da migração |
| Romaneio texto/modelo automático, funções lerRomaneio/lerRomaneioAuto | imports/parsers | T09 | corpus por fornecedor e formato |
| Romaneio PDF e fotos, H:2891–2937 | imports/pdf + media | T09/T11/T15 | atualizar parser e impor orçamento |
| Revisão/lote/retomar/refazer, H:2736–2889/3003 | imports/application/UI | T09/T12/T18 | confirmação idempotente e relatório de ignorados |
| NF XML/PDF, H:3020–3199 | imports/nfe | T10 | parser não valida autenticidade fiscal; não prometer emissão |
| Deduplicação NF, H:3114/3188/3201 | imports/documents | T10/T17 | exceção explícita e auditável; vínculo não pode depender de wrapper |
| Fotos manuais/lote/clipboard, H:3403–3436 | media | T11 | falha IDB hoje não propagada em todos caminhos |
| imgbb, H:2957–3002 | media publication adapter | T11/R12 | público/privado e segredo por tenant |
| Histórico de romaneios/tabelas, H:2520–2609 | archives | T14 | preservar snapshots, fotos e autoria legada |
| Relatório e CSV, H:3243–3287 | archives/reporting | T14/T15 | totais e fórmulas neutralizadas |
| Backup cadastros/completo, H:2610/3681 | archives/backup | T13 | manifesto; erros não equivalem a store vazia |
| Restore/migração local, H:1536–1616/2703 | archives/migration | T13/T17 | crash recovery e associação explícita tenant |
| Salvamento e provedor Claude, H:1501–1652 | persistence adapters | T12/T18 | contrato do provedor NÃO VERIFICADO; estratégia de retirada |
| Conflito entre abas, H:4199–4209 | editor concurrency | T12/T18 | aviso pós-write não é compare-and-swap |
| Demo e versão Chrome, G e LEIA-ME | release build targets | T15/T16 | proveniência e paridade dos artefatos |
| Identidade, memberships, RLS | identity/tenancy (novo) | R01–R16 | não implementado no app disponível |
| CRM/pedidos/contratos | commercial (futuro) | a definir após descoberta | NÃO VERIFICADO como existente; não criar nesta migração |
| Estoque/compras operacionais | inventory (futuro) | a definir | quantidade em catálogo não é livro de movimentos |
| Financeiro/caixa/conciliação/DRE | finance (futuro) | casos financeiros de 10 | NÃO VERIFICADO; custo/preço não é razão financeiro |
| Produção/apontamento/agenda | production/scheduling (futuro) | a definir | NÃO VERIFICADO |
| Pós-venda/garantias/chamados | after-sales (futuro) | a definir | NÃO VERIFICADO |

## Checklist de passagem por funcionalidade

Cada linha implementada deve receber: owner, PR/commit, fixture, resultado antigo/novo, permissão, versão do contrato, migration aplicável e rollback testado. Não marcar “migrado” porque existe tela nova. Funcionalidade sem teste de negócio aprovado mantém estado pendente.

Cobertura documental do pedido: inventário/legado (01), stack (02), estrutura (03), multi-equipe (08), banco/RLS (04/05), OWASP (06), performance/FinOps (07), integridade (04/06), testes (10), operação (11), migração (09), backlog/roadmap (12/13), ADR/revisão adversarial (14). Lacunas de verificação são explícitas no resumo e não foram convertidas em garantias.
