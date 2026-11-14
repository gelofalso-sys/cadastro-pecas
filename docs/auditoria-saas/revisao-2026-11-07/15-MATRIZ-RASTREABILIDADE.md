# 15 — Matriz de rastreabilidade e paridade

Estado de toda migração: **não iniciada**. Existência abaixo é CONFIRMADA por código salvo indicação; funcionamento integral continua dependente de teste dinâmico. H = `cadastro-pecas.html`. Testes são definidos em 10; autorização em 05.

| Funcionalidade atual / evidência | Destino | Teste | Lacuna / condição de migração |
|---|---|---|---|
| Peça bruta/pronta, H (âncoras em 01) | catalog domain/editor | T01/T02 | tipar entrada e preservar regras de geração |
| Numeração automática/manual/zeros, H (âncoras em 01) | catalog references + counters | T01/T18 | concorrência transacional; referências antigas não mudam |
| Categoria/subcategoria/prefixos, H (âncoras em 01) | catalog settings | T01/T07 | FK/ID estável, preservar nomes e subprefixos |
| Fornecedor/memória de campos, H (âncoras em 01) | catalog suppliers/editor | T02/T08 | defaults não sobrescrevem edição explícita |
| Banhos/grades/variações, H (âncoras em 01) | catalog domain | T02 | combinações sem quantidade e overrides |
| Conjuntos e soma de componentes, função conjCalc | catalog components | T03/T04 | não inventar BOM de produção; preservar cálculo existente |
| Preço, custo e fórmula, H (âncoras em 01) | catalog pricing / exports | T04/T05 | formalizar arredondamento e diferença decimal |
| Lista e tabela virtualizada, H (âncoras em 01) | catalog presentation | T08/T16 | comportamento de seleção/altura/foto |
| Colar TSV/copiar/preencher, funções lerTsv/colarCel/preencherAbaixo | catalog editor | T08/T15 | locale, fórmula segura e seleção |
| Editar/cancelar/duplicar/excluir linha, H (âncoras em 01) | catalog commands/editor | T08/T18 | diferença entre linha variante e peça |
| Undo/redo, H (âncoras em 01) | editor local history | T08/T12 | não confundir desfazer UI com estornar transação remota |
| Filtros, vista, zoom e preferências, H (âncoras em 01) | usuário + tenant preferences | T08/T16 | cache/prefs não misturam empresas |
| Jueri padrão, H (âncoras em 01) | exports/jueri | T05 | validar destino externo em conta teste |
| Bling 59 colunas e agrupamento, H (âncoras em 01) | exports/bling | T06 | compatibilidade externa atual NÃO VERIFICADA |
| Modelo “Outro sistema”, funções abrirNovoSistema/modeloDeJson | exports/custom-model | T07 | schema e versão, não executar fórmula arbitrária |
| Lotes, CSV/XLSX/clipboard, H (âncoras em 01) | exports | T05–T07/T15 | encoding, tipos, ordem e segurança |
| Importar cadastros/últimas referências, H (âncoras em 01) | imports/spreadsheet | T01/T07/T15 | fallback SheetJS antigo deve ser eliminado; local é 0.20.3 |
| Romaneio texto/modelo automático, funções lerRomaneio/lerRomaneioAuto | imports/parsers | T09 | corpus por fornecedor e formato |
| Romaneio PDF e fotos, H (âncoras em 01) | imports/pdf + media | T09/T11/T15 | preservar mitigação PDF/limites existentes e planejar atualização |
| Revisão/lote/retomar/refazer, H (âncoras em 01) | imports/application/UI | T09/T12/T18 | confirmação idempotente e relatório de ignorados |
| NF XML/PDF, H (âncoras em 01) | imports/nfe | T10 | parser não valida autenticidade fiscal; não prometer emissão |
| Deduplicação NF, H (âncoras em 01) | imports/documents | T10/T17 | exceção explícita e auditável; vínculo não pode depender de wrapper |
| Fotos manuais/lote/clipboard, H (âncoras em 01) | media | T11 | fotoNaPeca verifica falha; romCriar não aguarda original |
| imgbb, H (âncoras em 01) | media publication adapter | T11/R12 | público/privado e segredo por tenant |
| Histórico de romaneios/tabelas, H (âncoras em 01) | archives | T14 | preservar snapshots, fotos e autoria legada |
| Relatório e CSV, H (âncoras em 01) | archives/reporting | T14/T15 | totais e fórmulas neutralizadas |
| Backup cadastros/completo, H (âncoras em 01) | archives/backup | T13 | export marca INCOMPLETO; restore precisa tratar a marca |
| Restore/migração local, H (âncoras em 01) | archives/migration | T13/T17 | crash recovery e associação explícita tenant |
| Salvamento e provedor Claude, H (âncoras em 01) | persistence adapters | T12/T18 | contrato do provedor NÃO VERIFICADO; estratégia de retirada |
| Conflito entre abas, H (âncoras em 01) | editor concurrency | T12/T18 | aviso pós-write não é compare-and-swap |
| Demo e versão Chrome, G e LEIA-ME | release build targets | T15/T16 | proveniência e paridade dos artefatos |
| Identidade, memberships, RLS | identity/tenancy (novo) | R01–R16 | não implementado no app disponível |
| CRM/pedidos/contratos | commercial (futuro) | a definir após descoberta | NÃO VERIFICADO como existente; não criar nesta migração |
| Estoque/compras operacionais | inventory (futuro) | a definir | quantidade em catálogo não é livro de movimentos |
| Financeiro/caixa/conciliação/DRE | finance (futuro) | casos financeiros de 10 | NÃO VERIFICADO; custo/preço não é razão financeiro |
| Produção/apontamento/agenda | production/scheduling (futuro) | a definir | NÃO VERIFICADO |
| Pós-venda/garantias/chamados | after-sales (futuro) | a definir | NÃO VERIFICADO |

## Funcionalidades adicionais verificadas nesta revisão

| Funcionalidade | Evidência | Destino/testes | Lacuna |
|---|---|---|---|
| Fila de arquivos e duplicidade por hash | impHash/impAdd; tests/t30.py | imports; T09/T17 | hash fallback não é identidade global |
| Lotes por peso e rateio | tests/t31.py, 15 itens e 7 lotes | imports/catalog; T04/T09 | soma peso/custo e arredondamento |
| Várias linhas editáveis antes de lançar | tests/t32.py; multiPanel | catalog/editor; T08 | preservar confirmação explícita |
| Pontos de recuperação e backup em pasta | pontoRestaurar/bkAuto | archives; T12/T13 | permissões e recuperação de crash |

T01–T18 são especificações de 10, não nomes dos arquivos Python. Testes existentes não foram executados nesta revisão.

## Checklist de passagem por funcionalidade

Cada linha implementada deve receber: owner, PR/commit, fixture, resultado antigo/novo, permissão, versão do contrato, migration aplicável e rollback testado. Não marcar “migrado” porque existe tela nova. Funcionalidade sem teste de negócio aprovado mantém estado pendente.

Cobertura documental do pedido: inventário/legado (01), stack (02), estrutura (03), multi-equipe (08), banco/RLS (04/05), OWASP (06), performance/FinOps (07), integridade (04/06), testes (10), operação (11), migração (09), backlog/roadmap (12/13), ADR/revisão adversarial (14). Lacunas de verificação são explícitas no resumo e não foram convertidas em garantias.

Revisão de 07/11/2026. Linhas antigas foram substituídas por âncoras do inventário atual. Migração SaaS não iniciada.
