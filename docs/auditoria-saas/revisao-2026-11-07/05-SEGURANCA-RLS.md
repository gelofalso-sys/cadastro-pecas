# 05 — Isolamento multi-tenant e autorização

## Inventário auditado

| Superfície atual | Estado |
|---|---|
| Tabelas PostgreSQL, policies, grants, views, RPCs, SECURITY DEFINER | NÃO APLICÁVEL ao armazenamento local; nenhum SQL disponível |
| RLS do ambiente remoto Claude | NÃO VERIFICADO; a interface de documentos não revela políticas |
| Bucket Supabase / service_role / Data API | NÃO APLICÁVEL ao código inspecionado |
| Separação de empresas em localStorage | Chaves fixas CONFIRMADAS; não existe isolamento empresarial demonstrado |
| AUTOR / histórico | Texto local; não comprova identidade autenticada |

Não há evidência para afirmar “tabelas sem RLS” ou vazamento entre contas do provedor. A09 é lacuna de prontidão SaaS, não vulnerabilidade comprovada no backend externo.

## Política de destino

Definir `can(user, tenant, permission)` usando identidade autenticada, membership ativo, tenant ativo e papel associado àquela membership. Não aceitar roles ou tenant de `user_metadata` editável como autoridade. Troca de empresa limpa caches, subscriptions e rascunhos visíveis; todo comando continua validado. Remover membership deve impedir a próxima consulta mesmo com JWT ainda válido; testar isso no banco, não esperar expiração.

RLS habilitada em todas as tabelas empresariais expostas. Revisar proprietários e papéis que ignoram RLS; aplicação nunca roda com owner/superuser. Para cada operação: SELECT/DELETE `USING`; INSERT `WITH CHECK`; UPDATE ambos, além da imutabilidade de tenant. Privilégios de coluna e comandos restritos impedem mass assignment de owner, tenant, saldo e papel.

Policies permissivas se combinam por OR: uma policy ampla pode invalidar restrição de outra. Catálogo de políticas em CI deve enumerar comando, papel, expressão e justificativa, não só contar `ENABLE ROW LEVEL SECURITY`.

| Grupo de tabelas proposto | SELECT | Escritas |
|---|---|---|
| tenants/memberships/profiles | próprias participações e dados mínimos de colegas autorizados | criar/suspender/vincular via comando específico; sem autoelevação |
| roles/role_permissions/membership_roles/invitations | administrador da empresa, ou projeção mínima necessária | apenas administrador com limite de concessão; impedir remover último owner |
| products/variants/settings/suppliers/categories | permissão catalog.read no tenant | catalog.write; arquivar requer catalog.archive |
| import_batches/rows/documents | imports.read | imports.create/confirm; estado final só por comando |
| saved_tables | archives.read | archives.create; restauração requires archives.restore |
| media_assets / storage.objects | media.read e vínculo autorizado | media.write; path + metadata + bucket correspondem ao tenant |
| audit_events | audit.read | somente append pelo servidor/RPC restrita; usuário não altera/apaga |
| idempotency/outbox/migration_maps | sem leitura ampla pela Data API | internos, schemas não expostos; comandos autorizados |

Não publicar views com contexto privilegiado por acidente; usar security invoker quando suportado e testado ou revogar acesso. RPCs preferem SECURITY INVOKER. Se DEFINER for inevitável: owner mínimo, nomes qualificados, `search_path` fixo seguro, REVOKE EXECUTE de PUBLIC/anon, grant somente necessário, validar `auth.uid()`/tenant/permissão dentro da função. Helper de membership não deve causar recursão de RLS; isolar consulta restrita em schema privado e testar negação.

Referência: [RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) e [segurança de funções](https://supabase.com/docs/guides/database/functions). A proposta exige verificar bypass de papéis e execução das funções em testes; não basta filtro de aplicação.

## Matriz de permissões por módulo

Papéis são proposta inicial; negar por padrão. Administrador da plataforma não herda acesso ao conteúdo dos tenants.

| Módulo / ação | Leitor | Operador | Gestor | Admin empresa | Suporte plataforma |
|---|---|---|---|---|---|
| Catálogo ler | Sim | Sim | Sim | Sim | Não |
| Catálogo editar | Não | Sim | Sim | Sim | Não |
| Catálogo arquivar | Não | Não | Sim | Sim | Não |
| Romaneio/NF revisar/criar | Não | Sim | Sim | Sim | Não |
| Confirmar/reimportar exceção | Não | Confirmar normal | Sim, com motivo | Sim, com motivo | Não |
| Exportar dados | Não por padrão | Sim | Sim | Sim | Não |
| Fotos privadas ler | Sim | Sim | Sim | Sim | Não |
| Fotos anexar | Não | Sim | Sim | Sim | Não |
| Publicar foto externamente | Não | Não | Sim | Sim | Não |
| Arquivos/histórico ler | Sim | Sim | Sim | Sim | Não |
| Backup/restaurar | Não | Não | Backup | Sim, reautenticação | Não |
| Configurar cálculos/modelos | Não | Não | Sim | Sim | Não |
| Gerir membros/roles/assinatura | Não | Não | Não | Sim | Só plano/status pela interface de plataforma |
| Auditoria | Não | Não | Sim | Sim | Só metadados operacionais autorizados |
| CRM/financeiro/produção/agenda/pós-venda | Não implementado | Não implementado | Não implementado | Sem permissão implícita | Não |

Suporte excepcional: ticket, motivo, prazo, aprovação operacional, escopo mínimo, audit trail e revogação. Credencial privilegiada em job não basta: o job deve conter tenant derivado de evento confiável, revalidar situação da empresa e não aceitar tenant arbitrário de payload público.

## Storage

Bucket privado, path `tenant UUID/asset UUID/variant`; validar UUID e associação em tabela. Proibir mover/copiar objeto entre tenants, sobrescrever objeto alheio e listar prefixo de outro tenant. URLs assinadas só após autorização e TTL inicial de até 60 segundos para material sensível. URL já emitida pode continuar válida até expirar; revogação imediata exige proxy/autorização por acesso ou remoção efetiva, não promessa de JWT revogado invalidar URL.

[Storage access control](https://supabase.com/docs/guides/storage/security/access-control) descreve RLS de objetos. Testar policies usando SDK real, inclusive list, download, upload, update, delete, copy/move e geração de signed URL; não apenas tabela `media_assets`.

## Especificação automatizável mínima

Fixtures: empresas A/B; adminA, operadorA, leitorA, operadorB, multiAB (gestor A/leitor B), usuário removido, tenant suspenso, anônimo e suporte. Criar pelo menos dois registros e arquivos em cada tenant. Setup privilegiado isolado; todas as asserções usam JWT real do ator e chave pública, nunca service_role.

| ID | Teste | Resultado obrigatório |
|---|---|---|
| R01 | A SELECT por ID de B, listagem e join | zero dados de B, sem metadados/signed URL |
| R02 | A INSERT com tenant B | negado, nenhuma linha criada |
| R03 | A UPDATE/DELETE de B | nenhuma linha alterada, conferir como B |
| R04 | INSERT/UPDATE A referenciando pai B | FK composta/autorizações impedem commit |
| R05 | multiAB transfere registro A→B | negado mesmo sendo membro dos dois |
| R06 | operador altera role/membership/tenant status | negado; permissão final inalterada |
| R07 | leitor chama RPC de escrita diretamente | negado; não depender do BFF |
| R08 | JWT expirado/forjado/ausente | sem acesso protegido; API 401 apropriado |
| R09 | revogar membership e reutilizar JWT válido | próxima consulta e comando negados |
| R10 | suspender/remover tenant | sem novas operações; recuperação só operacional autorizada |
| R11 | adminA tenta operar B / multiAB usa papel de A em B | negado |
| R12 | Storage: A tenta todos os métodos em B | negado; objeto íntegro; URL não emitida |
| R13 | chamadas concorrentes A/B em conexão reutilizada | nenhum contexto herdado |
| R14 | RPC DEFINER, view e endpoint administrativo | mesmo isolamento; PUBLIC/anon sem grant acidental |
| R15 | mesma consulta após troca de tenant/cache | nenhum dado anterior aparece |
| R16 | worker/replay de outbox muda tenant ou documento | rejeitado e auditado |

Nesta auditoria não foram criados arquivos de testes executáveis nem rodados testes RLS: não existe schema/ambiente, e a instrução final proíbe iniciar implementação. Esta matriz é contrato obrigatório para o primeiro PR de banco, que deve materializar os testes SQL/API/Storage antes da liberação SaaS. Teste de UPDATE/DELETE precisa verificar estado final, porque resposta sem erro pode afetar zero linhas.


Revisão de 07/11/2026. Auditoria e proposta, sem implementação. Snapshot/âncoras em [01](01-INVENTARIO-SISTEMA.md); histórico preservado no diretório pai.
